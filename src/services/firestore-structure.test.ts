import { describe, expect, it } from '@jest/globals';
import { Timestamp } from 'firebase/firestore';

import {
  bountyDocumentSchema,
  submissionDocumentSchema,
  transactionDocumentSchema,
  userDocumentSchema,
} from './firestore-structure';

const timestamp = Timestamp.fromDate(new Date('2026-01-01T00:00:00.000Z'));

describe('Firestore document schemas', () => {
  it('rejects untrusted profile roles', () => {
    const result = userDocumentSchema.safeParse({
      uid: 'user-1',
      email: 'user@example.com',
      role: 'ADMIN',
      createdAt: timestamp,
    });

    expect(result.success).toBe(false);
  });

  it('provides safe search defaults for legacy bounty records', () => {
    const result = bountyDocumentSchema.parse({
      title: 'Legacy bounty',
      description: 'A valid legacy bounty description.',
      category: 'Coding',
      difficulty: 'Beginner',
      bountyBTC: 0.01,
      deadline: timestamp,
      companyName: 'Example Company',
      companyUid: 'company-1',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    expect(result.searchTerms).toEqual([]);
    expect(result.filterFacets).toEqual([]);
    expect(result.searchSchemaVersion).toBe(0);
    expect(result.status).toBe('open');
  });

  it('rejects malformed submission content', () => {
    const result = submissionDocumentSchema.safeParse({
      bountyId: 'bounty-1',
      companyUid: 'company-1',
      bountyTitle: 'Bounty',
      bountyDescription: 'Description',
      bountyRewardBTC: 0.01,
      githubUrl: 'https://example.com/not-github',
      bitcoinAddress: 'bc1qexampleaddress',
      developerUid: 'developer-1',
      developerName: 'Developer',
      developerEmail: 'developer@example.com',
      status: 'submitted',
      createdAt: timestamp,
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid financial records', () => {
    const result = transactionDocumentSchema.safeParse({
      bountyId: 'bounty-1',
      fromUserId: 'company-1',
      toUserId: 'developer-1',
      amount: -1,
      currency: 'BTC',
      status: 'completed',
      createdAt: timestamp,
    });

    expect(result.success).toBe(false);
  });
});
