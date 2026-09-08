import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  type DocumentData,
  documentId,
} from 'firebase/firestore';

import { auth, db } from '../../config/firebase';
import { COLLECTIONS } from '../firestore-structure';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { bountyService } from '../bounties/bountyService';
import type { SubmitSolutionPayload } from '../../features/submissions/types';

type Success<T extends object = object> = { success: true } & T;
type Failure = { success: false; error: string };
type Result<T extends object = object> = Success<T> | Failure;

type Developer = { id: string } & DocumentData;

function chunk<T>(arr: T[], size = 30): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

class SubmissionService {
  async submitSolution({
    githubUrl,
    bitcoinAddress,
    bountyID,
  }: SubmitSolutionPayload): Promise<
    { success: true } | { success: false; error: string }
  > {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const tokenResult = await user.getIdTokenResult();
      if (tokenResult.claims.role !== 'DEVELOPER') {
        return {
          success: false,
          error: 'Only developers can submit solutions',
        };
      }

      const submissionData = {
        bountyId: bountyID,
        githubUrl,
        bitcoinAddress,
        developerUid: user.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, COLLECTIONS.SUBMISSIONS), submissionData);

      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  async getSubmissionsByDeveloperId(developerUid: string) {
    try {
      const submissionsQuery = query(
        collection(db, COLLECTIONS.SUBMISSIONS),
        where('developerUid', '==', developerUid),
      );

      const querySnapshot = await getDocs(submissionsQuery);

      const submissions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        submissions,
      };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  async getDeveloperById(developerUid: string) {
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, developerUid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        return {
          success: false,
          error: 'Developer not found',
        };
      }

      const userData = userSnap.data();

      // Verify that this user is actually a developer
      if (userData.role !== 'DEVELOPER') {
        return {
          success: false,
          error: 'User is not a developer',
        };
      }

      return {
        success: true,
        developer: {
          id: userSnap.id,
          ...userData,
        },
      };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  /**
   * Batch-fetch multiple developers by UID in as few queries as
   * possible instead of one getDoc per developer.
   */
  async getDevelopersByIds(
    developerUids: string[],
  ): Promise<Result<{ developers: Developer[] }>> {
    if (developerUids.length === 0) {
      return { success: true, developers: [] };
    }

    try {
      const chunks = chunk(developerUids);

      const results = await Promise.all(
        chunks.map((c) =>
          getDocs(
            query(
              collection(db, COLLECTIONS.USERS),
              where(documentId(), 'in', c),
            ),
          ),
        ),
      );

      const developers: Developer[] = results
        .flatMap((snap) =>
          snap.docs.map((d): Developer => ({ id: d.id, ...d.data() })),
        )
        .filter((u): u is Developer => u.role === 'DEVELOPER');

      return { success: true, developers };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  async getSubmissionsForCompany(companyUid: string) {
    try {
      const companyBountiesResult =
        await bountyService.getBountiesByCompanyID(companyUid);

      if (!companyBountiesResult.success || !companyBountiesResult.bounties) {
        return {
          success: false,
          error: 'Failed to fetch company bounties',
        };
      }

      const bounties = companyBountiesResult.bounties as Array<
        { id: string } & DocumentData
      >;

      if (bounties.length === 0) {
        return {
          success: true,
          submissions: [],
        };
      }

      // Reuse already-fetched bounty data instead of re-querying per submission.
      const bountyById = new Map(bounties.map((b) => [b.id, b]));
      const bountyIds = bounties.map((b) => b.id);

      const submissionChunks = await Promise.all(
        chunk(bountyIds).map((idsChunk) =>
          getDocs(
            query(
              collection(db, COLLECTIONS.SUBMISSIONS),
              where('bountyId', 'in', idsChunk),
            ),
          ),
        ),
      );

      const rawSubmissions = submissionChunks.flatMap((snap) =>
        snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as { id: string } & DocumentData,
        ),
      );

      // Batch-fetch every distinct developer referenced, instead of
      // one getDoc call per submission.
      const developerUids = [
        ...new Set(rawSubmissions.map((s) => s.developerUid as string)),
      ];
      const developersResult = await this.getDevelopersByIds(developerUids);
      const developerById = new Map<string, { id: string } & DocumentData>(
        (developersResult.success ? developersResult.developers : []).map(
          (dev): [string, { id: string } & DocumentData] => [dev.id, dev],
        ),
      );

      const submissionsWithDetails = rawSubmissions.map((submissionData) => ({
        ...submissionData,
        bountyDetails:
          bountyById.get(submissionData.bountyId as string) ?? null,
        developerDetails:
          developerById.get(submissionData.developerUid as string) ?? null,
      }));

      return {
        success: true,
        submissions: submissionsWithDetails,
      };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }
}

export const submissionService = new SubmissionService();
