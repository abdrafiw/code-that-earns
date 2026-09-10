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
  type QueryDocumentSnapshot,
  orderBy,
  limit,
  startAfter,
  type QueryConstraint,
  getAggregateFromServer,
  count,
  sum,
} from 'firebase/firestore';

import { auth, db } from '../../config/firebase';
import {
  bountyConverter,
  COLLECTIONS,
  userConverter,
} from '../firestore-structure';

import type { CreateBountyPayload } from '../../features/bounties/types';

import {
  createBountySearchTerms,
  BOUNTY_SEARCH_SCHEMA_VERSION,
  createBountyFilterFacets,
  getBountyFilterFacet,
  normalizeBountyFilter,
} from '../../features/bounties/utils/bountyFilters';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { toBountyDeadlineTimestamp } from '../../features/bounties/utils/bountyDeadline';

export type CompanyBountyFilters = {
  search?: string;
  category?: string;
  difficulty?: string;
};

export type PublicBountyFilters = Pick<
  CompanyBountyFilters,
  'category' | 'difficulty'
>;

export class BountyNotFoundError extends Error {
  constructor() {
    super('Bounty not found');
    this.name = 'BountyNotFoundError';
  }
}

class BountyService {
  async getCompanyBountyMetrics(companyUid: string) {
    try {
      const bountyCollection = collection(
        db,
        COLLECTIONS.BOUNTIES,
      ).withConverter(bountyConverter);
      const companyQuery = query(
        bountyCollection,
        where('companyUid', '==', companyUid),
      );
      const categories = ['Coding', 'Data Analysis', 'Blockchain'] as const;

      const [totals, ...categoryCounts] = await Promise.all([
        getAggregateFromServer(companyQuery, {
          published: count(),
          totalRewards: sum('bountyBTC'),
        }),
        ...categories.map((category) =>
          getAggregateFromServer(
            query(companyQuery, where('category', '==', category)),
            { count: count() },
          ),
        ),
      ]);
      const totalsData = totals.data();

      return {
        published: totalsData.published,
        totalRewards: totalsData.totalRewards,
        categoriesUsed: categoryCounts.filter(
          (result) => result.data().count > 0,
        ).length,
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }

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
      const userSnapshot = await getDoc(
        doc(db, COLLECTIONS.USERS, user.uid).withConverter(userConverter),
      );

      if (!userSnapshot.exists()) {
        throw new Error('Company profile not found. Please sign in again.');
      }

      const userData = userSnapshot.data();

      if (userData.role !== 'COMPANY') {
        throw new Error('Only companies can create bounties');
      }

      const companyName = userData.companyName;

      const bountyData = {
        title,
        description,
        category,
        difficulty,
        bountyBTC,
        deadline: toBountyDeadlineTimestamp(deadline),
        searchTerms: createBountySearchTerms(title, description, category),
        searchSchemaVersion: BOUNTY_SEARCH_SCHEMA_VERSION,
        filterFacets: createBountyFilterFacets(category, difficulty),
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
    filters: PublicBountyFilters = {},
    pageSize = 20,
    cursor?: QueryDocumentSnapshot<DocumentData>,
  ) {
    try {
      const constraints: QueryConstraint[] = [];
      const filterFacet = getBountyFilterFacet(
        filters.category,
        filters.difficulty,
      );
      if (filterFacet)
        constraints.push(where('filterFacets', 'array-contains', filterFacet));
      constraints.push(orderBy('createdAt', 'desc'), limit(pageSize));

      let bountyQuery = query(
        collection(db, COLLECTIONS.BOUNTIES).withConverter(bountyConverter),
        ...constraints,
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
        throw new BountyNotFoundError();
      }

      return {
        bounty: {
          id: bountySnap.id,
          ...bountySnap.data(),
        },
      };
    } catch (error: unknown) {
      if (error instanceof BountyNotFoundError) throw error;
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

      if (search) {
        constraints.push(where('searchTerms', 'array-contains', search));
      } else {
        const filterFacet = getBountyFilterFacet(category, difficulty);
        if (filterFacet) {
          constraints.push(
            where('filterFacets', 'array-contains', filterFacet),
          );
        }
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
