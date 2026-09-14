import { describe, expect, it } from '@jest/globals';

import {
  CHALLENGE_SEARCH_SCHEMA_VERSION,
  createChallengeFilterFacets,
  createChallengeSearchTerms,
} from '../utils/challengeFilters';

describe('challenge search metadata', () => {
  it('creates normalized prefixes used by backend search', () => {
    expect(createChallengeSearchTerms('React Dashboard')).toEqual(
      expect.arrayContaining(['r', 'react', 'd', 'dashboard']),
    );
  });

  it('stays within the Firestore rules limit', () => {
    const terms = createChallengeSearchTerms(
      Array.from({ length: 120 }, (_, index) => `technology${index}`).join(' '),
    );

    expect(terms).toHaveLength(100);
    expect(CHALLENGE_SEARCH_SCHEMA_VERSION).toBe(1);
  });

  it('creates facets for each supported filter combination', () => {
    expect(createChallengeFilterFacets('Coding', 'Advanced')).toEqual([
      'category:Coding',
      'difficulty:Advanced',
      'category:Coding|difficulty:Advanced',
    ]);
  });
});
