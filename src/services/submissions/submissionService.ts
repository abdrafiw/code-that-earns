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
} from 'firebase/firestore';

import { auth, db } from '../../config/firebase';
import {
  bountyConverter,
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
  async submitSolution({
    githubUrl,
    bitcoinAddress,
    bountyID,
  }: SubmitSolutionPayload): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const [bountySnapshot, developerSnapshot, existingSubmissions] =
        await Promise.all([
          getDoc(
            doc(db, COLLECTIONS.BOUNTIES, bountyID).withConverter(
              bountyConverter,
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
              where('bountyId', '==', bountyID),
              limit(1),
            ),
          ),
        ]);

      if (!bountySnapshot.exists()) {
        throw new Error('Bounty not found');
      }

      if (!developerSnapshot.exists()) {
        throw new Error('Developer profile not found. Please sign in again.');
      }

      if (!existingSubmissions.empty) {
        throw new Error(
          'You have already submitted a solution for this bounty.',
        );
      }

      const bounty = bountySnapshot.data();
      const developer = developerSnapshot.data();

      if (developer.role !== 'DEVELOPER') {
        throw new Error('Only developers can submit solutions');
      }

      if (!developer.name?.trim() || !developer.email?.trim()) {
        throw new Error('Complete your developer profile before submitting.');
      }

      const submissionData = {
        bountyId: bountyID,
        companyUid: bounty.companyUid,
        bountyTitle: bounty.title ?? null,
        bountyDescription: bounty.description ?? null,
        bountyRewardBTC: bounty.bountyBTC ?? null,
        githubUrl,
        bitcoinAddress,
        developerUid: user.uid,
        developerName: developer.name,
        developerEmail: developer.email,
        status: 'submitted' as const,
        createdAt: serverTimestamp(),
      };

      const submissionId = `${bountyID}_${user.uid}`;
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
