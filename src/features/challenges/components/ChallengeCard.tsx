import { Bitcoin, CalendarDays, Code } from 'lucide-react';
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
      <CardHeader className="space-y-2.5 p-5 pb-0">
        <div className="flex items-center justify-between gap-3">
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
        <h3 className="line-clamp-2 text-lg leading-6 font-semibold text-gray-950">
          {challenge.title}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 p-5 pt-3">
        <p className="line-clamp-2 text-sm leading-5 text-gray-500">
          {challenge.description}
        </p>

        <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Reward</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-gray-950">
              <Bitcoin className="size-4 text-emerald-500" />
              {challenge.rewardBTC} BTC
            </p>
          </div>

          <div className="min-w-0 text-right">
            <p className="text-xs text-gray-500">Deadline</p>
            <p className="mt-0.5 flex items-center justify-end gap-1.5 text-sm font-medium text-gray-700">
              <CalendarDays className="size-4 shrink-0 text-amber-500" />
              <span className="truncate">
                {formatChallengeDeadline(challenge.deadline)}
              </span>
            </p>
          </div>
        </div>

        <p className="truncate text-xs text-gray-500">
          Posted by{' '}
          <span className="font-medium text-gray-700">
            {challenge.company || 'Company'}
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
