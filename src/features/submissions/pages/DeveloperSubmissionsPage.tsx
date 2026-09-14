import { PageSkeleton } from '../../../components/common/PageSkeleton';
import { PageEmptyState } from '../../../components/common/PageEmptyState';
import { PageErrorState } from '../../../components/common/PageErrorState';
import { useGetDeveloperSubmissions } from '../hooks/useSubmissions';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { DeveloperSubmissionCard } from '../components/DeveloperSubmissionCard';

export function DeveloperSubmissionsPage() {
  const submissionsQuery = useGetDeveloperSubmissions();
  const submissions = submissionsQuery.data ?? [];

  if (submissionsQuery.isPending) return <PageSkeleton variant="submissions" />;
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
          description="You haven't submitted any solutions yet."
          actionHref="/challenges"
          actionLabel="Browse challenges"
        />
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <h2 className="text-2xl font-bold text-gray-900">My Submissions</h2>

      <ul className="space-y-4">
        {submissions.map((submission) => (
          <DeveloperSubmissionCard
            key={submission.id}
            submission={submission}
          />
        ))}
      </ul>
    </div>
  );
}

export default DeveloperSubmissionsPage;
