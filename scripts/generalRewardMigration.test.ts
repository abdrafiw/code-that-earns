import { describe, expect, it } from '@jest/globals';
import { Timestamp } from 'firebase-admin/firestore';
import {
  btcToBaseUnits,
  convertLegacyChallenge,
  convertLegacySubmission,
  mapChallengeStatus,
  mapSubmissionStatus,
} from './generalRewardMigration';

describe('general reward migration transforms', () => {
  it.each([
    [0.00000001, 1],
    [0.1, 10_000_000],
    [1.23456789, 123_456_789],
  ])('converts %p BTC without losing base units', (btc, expected) => {
    expect(btcToBaseUnits(btc)).toBe(expected);
  });

  it('maps legacy challenge fields and removes floating BTC fields', () => {
    const migrated = convertLegacyChallenge({
      title: 'Legacy challenge',
      description: 'A sufficiently detailed challenge description.',
      category: 'Coding',
      difficulty: 'Intermediate',
      rewardBTC: 0.25,
      deadline: '2030-01-01T00:00:00.000Z',
      companyUid: 'company-1',
      companyName: 'Acme',
      status: 'in-progress',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    expect(migrated).toMatchObject({
      schemaVersion: 2,
      outcome: { type: 'monetary', amountMinor: 25_000_000, currency: 'BTC' },
      winnerCount: 1,
      status: 'in_review',
    });
    expect(migrated).not.toHaveProperty('rewardBTC');
  });

  it('removes private wallet and legacy fields from submissions', () => {
    const migrated = convertLegacySubmission(
      {
        challengeId: 'challenge-1',
        challengeRewardBTC: 0.5,
        bitcoinAddress: 'legacy-private-address',
        githubUrl: 'https://github.com/example/project',
        developerUid: 'developer-1',
        status: 'reviewed',
      },
      {
        type: 'monetary',
        amountMinor: 50_000_000,
        currency: 'BTC',
        deliveryTerms: 'Legacy terms.',
      },
    );

    expect(migrated).toMatchObject({
      schemaVersion: 3,
      challengeId: 'challenge-1',
      status: 'under_review',
      publicWinnerConsent: false,
      submissionUrl: 'https://github.com/example/project',
    });
    expect(migrated).not.toHaveProperty('bitcoinAddress');
    expect(migrated).not.toHaveProperty('challengeRewardBTC');
  });

  it('rejects submissions without a usable submission URL', () => {
    expect(() =>
      convertLegacySubmission(
        { challengeId: 'challenge-1' },
        { type: 'recognition', recognitionLabel: 'Winner' },
      ),
    ).toThrow('Legacy submission has no submission URL.');
  });

  it('maps only supported lifecycle states', () => {
    expect(mapChallengeStatus('in-progress')).toBe('in_review');
    expect(mapChallengeStatus('unknown')).toBe('open');
    expect(mapSubmissionStatus('reviewed')).toBe('under_review');
    expect(mapSubmissionStatus('winner')).toBe('winner');
  });

  it('rejects malformed rewards instead of silently changing value', () => {
    expect(() => btcToBaseUnits(Number.NaN)).toThrow();
    expect(() => btcToBaseUnits(0)).toThrow();
  });
});
