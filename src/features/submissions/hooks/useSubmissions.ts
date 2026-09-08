import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '../../../hooks/useAppContext';
import { submissionService } from '../../../services/submissions/submissionService';
import type { UserData } from '../../auth/types';
import type { SubmissionRecord, SubmitSolutionPayload } from '../types';

async function getCompanySubmissions(
  currentUser: UserData | null,
): Promise<SubmissionRecord[]> {
  if (!currentUser) {
    throw new Error('You must be signed in to view submissions.');
  }

  if (currentUser.role !== 'COMPANY') {
    throw new Error('Only companies can view submissions.');
  }

  const result = await submissionService.getSubmissionsForCompany(
    currentUser.uid,
  );

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch submissions');
  }

  return (result.submissions ?? []) as SubmissionRecord[];
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

  const result = await submissionService.getSubmissionsByDeveloperId(
    currentUser.uid,
  );

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch submissions');
  }

  return (result.submissions ?? []) as SubmissionRecord[];
}

async function submitSolution(payload: SubmitSolutionPayload) {
  const result = await submissionService.submitSolution(payload);

  if (!result.success) {
    throw new Error(result.error || 'Failed to submit solution');
  }

  return result;
}

export function useGetCompanySubmissions() {
  const { user } = useAppContext();
  const currentUser = user?.success ? user.user : null;
  const accessMessage = !currentUser
    ? 'You must be signed in to view submissions.'
    : currentUser.role !== 'COMPANY'
      ? 'Only companies can view submissions.'
      : null;

  const query = useQuery<SubmissionRecord[]>({
    queryKey: ['company-submissions', currentUser?.uid],
    enabled: !!currentUser && currentUser.role === 'COMPANY',
    queryFn: () => getCompanySubmissions(currentUser),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return {
    submissions: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    accessMessage,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export function useGetDeveloperSubmissions() {
  const { user } = useAppContext();
  const currentUser = user?.success ? user.user : null;
  const accessMessage = !currentUser
    ? 'You must be signed in to view submissions.'
    : currentUser.role !== 'DEVELOPER'
      ? 'Only developers can view submissions.'
      : null;

  const query = useQuery<SubmissionRecord[]>({
    queryKey: ['developer-submissions', currentUser?.uid],
    queryFn: () => getDeveloperSubmissions(currentUser),
    enabled: !!currentUser && currentUser.role === 'DEVELOPER',
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return {
    submissions: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    accessMessage,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export function useSubmitSolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitSolution,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['developer-submissions'],
      });
    },
  });
}
