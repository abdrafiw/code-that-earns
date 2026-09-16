import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  type DocumentData,
  orderBy,
  limit,
  startAfter,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  updateDoc,
} from 'firebase/firestore';

import { httpsCallable } from 'firebase/functions';

import { auth, db, functions } from '../../config/firebase';
import {
  challengeConverter,
  COLLECTIONS,
  submissionConverter,
  userConverter,
} from '../firestore-structure';
import { getErrorMessage } from '../../utils/getErrorMessage';
import type { SubmitSolutionPayload } from '../../features/submissions/types';
import type { SubmissionDocument } from '../firestore-structure';
import { isDesignChallenge } from '../../features/challenges/constants';
import { isValidSubmissionUrl } from '../../utils/submissionUrl';
import {
  assertHttpsUrl,
  normalizeOptionalText,
  normalizePageSize,
  normalizeRequiredId,
} from '../serviceGuards';

export type CompanySubmissionPage = {
  submissions: Array<{ id: string } & SubmissionDocument>;
  cursor?: QueryDocumentSnapshot<DocumentData>;
  hasMore: boolean;
};

class SubmissionService {
  async markUnderReview(submissionId: string) {
    try {
      await updateDoc(
        doc(
          db,
          COLLECTIONS.SUBMISSIONS,
          normalizeRequiredId(submissionId, 'Submission ID'),
        ),
        {
          status: 'under_review',
          reviewedAt: serverTimestamp(),
        },
      );
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }

  async beginChallengeReview(challengeId: string) {
    try {
      const normalizedChallengeId = normalizeRequiredId(
        challengeId,
        'Challenge ID',
      );
      const challengeRef = doc(
        db,
        COLLECTIONS.CHALLENGES,
        normalizedChallengeId,
      );
      const challengeSnapshot = await getDoc(
        challengeRef.withConverter(challengeConverter),
      );
      if (!challengeSnapshot.exists()) throw new Error('Challenge not found.');
      if (challengeSnapshot.data().status === 'in_review') return;
      if (challengeSnapshot.data().status !== 'open') {
        throw new Error('This challenge can no longer enter review.');
      }
      await updateDoc(challengeRef, {
        status: 'in_review',
        updatedAt: serverTimestamp(),
      });
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }

  async finalizeWinners(
    challengeId: string,
    submissionIds: string[],
  ): Promise<void> {
    try {
      if (submissionIds.length < 1) {
        throw new Error('Select at least one winning submission.');
      }
      if (submissionIds.length > 10) {
        throw new Error('You can select at most 10 winning submissions.');
      }

      const finalize = httpsCallable(functions, 'finalizeWinners');
      await finalize({
        challengeId: normalizeRequiredId(challengeId, 'Challenge ID'),
        submissionIds: submissionIds.map((submissionId) =>
          normalizeRequiredId(submissionId, 'Submission ID'),
        ),
      });
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }

  async submitSolution({
    submissionUrl,
    liveDemoUrl,
    notes,
    publicWinnerConsent,
    challengeID,
  }: SubmitSolutionPayload): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const normalizedChallengeId = normalizeRequiredId(
        challengeID,
        'Challenge ID',
      );
      const normalizedSubmissionUrl = submissionUrl.trim();
      const normalizedLiveDemoUrl = normalizeOptionalText(liveDemoUrl);
      const normalizedNotes = normalizeOptionalText(notes);
      if (normalizedLiveDemoUrl) {
        assertHttpsUrl(normalizedLiveDemoUrl, 'Live demo URL');
      }

      const [challengeSnapshot, developerSnapshot, existingSubmissions] =
        await Promise.all([
          getDoc(
            doc(
              db,
              COLLECTIONS.CHALLENGES,
              normalizedChallengeId,
            ).withConverter(challengeConverter),
          ),
          getDoc(
            doc(db, COLLECTIONS.USERS, user.uid).withConverter(userConverter),
          ),
          getDocs(
            query(
              collection(db, COLLECTIONS.SUBMISSIONS).withConverter(
                submissionConverter,
              ),
              where('developerUid', '==', user.uid),
              where('challengeId', '==', normalizedChallengeId),
              limit(1),
            ),
          ),
        ]);

      if (!challengeSnapshot.exists()) {
        throw new Error('Challenge not found');
      }

      if (!developerSnapshot.exists()) {
        throw new Error('Developer profile not found. Please sign in again.');
      }

      if (!existingSubmissions.empty) {
        throw new Error(
          'You have already submitted a solution for this challenge.',
        );
      }

      const challenge = challengeSnapshot.data();
      const developer = developerSnapshot.data();

      if (challenge.status !== 'open') {
        throw new Error('This challenge is no longer accepting submissions.');
      }

      if (challenge.deadline.toMillis() <= Date.now()) {
        throw new Error('The submission deadline has passed.');
      }

      if (developer.role !== 'DEVELOPER') {
        throw new Error('Only developers can submit solutions');
      }

      if (!developer.name?.trim() || !developer.email?.trim()) {
        throw new Error('Complete your developer profile before submitting.');
      }

      if (!isValidSubmissionUrl(normalizedSubmissionUrl, challenge.category)) {
        throw new Error(
          isDesignChallenge(challenge.category)
            ? 'Submit a valid Figma, Behance, or Dribbble project URL.'
            : 'Submit a valid HTTPS GitHub repository URL.',
        );
      }

      const submissionData = {
        challengeId: normalizedChallengeId,
        companyUid: challenge.companyUid,
        challengeTitle: challenge.title ?? null,
        challengeDescription: challenge.description ?? null,
        schemaVersion: 3 as const,
        challengeOutcome: challenge.outcome,
        submissionUrl: normalizedSubmissionUrl,
        ...(normalizedLiveDemoUrl
          ? { liveDemoUrl: normalizedLiveDemoUrl }
          : {}),
        ...(normalizedNotes ? { notes: normalizedNotes } : {}),
        publicWinnerConsent,
        developerUid: user.uid,
        developerName: developer.name,
        developerEmail: developer.email,
        status: 'submitted' as const,
        createdAt: serverTimestamp(),
      };

      const submissionId = `${normalizedChallengeId}_${user.uid}`;
      await setDoc(
        doc(db, COLLECTIONS.SUBMISSIONS, submissionId).withConverter(
          submissionConverter,
        ),
        submissionData,
      );
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getSubmissionsByDeveloperId(developerUid: string) {
    try {
      const normalizedDeveloperUid = normalizeRequiredId(
        developerUid,
        'Developer ID',
      );
      const submissionsQuery = query(
        collection(db, COLLECTIONS.SUBMISSIONS).withConverter(
          submissionConverter,
        ),
        where('developerUid', '==', normalizedDeveloperUid),
        orderBy('createdAt', 'desc'),
      );

      const querySnapshot = await getDocs(submissionsQuery);

      const submissions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return submissions;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getSubmissionsForCompany({
    companyUid,
    pageSize = 20,
    cursor,
  }: {
    companyUid: string;
    pageSize?: number;
    cursor?: QueryDocumentSnapshot<DocumentData>;
  }): Promise<CompanySubmissionPage> {
    try {
      const normalizedCompanyUid = normalizeRequiredId(
        companyUid,
        'Organization ID',
      );
      const normalizedPageSize = normalizePageSize(pageSize);
      const constraints: QueryConstraint[] = [
        where('companyUid', '==', normalizedCompanyUid),
        orderBy('createdAt', 'desc'),
      ];
      if (cursor) constraints.push(startAfter(cursor));
      constraints.push(limit(normalizedPageSize));

      const snapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.SUBMISSIONS).withConverter(
            submissionConverter,
          ),
          ...constraints,
        ),
      );

      return {
        submissions: snapshot.docs.map((submission) => ({
          id: submission.id,
          ...submission.data(),
        })),
        cursor: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === normalizedPageSize,
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const submissionService = new SubmissionService();
