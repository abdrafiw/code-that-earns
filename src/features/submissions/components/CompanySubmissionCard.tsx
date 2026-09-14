import { DollarSign, ExternalLink, User } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { CompanySubmissionPage } from '../../../services/submissions/submissionService';
import { formatOutcome } from '../../challenges/utils/formatOutcome';
import {
  getSubmissionStatusColor,
  getSubmissionStatusIcon,
} from '../utils/submissionStatus';
import { getStoredSubmissionUrl } from '../../../utils/submissionUrl';

type CompanySubmission = CompanySubmissionPage['submissions'][number];

type CompanySubmissionCardProps = {
  submission: CompanySubmission;
  selected: boolean;
  onReview: (submissionId: string) => void;
  onToggleWinner: (submissionId: string) => void;
};

export function CompanySubmissionCard({
  submission,
  selected,
  onReview,
  onToggleWinner,
}: CompanySubmissionCardProps) {
  const canSelect =
    submission.status === 'submitted' || submission.status === 'under_review';
  const submissionUrl = getStoredSubmissionUrl(submission);

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {submission.challengeTitle ?? 'Challenge submission'}
          </h3>
          <p className="text-sm text-gray-500">ID: {submission.id}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <time className="text-sm text-gray-400">
            {submission.createdAt?.toDate().toLocaleDateString() ??
              'Date unavailable'}
          </time>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getSubmissionStatusColor(submission.status)}`}
          >
            {getSubmissionStatusIcon(submission.status)}
            {submission.status.replace('_', ' ')}
          </span>
        </div>
      </header>

      <div className="space-y-3 text-sm">
        {submission.status === 'submitted' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReview(submission.id)}
          >
            Mark under review
          </Button>
        )}

        {canSelect && (
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleWinner(submission.id)}
            />
            Select as winner
          </label>
        )}

        <p className="flex items-center gap-2">
          <User className="size-4 text-gray-400" />
          <span className="font-medium text-gray-600">Developer:</span>
          {submission.developerName ?? submission.developerEmail ?? 'Unknown'}
        </p>

        <p className="flex items-center gap-2">
          <DollarSign className="size-4 text-gray-400" />
          <span className="font-medium text-gray-600">Outcome:</span>
          {formatOutcome(submission.challengeOutcome)}
        </p>

        <p>
          <span className="font-medium text-gray-600">Submission link:</span>{' '}
          <a
            href={submissionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 break-all text-blue-600 underline"
          >
            {submissionUrl}
            <ExternalLink aria-hidden="true" className="size-3" />
          </a>
        </p>

        {submission.liveDemoUrl && (
          <a
            href={submission.liveDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View live demo
          </a>
        )}

        {submission.notes && (
          <p className="whitespace-pre-wrap text-gray-600">
            <span className="font-medium">Notes:</span> {submission.notes}
          </p>
        )}
      </div>
    </li>
  );
}
