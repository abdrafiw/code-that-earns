import { Award, CalendarDays, Code } from 'lucide-react';
import { formatOutcome } from '../utils/formatOutcome';
import { Link } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '../../../components/ui/card';

import { Button } from '../../../components/ui/button';
import type { TChallenge } from '../types';
import { formatChallengeDeadline } from '../utils/challengeDeadline';
import { normalizeChallengeFilter } from '../utils/challengeFilters';

const difficultyStyles: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-800',
  intermediate: 'bg-amber-100 text-amber-800',
  advanced: 'bg-rose-100 text-rose-800',
};

export const ChallengeCard = ({ challenge }: { challenge: TChallenge }) => {
  const difficulty = normalizeChallengeFilter(challenge.difficulty);

  return (
    <Card className="flex flex-col gap-0 overflow-hidden border-gray-200 py-0 shadow-none transition hover:border-gray-300 hover:shadow-sm">
      <CardHeader className="space-y-3 p-4 pb-0 sm:p-5 sm:pb-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
            {challenge.category || 'General'}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
              difficultyStyles[difficulty] ?? 'bg-gray-100 text-gray-700'
            }`}
          >
            {challenge.difficulty || 'Unspecified'}
          </span>
        </div>
        <h3 className="text-lg leading-6 font-semibold wrap-break-word text-gray-950 sm:line-clamp-2">
          {challenge.title}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 p-4 pt-3 sm:p-5 sm:pt-3">
        <p className="line-clamp-2 text-sm leading-5 text-gray-500">
          {challenge.description}
        </p>

        <div className="grid grid-cols-2 divide-x divide-gray-200 rounded-lg bg-gray-50 px-3 py-3">
          <div className="min-w-0 space-y-1 pr-3">
            <p className="text-xs text-gray-500">Reward</p>
            <p className="flex items-start gap-1.5 text-sm leading-5 font-semibold wrap-break-word text-gray-950">
              <Award
                aria-hidden="true"
                className="size-4 shrink-0 text-emerald-500"
              />
              <span>
                {formatOutcome(challenge.outcome)} · {challenge.winnerCount}{' '}
                {challenge.winnerCount === 1 ? 'winner' : 'winners'}
              </span>
            </p>
          </div>

          <div className="min-w-0 space-y-1 pl-3 text-right">
            <p className="text-xs text-gray-500">Deadline</p>
            <p className="flex items-start justify-end gap-1.5 text-sm leading-5 font-medium text-gray-700">
              <CalendarDays
                aria-hidden="true"
                className="size-4 shrink-0 text-amber-500"
              />
              <span className="wrap-break-word">
                {formatChallengeDeadline(challenge.deadline)}
              </span>
            </p>
          </div>
        </div>

        <p className="text-xs wrap-break-word text-gray-500">
          Posted by{' '}
          <span className="font-medium text-gray-700">
            {challenge.company || 'Organization'}
          </span>
        </p>
      </CardContent>

      <CardFooter className="border-t border-gray-100 p-4">
        <Button asChild className="w-full">
          <Link to={`/challenges/${challenge.id}`}>
            <Code className="size-4" />
            <span>View and submit</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
