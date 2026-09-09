import { User, DollarSign, ExternalLink } from 'lucide-react';
import { useGetCompanySubmissions } from '../hooks/useSubmissions';
import { AccessDeniedState } from '../../../components/common/AccessDeniedState';
import { PageSkeleton } from '../../../components/common/PageSkeleton';
import { PageEmptyState } from '../../../components/common/PageEmptyState';
import { PageErrorState } from '../../../components/common/PageErrorState';
import { Button } from '../../../components/ui/button';
import {
  getSubmissionStatusColor,
  getSubmissionStatusIcon,
} from '../utils/submissionStatus';

export function CompanySubmissionsPage() {
  const {
    submissions,
    loading,
    error,
    accessMessage,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetCompanySubmissions();

  if (loading) return <PageSkeleton variant="company-submissions" />;
  if (accessMessage) return <AccessDeniedState message={accessMessage} />;
  if (error) return <PageErrorState message={error} />;
  if (submissions.length === 0)
    return (
      <PageEmptyState
        title="No submissions found"
        description="Submissions made to your company's bounties will appear here."
      />
    );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">
        Developer Submissions
      </h2>

      <ul className="space-y-4">
        {submissions.map((submission) => (
          <li
            key={submission.id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Submission ID: {submission.id}
                </h3>

                <p className="text-sm text-gray-500">
                  Bounty ID: {submission.bountyId}
                </p>

                {submission.bountyTitle && (
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">Bounty:</span>{' '}
                    {submission.bountyTitle}
                  </p>
                )}
              </div>

              <div className="ml-4 flex flex-col items-end space-y-2">
                <div className="text-sm text-gray-400">
                  {submission.createdAt?.toDate
                    ? submission.createdAt.toDate().toLocaleDateString()
                    : 'Date not available'}
                </div>

                {submission.status && (
                  <div className="flex items-center">
                    {getSubmissionStatusIcon(submission.status)}
                    <span
                      className={`ml-2 rounded-full border px-3 py-1 text-xs font-medium ${getSubmissionStatusColor(
                        submission.status,
                      )}`}
                    >
                      {submission.status.charAt(0).toUpperCase() +
                        submission.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {(submission.developerName || submission.developerEmail) && (
                <div className="flex items-center text-sm">
                  <User className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-600">Developer:</span>

                  <span className="ml-2 text-gray-900">
                    {submission.developerName ||
                      submission.developerEmail ||
                      'Unknown Developer'}
                  </span>

                  {submission.developerEmail && submission.developerName && (
                    <span className="ml-1 text-gray-500">
                      ({submission.developerEmail})
                    </span>
                  )}
                </div>
              )}

              {submission.bountyRewardBTC != null && (
                <div className="flex items-center text-sm">
                  <DollarSign className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-600">Reward:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {submission.bountyRewardBTC} BTC
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <div className="">
                  <span className="text-sm font-medium text-gray-600">
                    GitHub URL:
                  </span>
                  <a
                    href={submission.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center break-all text-blue-600 underline hover:text-blue-800"
                  >
                    {submission.githubUrl}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>

                <div className="">
                  <span className="text-sm font-medium text-gray-600">
                    Bitcoin Address:
                  </span>
                  <span className="ml-2 font-mono text-sm break-all text-gray-900">
                    {submission.bitcoinAddress}
                  </span>
                </div>
              </div>

              {submission.bountyDescription && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Bounty Description:</span>{' '}
                    {submission.bountyDescription}
                  </p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more submissions'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default CompanySubmissionsPage;
