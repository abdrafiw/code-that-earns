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

export type CompanySubmissionPage = {
  submissions: Array<{ id: string } & SubmissionDocument>;
  cursor?: QueryDocumentSnapshot<DocumentData>;
  hasMore: boolean;
};

class SubmissionService {
  async markUnderReview(submissionId: string) {
    await updateDoc(doc(db, COLLECTIONS.SUBMISSIONS, submissionId), {
      status: 'under_review',
      reviewedAt: serverTimestamp(),
    });
  }

  async beginChallengeReview(challengeId: string) {
    const challengeRef = doc(db, COLLECTIONS.CHALLENGES, challengeId);
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
  }

  async finalizeWinners(challengeId: string, submissionIds: string[]) {
    const finalize = httpsCallable(functions, 'finalizeWinners');
    await finalize({ challengeId, submissionIds });
  }

  async submitSolution({
    githubUrl,
    liveDemoUrl,
    notes,
    publicWinnerConsent,
    challengeID,
  }: SubmitSolutionPayload): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const [challengeSnapshot, developerSnapshot, existingSubmissions] =
        await Promise.all([
          getDoc(
            doc(db, COLLECTIONS.CHALLENGES, challengeID).withConverter(
              challengeConverter,
            ),
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
              where('challengeId', '==', challengeID),
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

      if (developer.role !== 'DEVELOPER') {
        throw new Error('Only developers can submit solutions');
      }

      if (!developer.name?.trim() || !developer.email?.trim()) {
        throw new Error('Complete your developer profile before submitting.');
      }

      const submissionData = {
        challengeId: challengeID,
        companyUid: challenge.companyUid,
        challengeTitle: challenge.title ?? null,
        challengeDescription: challenge.description ?? null,
        schemaVersion: 2 as const,
        challengeOutcome: challenge.outcome,
        githubUrl,
        ...(liveDemoUrl ? { liveDemoUrl } : {}),
        ...(notes ? { notes } : {}),
        publicWinnerConsent,
        developerUid: user.uid,
        developerName: developer.name,
        developerEmail: developer.email,
        status: 'submitted' as const,
        createdAt: serverTimestamp(),
      };

      const submissionId = `${challengeID}_${user.uid}`;
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
      const submissionsQuery = query(
        collection(db, COLLECTIONS.SUBMISSIONS).withConverter(
          submissionConverter,
        ),
        where('developerUid', '==', developerUid),
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
      const constraints: QueryConstraint[] = [
        where('companyUid', '==', companyUid),
        orderBy('createdAt', 'desc'),
      ];
      if (cursor) constraints.push(startAfter(cursor));
      constraints.push(limit(pageSize));

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
        hasMore: snapshot.docs.length === pageSize,
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const submissionService = new SubmissionService();
