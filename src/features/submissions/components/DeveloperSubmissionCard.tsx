import { ExternalLink } from 'lucide-react';
import type { SubmissionRecord } from '../types';
import {
  getSubmissionStatusColor,
  getSubmissionStatusIcon,
} from '../utils/submissionStatus';
import { getStoredSubmissionUrl } from '../../../utils/submissionUrl';

export function DeveloperSubmissionCard({
  submission,
}: {
  submission: SubmissionRecord;
}) {
  const submissionUrl = getStoredSubmissionUrl(submission);

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {submission.challengeTitle ?? 'Challenge submission'}
          </h3>
          <p className="text-xs text-gray-500">Submission {submission.id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getSubmissionStatusColor(submission.status ?? 'submitted')}`}
          >
            {getSubmissionStatusIcon(submission.status ?? 'submitted')}
            {(submission.status ?? 'submitted').replace('_', ' ')}
          </span>
          <time className="text-sm text-gray-400">
            {submission.createdAt?.toDate?.().toLocaleDateString() ??
              'Date unavailable'}
          </time>
        </div>
      </header>

      <dl className="mt-5 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-gray-600">Submission link</dt>
          <dd>
            <a
              href={submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 break-all text-blue-600 underline hover:text-blue-800"
            >
              {submissionUrl}
              <ExternalLink aria-hidden="true" className="size-3" />
            </a>
          </dd>
        </div>

        {submission.liveDemoUrl && (
          <div>
            <dt className="font-medium text-gray-600">Live demo</dt>
            <dd>
              <a
                href={submission.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 break-all text-blue-600 underline hover:text-blue-800"
              >
                {submission.liveDemoUrl}
                <ExternalLink aria-hidden="true" className="size-3" />
              </a>
            </dd>
          </div>
        )}

        {submission.notes && (
          <div>
            <dt className="font-medium text-gray-600">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-600">
              {submission.notes}
            </dd>
          </div>
        )}
      </dl>
    </li>
  );
}
