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
      <PageErrorState
        message={getErrorMessage(submissionsQuery.error)}
        onRetry={() => void submissionsQuery.refetch()}
        isRetrying={submissionsQuery.isFetching}
      />
    );
  if (submissions.length === 0)
    return (
      <PageEmptyState
        title="No submissions found"
        description="You haven't submitted any solutions yet."
        actionHref="/dev-bounties"
        actionLabel="Browse bounties"
      />
    );

  return (
    <div className="space-y-4">
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
                    Bounty ID: {submission.bountyId}
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

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">
                    Bitcoin Address:
                  </p>
                  <span className="ml-2 font-mono text-sm break-all text-gray-900">
                    {submission.bitcoinAddress}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DeveloperSubmissionsPage;
