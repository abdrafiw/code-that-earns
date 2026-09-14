import { describe, expect, it } from '@jest/globals';
import { Timestamp } from 'firebase/firestore';

import {
  challengeDocumentSchema,
  submissionDocumentSchema,
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

  it('provides safe search defaults for a challenge record', () => {
    const result = challengeDocumentSchema.parse({
      title: 'Legacy challenge',
      description: 'A valid legacy challenge description.',
      category: 'Coding',
      difficulty: 'Beginner',
      schemaVersion: 2,
      outcome: { type: 'recognition', recognitionLabel: 'Winner' },
      winnerCount: 1,
      eligibility: 'Open to all developers.',
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

  it('normalizes legacy challenge fields for read compatibility', () => {
    const result = challengeDocumentSchema.parse({
      title: 'Legacy challenge',
      description: 'A valid legacy challenge description.',
      category: 'Coding',
      difficulty: 'Beginner',
      rewardBTC: 0.25,
      deadline: timestamp,
      companyName: 'Example Company',
      companyUid: 'company-1',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    expect(result.schemaVersion).toBe(2);
    expect(result.outcome).toMatchObject({
      type: 'monetary',
      amountMinor: 25_000_000,
      currency: 'BTC',
    });
    expect(result.winnerCount).toBe(1);
    expect(result.eligibility).toBe('See the original challenge terms.');
  });

  it('normalizes legacy challenges without reward fields', () => {
    const result = challengeDocumentSchema.parse({
      title: 'Legacy recognition challenge',
      description: 'A valid legacy challenge description.',
      category: 'Coding',
      difficulty: 'Beginner',
      deadline: timestamp,
      companyName: 'Example Company',
      companyUid: 'company-1',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    expect(result.outcome).toEqual({
      type: 'recognition',
      recognitionLabel: 'Winner',
    });
  });

  it('rejects malformed submission content', () => {
    const result = submissionDocumentSchema.safeParse({
      challengeId: 'challenge-1',
      companyUid: 'company-1',
      challengeTitle: 'Challenge',
      challengeDescription: 'Description',
      schemaVersion: 2,
      challengeOutcome: { type: 'recognition', recognitionLabel: 'Winner' },
      githubUrl: 'https://example.com/not-github',
      developerUid: 'developer-1',
      developerName: 'Developer',
      developerEmail: 'developer@example.com',
      status: 'submitted',
      createdAt: timestamp,
    });

    expect(result.success).toBe(false);
  });

  it('accepts current design submissions and legacy GitHub submissions', () => {
    const common = {
      challengeId: 'challenge-1',
      companyUid: 'company-1',
      challengeTitle: 'Challenge',
      challengeDescription: 'Description',
      challengeOutcome: { type: 'recognition', recognitionLabel: 'Winner' },
      publicWinnerConsent: false,
      developerUid: 'developer-1',
      developerName: 'Developer',
      developerEmail: 'developer@example.com',
      status: 'submitted',
      createdAt: timestamp,
    };

    expect(
      submissionDocumentSchema.safeParse({
        ...common,
        schemaVersion: 3,
        submissionUrl:
          'https://www.behance.net/gallery/123456789/Product-Design',
      }).success,
    ).toBe(true);
    expect(
      submissionDocumentSchema.safeParse({
        ...common,
        schemaVersion: 2,
        githubUrl: 'https://github.com/example/project',
      }).success,
    ).toBe(true);
  });
});
