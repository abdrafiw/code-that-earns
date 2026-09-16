import { Timestamp, type DocumentData } from 'firebase-admin/firestore';
import {
  CHALLENGE_SEARCH_SCHEMA_VERSION,
  createChallengeFilterFacets,
  createChallengeSearchTerms,
} from '../src/features/challenges/utils/challengeFilters';

export const BTC_BASE_UNITS = 100_000_000;
export const MIGRATION_ID = 'provider-neutral-v2';

type MigratedCollection = 'challenges' | 'submissions';

const TARGET_SCHEMA_VERSIONS: Record<MigratedCollection, number> = {
  challenges: 2,
  submissions: 3,
};

export function hasReachedTargetSchema(
  collectionName: MigratedCollection,
  data: DocumentData,
) {
  return (
    typeof data.schemaVersion === 'number' &&
    data.schemaVersion >= TARGET_SCHEMA_VERSIONS[collectionName]
  );
}

export function btcToBaseUnits(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error('Legacy BTC reward must be a positive finite number.');
  }
  return Math.round(value * BTC_BASE_UNITS);
}

export function mapChallengeStatus(value: unknown) {
  if (value === 'in-progress') return 'in_review';
  if (value === 'completed' || value === 'cancelled') return value;
  return 'open';
}

export function mapSubmissionStatus(value: unknown) {
  if (value === 'reviewed') return 'under_review';
  if (value === 'winner' || value === 'rejected') return value;
  return 'submitted';
}

export function convertLegacyChallenge(data: DocumentData) {
  const reward = data.rewardBTC ?? data.bountyBTC;
  const { rewardBTC: _rewardBTC, bountyBTC: _bountyBTC, ...retained } = data;
  if (
    typeof data.title !== 'string' ||
    typeof data.description !== 'string' ||
    typeof data.category !== 'string' ||
    typeof data.difficulty !== 'string'
  ) {
    throw new Error('Legacy challenge is missing required text fields.');
  }
  const deadline =
    typeof data.deadline === 'string' &&
    !Number.isNaN(Date.parse(data.deadline))
      ? Timestamp.fromDate(new Date(data.deadline))
      : data.deadline;
  if (!(deadline instanceof Timestamp)) {
    throw new Error('Legacy challenge has an invalid deadline.');
  }

  return {
    ...retained,
    schemaVersion: 2 as const,
    deadline,
    outcome: {
      type: 'monetary' as const,
      amountMinor: btcToBaseUnits(reward),
      currency: 'BTC',
      deliveryTerms:
        'Legacy Bitcoin reward arranged directly with the organization.',
    },
    winnerCount:
      Number.isInteger(data.winnerCount) && data.winnerCount >= 1
        ? Math.min(data.winnerCount, 10)
        : 1,
    eligibility: data.eligibility ?? 'See the original challenge terms.',
    status: mapChallengeStatus(data.status),
    submissions:
      Number.isInteger(data.submissions) && data.submissions >= 0
        ? data.submissions
        : 0,
    searchTerms: createChallengeSearchTerms(
      data.title,
      data.description,
      data.category,
    ),
    filterFacets: createChallengeFilterFacets(data.category, data.difficulty),
    searchSchemaVersion: CHALLENGE_SEARCH_SCHEMA_VERSION,
  };
}

export function convertLegacySubmission(
  data: DocumentData,
  challengeOutcome?: DocumentData,
) {
  const challengeId = data.challengeId ?? data.bountyId;
  if (typeof challengeId !== 'string' || !challengeId) {
    throw new Error('Legacy submission has no challenge reference.');
  }
  const outcome =
    challengeOutcome ??
    (typeof (data.challengeRewardBTC ?? data.bountyRewardBTC) === 'number'
      ? {
          type: 'monetary',
          amountMinor: btcToBaseUnits(
            data.challengeRewardBTC ?? data.bountyRewardBTC,
          ),
          currency: 'BTC',
          deliveryTerms:
            'Legacy Bitcoin reward arranged directly with the organization.',
        }
      : undefined);
  if (!outcome) throw new Error('Legacy submission reward cannot be resolved.');

  const {
    bitcoinAddress: _bitcoinAddress,
    githubUrl: _githubUrl,
    bountyId: _bountyId,
    bountyTitle: _bountyTitle,
    bountyDescription: _bountyDescription,
    bountyRewardBTC: _bountyRewardBTC,
    challengeRewardBTC: _challengeRewardBTC,
    ...retained
  } = data;
  const submissionUrl = data.submissionUrl ?? data.githubUrl;
  if (typeof submissionUrl !== 'string' || !submissionUrl.trim()) {
    throw new Error('Legacy submission has no submission URL.');
  }

  return {
    ...retained,
    schemaVersion: 3 as const,
    challengeId,
    challengeTitle: data.challengeTitle ?? data.bountyTitle ?? null,
    challengeDescription:
      data.challengeDescription ?? data.bountyDescription ?? null,
    challengeOutcome: outcome,
    submissionUrl: submissionUrl.trim(),
    publicWinnerConsent: data.publicWinnerConsent === true,
    status: mapSubmissionStatus(data.status),
  };
}
