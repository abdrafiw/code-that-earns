import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  QueryDocumentSnapshot,
  type DocumentData,
  orderBy,
  limit,
  startAfter,
  documentId,
  type QueryConstraint,
} from 'firebase/firestore';

import { auth, db } from '../../config/firebase';
import { COLLECTIONS } from '../firestore-structure';

import type { CreateBountyPayload } from '../../features/bounties/types';

import {
  createBountySearchTerms,
  normalizeBountyFilter,
} from '../../features/bounties/utils/bountyFilters';
import { getErrorMessage } from '../../utils/getErrorMessage';

type Result<T extends object = object> =
  ({ success: true } & T) | { success: false; error: string };

export type CompanyBountyFilters = {
  search?: string;
  category?: string;
  difficulty?: string;
};

class BountyService {
  async createBounty({
    title,
    description,
    category,
    difficulty,
    bountyBTC,
    deadline,
  }: CreateBountyPayload): Promise<Result> {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // The user's role is stored in Firestore during signup. Do not rely on
      // custom auth claims here because the client never creates those claims.
      const userSnapshot = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));

      if (!userSnapshot.exists()) {
        return {
          success: false,
          error: 'Company profile not found. Please sign in again.',
        };
      }

      const userData = userSnapshot.data();

      if (userData.role !== 'COMPANY') {
        return { success: false, error: 'Only companies can create bounties' };
      }

      const companyName = userData.companyName as string | undefined;

      const bountyData = {
        title,
        description,
        category,
        difficulty,
        bountyBTC,
        deadline,
        searchTerms: createBountySearchTerms(title, description, category),
        companyName: companyName ?? null,
        companyUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, COLLECTIONS.BOUNTIES),
        bountyData,
      );
      return { success: true, id: docRef.id } as Result & { id: string };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  async getAllBounties(
    pageSize = 20,
    cursor?: QueryDocumentSnapshot<DocumentData>,
  ) {
    try {
      let bountyQuery = query(
        collection(db, COLLECTIONS.BOUNTIES),
        orderBy('createdAt', 'desc'),
        limit(pageSize),
      );

      if (cursor) bountyQuery = query(bountyQuery, startAfter(cursor));

      const snapshot = await getDocs(bountyQuery);

      const bounties = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      return {
        success: true,
        bounties,
        lastDoc,
        hasMore: snapshot.docs.length === pageSize,
      };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  async getBountyByID(bountyID: string) {
    try {
      const bountyDocRef = doc(db, COLLECTIONS.BOUNTIES, bountyID);
      const bountySnap = await getDoc(bountyDocRef);

      if (!bountySnap.exists()) {
        return {
          success: false,
          error: 'Bounty not found',
        };
      }

      return {
        success: true,
        bounty: {
          id: bountySnap.id,
          ...bountySnap.data(),
        },
      };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  async getBountiesByCompanyID(
    companyUid: string,
    filters: CompanyBountyFilters = {},
  ) {
    try {
      const constraints: QueryConstraint[] = [
        where('companyUid', '==', companyUid),
      ];
      const search = normalizeBountyFilter(filters.search ?? '');
      const category = filters.category ?? '';
      const difficulty = filters.difficulty ?? '';

      if (search)
        constraints.push(where('searchTerms', 'array-contains', search));
      if (category && category !== 'all') {
        constraints.push(where('category', '==', category));
      }
      if (difficulty && difficulty !== 'all') {
        constraints.push(where('difficulty', '==', difficulty));
      }

      const bountiesQuery = query(
        collection(db, COLLECTIONS.BOUNTIES),
        ...constraints,
      );

      const querySnapshot = await getDocs(bountiesQuery);

      const bounties = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        bounties,
      };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  async getCompanyById(companyUid: string) {
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, companyUid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        return {
          success: false,
          error: 'Company not found',
        };
      }

      const userData = userSnap.data();

      if (userData.role !== 'COMPANY') {
        return {
          success: false,
          error: 'User is not a company',
        };
      }

      return {
        success: true,
        company: {
          id: userSnap.id,
          ...userData,
        },
      };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }

  async getCompaniesByIds(companyUids: string[]) {
    if (companyUids.length === 0) {
      return {
        success: true,
        companies: [] as Array<{ id: string } & DocumentData>,
      };
    }

    try {
      const chunks: string[][] = [];
      for (let i = 0; i < companyUids.length; i += 30) {
        chunks.push(companyUids.slice(i, i + 30));
      }

      const results = await Promise.all(
        chunks.map((chunk) =>
          getDocs(
            query(
              collection(db, COLLECTIONS.USERS),
              where(documentId(), 'in', chunk),
            ),
          ),
        ),
      );

      const companies = results.flatMap((snap) =>
        snap.docs.map((d) => ({ id: d.id, ...d.data() })),
      );

      return { success: true, companies };
    } catch (error: unknown) {
      return { success: false, error: getErrorMessage(error) };
    }
  }
}

export const bountyService = new BountyService();
