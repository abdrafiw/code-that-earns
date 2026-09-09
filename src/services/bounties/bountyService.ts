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
  type QueryConstraint,
} from 'firebase/firestore';

import { auth, db } from '../../config/firebase';
import { bountyConverter, COLLECTIONS } from '../firestore-structure';

import type { CreateBountyPayload } from '../../features/bounties/types';

import {
  createBountySearchTerms,
  normalizeBountyFilter,
} from '../../features/bounties/utils/bountyFilters';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { toBountyDeadlineTimestamp } from '../../features/bounties/utils/bountyDeadline';

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
  }: CreateBountyPayload): Promise<{ id: string }> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      // The user's role is stored in Firestore during signup. Do not rely on
      // custom auth claims here because the client never creates those claims.
      const userSnapshot = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));

      if (!userSnapshot.exists()) {
        throw new Error('Company profile not found. Please sign in again.');
      }

      const userData = userSnapshot.data();

      if (userData.role !== 'COMPANY') {
        throw new Error('Only companies can create bounties');
      }

      const companyName = userData.companyName as string | undefined;

      const bountyData = {
        title,
        description,
        category,
        difficulty,
        bountyBTC,
        deadline: toBountyDeadlineTimestamp(deadline),
        searchTerms: createBountySearchTerms(title, description, category),
        companyName: companyName ?? null,
        companyUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, COLLECTIONS.BOUNTIES).withConverter(bountyConverter),
        bountyData,
      );
      return { id: docRef.id };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getAllBounties(
    pageSize = 20,
    cursor?: QueryDocumentSnapshot<DocumentData>,
  ) {
    try {
      let bountyQuery = query(
        collection(db, COLLECTIONS.BOUNTIES).withConverter(bountyConverter),
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

      return { bounties, lastDoc, hasMore: snapshot.docs.length === pageSize };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getBountyByID(bountyID: string) {
    try {
      const bountyDocRef = doc(
        db,
        COLLECTIONS.BOUNTIES,
        bountyID,
      ).withConverter(bountyConverter);
      const bountySnap = await getDoc(bountyDocRef);

      if (!bountySnap.exists()) {
        throw new Error('Bounty not found');
      }

      return {
        bounty: {
          id: bountySnap.id,
          ...bountySnap.data(),
        },
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
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

      constraints.push(orderBy('createdAt', 'desc'));

      const bountiesQuery = query(
        collection(db, COLLECTIONS.BOUNTIES).withConverter(bountyConverter),
        ...constraints,
      );

      const querySnapshot = await getDocs(bountiesQuery);

      const bounties = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return bounties;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const bountyService = new BountyService();
