import type {
  CompanyBountyFilters,
  PublicBountyFilters,
} from '../../services/bounties/bountyService';

export const bountyKeys = {
  all: ['bounties'] as const,
  detail: (bountyId: string | undefined) =>
    [...bountyKeys.all, 'detail', bountyId] as const,
  lists: () => [...bountyKeys.all, 'list'] as const,
  publicLists: () => [...bountyKeys.lists(), 'public'] as const,
  publicList: (filters: PublicBountyFilters) =>
    [...bountyKeys.publicLists(), filters] as const,
  companyLists: () => [...bountyKeys.lists(), 'company'] as const,
  companyList: (
    companyUid: string | undefined,
    filters: CompanyBountyFilters,
  ) => [...bountyKeys.companyLists(), companyUid, filters] as const,
  metrics: () => [...bountyKeys.all, 'metrics'] as const,
  companyMetrics: () => [...bountyKeys.metrics(), 'company'] as const,
  companyMetric: (companyUid: string | undefined) =>
    [...bountyKeys.companyMetrics(), companyUid] as const,
};
