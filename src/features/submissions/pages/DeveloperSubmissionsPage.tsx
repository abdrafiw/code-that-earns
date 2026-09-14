import { PageSkeleton } from '../../../components/common/PageSkeleton';
import { PageEmptyState } from '../../../components/common/PageEmptyState';
import { PageErrorState } from '../../../components/common/PageErrorState';
import { useGetDeveloperSubmissions } from '../hooks/useSubmissions';
import { getErrorMessage } from '../../../utils/getErrorMessage';

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
          <li
            key={submission.id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Submission ID: {submission.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Challenge ID: {submission.challengeId}
                  </p>
                </div>

                <p className="text-sm text-gray-400">
                  {submission.createdAt?.toDate
                    ? submission.createdAt.toDate().toLocaleDateString()
                    : 'Date not available'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">
                    GitHub URL:
                  </span>
                  <a
                    href={submission.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 break-all text-blue-600 underline hover:text-blue-800"
                  >
                    {submission.githubUrl}
                  </a>
                </div>

                {submission.liveDemoUrl && <a href={submission.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View live demo</a>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DeveloperSubmissionsPage;
