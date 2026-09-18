import { CalendarDays, Inbox } from 'lucide-react';

import type { TChallenge } from '../types';
import { formatChallengeDeadline } from '../utils/challengeDeadline';
import { normalizeChallengeFilter } from '../utils/challengeFilters';
import { formatOutcome } from '../utils/formatOutcome';

const difficultyStyles: Record<string, string> = {
  beginner: 'bg-green-50 text-green-700',
  intermediate: 'bg-yellow-50 text-yellow-700',
  advanced: 'bg-red-50 text-red-700',
};

type CompanyChallengeMobileCardProps = {
  challenge: TChallenge;
};

export function CompanyChallengeMobileCard({
  challenge,
}: CompanyChallengeMobileCardProps) {
  const difficulty = normalizeChallengeFilter(challenge.difficulty);

  return (
    <li className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
            {challenge.category || 'General'}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
              difficultyStyles[difficulty] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {challenge.difficulty || 'Unspecified'}
          </span>
        </div>
        <h2 className="text-base leading-6 font-semibold wrap-break-word text-gray-950">
          {challenge.title}
        </h2>
      </header>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-1 rounded-lg bg-gray-50 p-3">
          <dt className="text-xs text-gray-500">Outcome</dt>
          <dd className="font-semibold wrap-break-word text-gray-900">
            {formatOutcome(challenge.outcome)}
          </dd>
        </div>
        <div className="space-y-1 rounded-lg bg-gray-50 p-3">
          <dt className="text-xs text-gray-500">Submissions</dt>
          <dd className="flex items-center gap-1.5 font-semibold text-gray-900">
            <Inbox aria-hidden="true" className="size-4 text-blue-500" />
            {challenge.submissions ?? 0}
          </dd>
        </div>
      </dl>

      <p className="flex items-start gap-2 border-t border-gray-100 pt-3 text-sm text-gray-600">
        <CalendarDays
          aria-hidden="true"
          className="size-4 shrink-0 text-amber-500"
        />
        <span>{formatChallengeDeadline(challenge.deadline)}</span>
      </p>
    </li>
  );
}
