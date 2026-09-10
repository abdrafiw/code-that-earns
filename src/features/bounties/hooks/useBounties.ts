import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

import { bountyService } from '../../../services/bounties/bountyService';
import type { CreateBountyPayload, TBounty } from '../types';
import { transformBounty } from '../utils/transformBounty';

import type {
  CompanyBountyFilters,
  PublicBountyFilters,
} from '../../../services/bounties/bountyService';
import { bountyKeys } from '../queryKeys';

async function getBounties(
  filters: PublicBountyFilters,
  cursor?: QueryDocumentSnapshot<DocumentData>,
) {
  const response = await bountyService.getAllBounties(filters, 20, cursor);
  return {
    ...response,
    bounties: response.bounties.map(transformBounty),
  };
}

async function getCompanyBounties(
  companyUid: string,
  filters: CompanyBountyFilters,
): Promise<TBounty[]> {
  const bounties = await bountyService.getBountiesByCompanyID(
    companyUid,
    filters,
  );
  return bounties.map(transformBounty);
}

export function useGetCompanyBounties(
  companyUid: string | undefined,
  filters: CompanyBountyFilters,
) {
  return useQuery<TBounty[], Error>({
    queryKey: bountyKeys.companyList(companyUid, filters),
    queryFn: () => getCompanyBounties(companyUid!, filters),
    enabled: Boolean(companyUid),
    placeholderData: keepPreviousData,
  });
}

export function useGetBounties(filters: PublicBountyFilters = {}) {
  return useInfiniteQuery({
    queryKey: bountyKeys.publicList(filters),
    queryFn: ({ pageParam }) => getBounties(filters, pageParam),
    initialPageParam: undefined as
      QueryDocumentSnapshot<DocumentData> | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
  });
}

async function getCompanyBountyMetrics(companyUid: string) {
  return bountyService.getCompanyBountyMetrics(companyUid);
}

export function useGetCompanyBountyMetrics(companyUid?: string) {
  return useQuery({
    queryKey: bountyKeys.companyMetric(companyUid),
    queryFn: () => getCompanyBountyMetrics(companyUid!),
    enabled: Boolean(companyUid),
  });
}

async function createBounty(payload: CreateBountyPayload) {
  return bountyService.createBounty(payload);
}

export function useCreateBounty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBounty,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bountyKeys.all });
    },
  });
}
