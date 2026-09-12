import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

import { challengeService } from '../../../services/challenges/challengeService';
import type { CreateChallengePayload, TChallenge } from '../types';
import { transformChallenge } from '../utils/transformChallenge';

import type {
  CompanyChallengeFilters,
  PublicChallengeFilters,
} from '../../../services/challenges/challengeService';
import { challengeKeys } from '../queryKeys';

async function getChallenges(
  filters: PublicChallengeFilters,
  cursor?: QueryDocumentSnapshot<DocumentData>,
) {
  const response = await challengeService.getAllChallenges(filters, 20, cursor);
  return {
    ...response,
    challenges: response.challenges.map(transformChallenge),
  };
}

async function getCompanyChallenges(
  companyUid: string,
  filters: CompanyChallengeFilters,
): Promise<TChallenge[]> {
  const challenges = await challengeService.getChallengesByCompanyID(
    companyUid,
    filters,
  );
  return challenges.map(transformChallenge);
}

export function useGetCompanyChallenges(
  companyUid: string | undefined,
  filters: CompanyChallengeFilters,
) {
  return useQuery<TChallenge[], Error>({
    queryKey: challengeKeys.companyList(companyUid, filters),
    queryFn: () => getCompanyChallenges(companyUid!, filters),
    enabled: Boolean(companyUid),
    placeholderData: keepPreviousData,
  });
}

export function useGetChallenges(filters: PublicChallengeFilters = {}) {
  return useInfiniteQuery({
    queryKey: challengeKeys.publicList(filters),
    queryFn: ({ pageParam }) => getChallenges(filters, pageParam),
    initialPageParam: undefined as
      QueryDocumentSnapshot<DocumentData> | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
  });
}

async function getCompanyChallengeMetrics(companyUid: string) {
  return challengeService.getCompanyChallengeMetrics(companyUid);
}

export function useGetCompanyChallengeMetrics(companyUid?: string) {
  return useQuery({
    queryKey: challengeKeys.companyMetric(companyUid),
    queryFn: () => getCompanyChallengeMetrics(companyUid!),
    enabled: Boolean(companyUid),
  });
}

async function createChallenge(payload: CreateChallengePayload) {
  return challengeService.createChallenge(payload);
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChallenge,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: challengeKeys.all });
    },
  });
}
