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
  challengeConverter,
  COLLECTIONS,
  userConverter,
} from '../firestore-structure';

import type { CreateChallengePayload } from '../../features/challenges/types';

import {
  createChallengeSearchTerms,
  CHALLENGE_SEARCH_SCHEMA_VERSION,
  createChallengeFilterFacets,
  getChallengeFilterFacet,
  normalizeChallengeFilter,
} from '../../features/challenges/utils/challengeFilters';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { toChallengeDeadlineTimestamp } from '../../features/challenges/utils/challengeDeadline';

export type CompanyChallengeFilters = {
  search?: string;
  category?: string;
  difficulty?: string;
};

export type PublicChallengeFilters = CompanyChallengeFilters;

export class ChallengeNotFoundError extends Error {
  constructor() {
    super('Challenge not found');
    this.name = 'ChallengeNotFoundError';
  }
}

class ChallengeService {
  async getCompanyChallengeMetrics(companyUid: string) {
    try {
      const challengeCollection = collection(
        db,
        COLLECTIONS.CHALLENGES,
      ).withConverter(challengeConverter);
      const companyQuery = query(
        challengeCollection,
        where('companyUid', '==', companyUid),
      );
      const categories = ['Coding', 'Data Analysis', 'Blockchain'] as const;

      const [totals, ...categoryCounts] = await Promise.all([
        getAggregateFromServer(companyQuery, {
          published: count(),
          totalRewards: sum('rewardBTC'),
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

  async createChallenge({
    title,
    description,
    category,
    difficulty,
    rewardBTC,
    deadline,
  }: CreateChallengePayload): Promise<{ id: string }> {
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
        throw new Error('Only companies can create challenges');
      }

      const companyName = userData.companyName;

      const challengeData = {
        title,
        description,
        category,
        difficulty,
        rewardBTC,
        deadline: toChallengeDeadlineTimestamp(deadline),
        searchTerms: createChallengeSearchTerms(title, description, category),
        searchSchemaVersion: CHALLENGE_SEARCH_SCHEMA_VERSION,
        filterFacets: createChallengeFilterFacets(category, difficulty),
        companyName: companyName ?? null,
        companyUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, COLLECTIONS.CHALLENGES).withConverter(
          challengeConverter,
        ),
        challengeData,
      );
      return { id: docRef.id };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getAllChallenges(
    filters: PublicChallengeFilters = {},
    pageSize = 20,
    cursor?: QueryDocumentSnapshot<DocumentData>,
  ) {
    try {
      const constraints: QueryConstraint[] = [];
      const search = normalizeChallengeFilter(filters.search ?? '');
      if (search) {
        constraints.push(where('searchTerms', 'array-contains', search));
      } else {
        const filterFacet = getChallengeFilterFacet(
          filters.category,
          filters.difficulty,
        );
        if (filterFacet) {
          constraints.push(
            where('filterFacets', 'array-contains', filterFacet),
          );
        }
      }
      constraints.push(orderBy('createdAt', 'desc'), limit(pageSize));

      let challengeQuery = query(
        collection(db, COLLECTIONS.CHALLENGES).withConverter(
          challengeConverter,
        ),
        ...constraints,
      );

      if (cursor) challengeQuery = query(challengeQuery, startAfter(cursor));

      const snapshot = await getDocs(challengeQuery);

      const challenges = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      return {
        challenges,
        lastDoc,
        hasMore: snapshot.docs.length === pageSize,
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getChallengeByID(challengeID: string) {
    try {
      const challengeDocRef = doc(
        db,
        COLLECTIONS.CHALLENGES,
        challengeID,
      ).withConverter(challengeConverter);
      const challengeSnap = await getDoc(challengeDocRef);

      if (!challengeSnap.exists()) {
        throw new ChallengeNotFoundError();
      }

      return {
        challenge: {
          id: challengeSnap.id,
          ...challengeSnap.data(),
        },
      };
    } catch (error: unknown) {
      if (error instanceof ChallengeNotFoundError) throw error;
      throw new Error(getErrorMessage(error));
    }
  }

  async getChallengesByCompanyID(
    companyUid: string,
    filters: CompanyChallengeFilters = {},
  ) {
    try {
      const constraints: QueryConstraint[] = [
        where('companyUid', '==', companyUid),
      ];
      const search = normalizeChallengeFilter(filters.search ?? '');
      const category = filters.category ?? '';
      const difficulty = filters.difficulty ?? '';

      if (search) {
        constraints.push(where('searchTerms', 'array-contains', search));
      } else {
        const filterFacet = getChallengeFilterFacet(category, difficulty);
        if (filterFacet) {
          constraints.push(
            where('filterFacets', 'array-contains', filterFacet),
          );
        }
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const challengesQuery = query(
        collection(db, COLLECTIONS.CHALLENGES).withConverter(
          challengeConverter,
        ),
        ...constraints,
      );

      const querySnapshot = await getDocs(challengesQuery);

      const challenges = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return challenges;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const challengeService = new ChallengeService();
