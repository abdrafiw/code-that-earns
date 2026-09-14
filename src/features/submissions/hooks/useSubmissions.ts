import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useAppContext } from '../../../hooks/useAppContext';
import { submissionService } from '../../../services/submissions/submissionService';
import type { UserData } from '../../auth/types';
import type { SubmissionRecord, SubmitSolutionPayload } from '../types';
import { submissionKeys } from '../queryKeys';

async function getCompanySubmissions(
  currentUser: UserData | null,
  cursor?: QueryDocumentSnapshot<DocumentData>,
) {
  if (!currentUser) {
    throw new Error('You must be signed in to view submissions.');
  }

  if (currentUser.role !== 'COMPANY') {
    throw new Error('Only companies can view submissions.');
  }

  return submissionService.getSubmissionsForCompany({
    companyUid: currentUser.uid,
    cursor,
  });
}

async function getDeveloperSubmissions(
  currentUser: UserData | null,
): Promise<SubmissionRecord[]> {
  if (!currentUser) {
    throw new Error('You must be signed in to view submissions.');
  }

  if (currentUser.role !== 'DEVELOPER') {
    throw new Error('Only developers can view submissions.');
  }

  const submissions = await submissionService.getSubmissionsByDeveloperId(
    currentUser.uid,
  );

  return submissions;
}

async function submitSolution(payload: SubmitSolutionPayload) {
  return submissionService.submitSolution(payload);
}

export function useGetCompanySubmissions() {
  const { user } = useAppContext();
  const currentUser = user?.success ? user.user : null;
  return useInfiniteQuery({
    queryKey: submissionKeys.companyList(currentUser?.uid),
    enabled: !!currentUser && currentUser.role === 'COMPANY',
    queryFn: ({ pageParam }) => getCompanySubmissions(currentUser, pageParam),
    initialPageParam: undefined as
      QueryDocumentSnapshot<DocumentData> | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.cursor : undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useGetDeveloperSubmissions() {
  const { user } = useAppContext();
  const currentUser = user?.success ? user.user : null;
  return useQuery<SubmissionRecord[]>({
    queryKey: submissionKeys.developerList(currentUser?.uid),
    queryFn: () => getDeveloperSubmissions(currentUser),
    enabled: !!currentUser && currentUser.role === 'DEVELOPER',
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useSubmitSolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitSolution,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: submissionKeys.all,
      });
    },
  });
}

export function useMarkUnderReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submissionId: string) => submissionService.markUnderReview(submissionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: submissionKeys.all }),
  });
}

export function useFinalizeWinners() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ challengeId, submissionIds }: { challengeId: string; submissionIds: string[] }) => {
      await submissionService.beginChallengeReview(challengeId);
      return submissionService.finalizeWinners(challengeId, submissionIds);
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
