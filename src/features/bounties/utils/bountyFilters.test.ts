import { describe, expect, it } from '@jest/globals';

import {
  BOUNTY_SEARCH_SCHEMA_VERSION,
  createBountyFilterFacets,
  createBountySearchTerms,
} from './bountyFilters';

describe('bounty search metadata', () => {
  it('creates normalized prefixes used by backend search', () => {
    expect(createBountySearchTerms('React Dashboard')).toEqual(
      expect.arrayContaining(['r', 'react', 'd', 'dashboard']),
    );
  });

  it('stays within the Firestore rules limit', () => {
    const terms = createBountySearchTerms(
      Array.from({ length: 120 }, (_, index) => `technology${index}`).join(' '),
    );

    expect(terms).toHaveLength(100);
    expect(BOUNTY_SEARCH_SCHEMA_VERSION).toBe(1);
  });

  it('creates facets for each supported filter combination', () => {
    expect(createBountyFilterFacets('Coding', 'Advanced')).toEqual([
      'category:Coding',
      'difficulty:Advanced',
      'category:Coding|difficulty:Advanced',
    ]);
  });
});
