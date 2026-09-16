import { useState } from 'react';
import {
  useFinalizeWinners,
  useGetCompanySubmissions,
  useMarkUnderReview,
} from '../hooks/useSubmissions';
import { PageSkeleton } from '../../../components/common/PageSkeleton';
import { PageEmptyState } from '../../../components/common/PageEmptyState';
import { PageErrorState } from '../../../components/common/PageErrorState';
import { Button } from '../../../components/ui/button';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { toast } from 'sonner';
import { CompanySubmissionCard } from '../components/CompanySubmissionCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';

export function CompanySubmissionsPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const reviewMutation = useMarkUnderReview();
  const finalizeMutation = useFinalizeWinners();
  const submissionsQuery = useGetCompanySubmissions();
  const submissions =
    submissionsQuery.data?.pages.flatMap((page) => page.submissions) ?? [];
  const toggleWinner = (submissionId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(submissionId)) next.delete(submissionId);
      else next.add(submissionId);
      return next;
    });
  };

  const requestFinalization = () => {
    const chosen = submissions.filter((submission) =>
      selected.has(submission.id),
    );
    const challengeIds = [
      ...new Set(chosen.map((submission) => submission.challengeId)),
    ];
    if (challengeIds.length !== 1) {
      toast.error('Select winners from one challenge at a time.');
      return;
    }
    setIsConfirmOpen(true);
  };

  const finalizeSelection = () => {
    const chosen = submissions.filter((submission) =>
      selected.has(submission.id),
    );
    const challengeId = chosen[0]?.challengeId;
    if (!challengeId) return;
    finalizeMutation.mutate(
      {
        challengeId,
        submissionIds: chosen.map((submission) => submission.id),
      },
      {
        onSuccess: () => {
          setSelected(new Set());
          setIsConfirmOpen(false);
          toast.success('Winners finalized.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  if (submissionsQuery.isPending)
    return <PageSkeleton variant="company-submissions" />;
  if (submissionsQuery.error)
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageErrorState
          message={getErrorMessage(submissionsQuery.error)}
          onRetry={() => void submissionsQuery.refetch()}
          isRetrying={submissionsQuery.isFetching}
        />
      </div>
    );
  if (submissions.length === 0)
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <PageEmptyState
          title="No submissions found"
          description="Submissions made to your organization's challenges will appear here."
          actionHref="/challenges"
          actionLabel="View organization challenges"
        />
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <h2 className="text-2xl font-bold text-gray-900">
        Developer Submissions
      </h2>

      <ul className="space-y-4">
        {submissions.map((submission) => (
          <CompanySubmissionCard
            key={submission.id}
            submission={submission}
            selected={selected.has(submission.id)}
            onReview={(submissionId) =>
              reviewMutation.mutate(submissionId, {
                onError: (error) => toast.error(getErrorMessage(error)),
              })
            }
            onToggleWinner={toggleWinner}
          />
        ))}
      </ul>

      {selected.size > 0 && (
        <Button
          disabled={finalizeMutation.isPending}
          onClick={requestFinalization}
        >
          {finalizeMutation.isPending
            ? 'Finalizing…'
            : `Finalize ${selected.size} winner${selected.size === 1 ? '' : 's'}`}
        </Button>
      )}

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalize these winners?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently marks the selected submissions as winners,
              rejects all other submissions for the challenge, and closes the
              challenge. This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={finalizeMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={finalizeMutation.isPending}
              onClick={finalizeSelection}
            >
              {finalizeMutation.isPending
                ? 'Finalizing…'
                : 'Confirm finalization'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {submissionsQuery.hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => void submissionsQuery.fetchNextPage()}
            disabled={submissionsQuery.isFetchingNextPage}
          >
            {submissionsQuery.isFetchingNextPage
              ? 'Loading…'
              : 'Load more submissions'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default CompanySubmissionsPage;
