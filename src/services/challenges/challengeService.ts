import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  type DocumentData,
  type QueryDocumentSnapshot,
  orderBy,
  limit,
  startAfter,
  type QueryConstraint,
  getAggregateFromServer,
  count,
  Timestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { auth, db, functions } from '../../config/firebase';
import { challengeConverter, COLLECTIONS } from '../firestore-structure';

import type { CreateChallengePayload } from '../../features/challenges/types';
import { CHALLENGE_CATEGORIES } from '../../features/challenges/constants';

import {
  getChallengeFilterFacet,
  normalizeChallengeFilter,
} from '../../features/challenges/utils/challengeFilters';
import { getErrorMessage } from '../../utils/getErrorMessage';
import {
  assertValidDate,
  normalizePageSize,
  normalizeRequiredId,
  normalizeRequiredText,
} from '../serviceGuards';

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

function assertCreateChallengeResponse(data: unknown): { id: string } {
  if (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof data.id === 'string' &&
    data.id.trim()
  ) {
    return { id: data.id.trim() };
  }

  throw new Error('Challenge publication returned an invalid response.');
}

class ChallengeService {
  async getCompanyChallengeMetrics(companyUid: string) {
    try {
      const normalizedCompanyUid = normalizeRequiredId(
        companyUid,
        'Organization ID',
      );
      const challengeCollection = collection(
        db,
        COLLECTIONS.CHALLENGES,
      ).withConverter(challengeConverter);
      const companyQuery = query(
        challengeCollection,
        where('companyUid', '==', normalizedCompanyUid),
      );
      const categories = CHALLENGE_CATEGORIES;

      const [companyChallenges, ...categoryCounts] = await Promise.all([
        getDocs(companyQuery),
        ...categories.map((category) =>
          getAggregateFromServer(
            query(companyQuery, where('category', '==', category)),
            { count: count() },
          ),
        ),
      ]);
      const totalRewards = companyChallenges.docs.reduce(
        (total, challenge) =>
          total + (challenge.data().outcome.amountMinor ?? 0),
        0,
      );

      return {
        published: companyChallenges.size,
        totalRewards,
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
    outcome,
    winnerCount,
    eligibility,
    responsibilityAccepted,
    deadline,
  }: CreateChallengePayload): Promise<{ id: string }> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      assertValidDate(deadline, 'Deadline');
      const publish = httpsCallable<Record<string, unknown>, { id: string }>(
        functions,
        'publishChallenge',
      );
      const result = await publish({
        title: normalizeRequiredText(title, 'Title'),
        description: normalizeRequiredText(description, 'Description'),
        category: normalizeRequiredText(category, 'Category'),
        difficulty: normalizeRequiredText(difficulty, 'Difficulty'),
        outcome,
        winnerCount,
        eligibility: normalizeRequiredText(eligibility, 'Eligibility'),
        responsibilityAccepted,
        deadline: deadline.toISOString(),
      });
      return assertCreateChallengeResponse(result.data);
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
      const normalizedPageSize = normalizePageSize(pageSize);
      const constraints: QueryConstraint[] = [
        where('status', '==', 'open'),
        where('deadline', '>', Timestamp.now()),
      ];
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
      constraints.push(
        orderBy('deadline', 'asc'),
        orderBy('createdAt', 'desc'),
        limit(normalizedPageSize),
      );

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
        hasMore: snapshot.docs.length === normalizedPageSize,
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getChallengeByID(challengeID: string) {
    try {
      const normalizedChallengeId = normalizeRequiredId(
        challengeID,
        'Challenge ID',
      );
      const challengeDocRef = doc(
        db,
        COLLECTIONS.CHALLENGES,
        normalizedChallengeId,
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
      const normalizedCompanyUid = normalizeRequiredId(
        companyUid,
        'Organization ID',
      );
      const constraints: QueryConstraint[] = [
        where('companyUid', '==', normalizedCompanyUid),
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
