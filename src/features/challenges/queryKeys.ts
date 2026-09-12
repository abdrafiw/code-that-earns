import type {
  CompanyChallengeFilters,
  PublicChallengeFilters,
} from '../../services/challenges/challengeService';

export const challengeKeys = {
  all: ['challenges'] as const,
  detail: (challengeId: string | undefined) =>
    [...challengeKeys.all, 'detail', challengeId] as const,
  lists: () => [...challengeKeys.all, 'list'] as const,
  publicLists: () => [...challengeKeys.lists(), 'public'] as const,
  publicList: (filters: PublicChallengeFilters) =>
    [...challengeKeys.publicLists(), filters] as const,
  companyLists: () => [...challengeKeys.lists(), 'company'] as const,
  companyList: (
    companyUid: string | undefined,
    filters: CompanyChallengeFilters,
  ) => [...challengeKeys.companyLists(), companyUid, filters] as const,
  metrics: () => [...challengeKeys.all, 'metrics'] as const,
  companyMetrics: () => [...challengeKeys.metrics(), 'company'] as const,
  companyMetric: (companyUid: string | undefined) =>
    [...challengeKeys.companyMetrics(), companyUid] as const,
};
