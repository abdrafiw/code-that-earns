import { ArrowLeft, Award, Building2, CalendarDays } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { SubmitSolutionForm } from '../components/SubmitSolutionForm';
import { SubmitSolutionLoadingState } from '../components/SubmitSolutionLoadingState';
import { SubmitSolutionNotFoundState } from '../components/SubmitSolutionNotFoundState';
import { useGetChallengeByID } from '../hooks/useChallenge';
import { PageErrorState } from '../../../components/common/PageErrorState';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { ChallengeNotFoundError } from '../../../services/challenges/challengeService';
import { Button } from '../../../components/ui/button';
import { formatChallengeDeadline } from '../../challenges/utils/challengeDeadline';
import { normalizeChallengeFilter } from '../../challenges/utils/challengeFilters';
import { formatOutcome } from '../../challenges/utils/formatOutcome';

const difficultyStyles: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-800',
  intermediate: 'bg-amber-100 text-amber-800',
  advanced: 'bg-rose-100 text-rose-800',
};

export const SubmitSolutionPage = () => {
  const { challengeId } = useParams();
  const challengeQuery = useGetChallengeByID();
  const challenge = challengeQuery.data;

  if (!challengeId || challengeQuery.error instanceof ChallengeNotFoundError)
    return <SubmitSolutionNotFoundState />;

  if (challengeQuery.isPending) return <SubmitSolutionLoadingState />;

  if (challengeQuery.error)
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <PageErrorState
            message={getErrorMessage(challengeQuery.error)}
            onRetry={() => void challengeQuery.refetch()}
            isRetrying={challengeQuery.isFetching}
          />
        </div>
      </main>
    );

  if (!challenge) return <SubmitSolutionNotFoundState />;

  const difficulty = normalizeChallengeFilter(challenge.difficulty);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Button variant="ghost" size="sm" asChild className="-ml-3">
          <Link to="/challenges">
            <ArrowLeft className="size-4" />
            Back to challenges
          </Link>
        </Button>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <article className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <header className="space-y-5 border-b border-gray-100 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
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

              <div>
                <p className="text-sm font-medium text-indigo-500">
                  Challenge details
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                  {challenge.title}
                </h1>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Building2 className="size-4" />
                Posted by{' '}
                <span className="font-medium text-gray-700">
                  {challenge.company || 'Company'}
                </span>
              </div>
            </header>

            <div className="space-y-8 p-6 sm:p-8">
              <section aria-labelledby="challenge-overview">
                <h2
                  id="challenge-overview"
                  className="text-lg font-semibold text-gray-950"
                >
                  Overview
                </h2>
                <p className="mt-3 text-sm leading-7 whitespace-pre-wrap text-gray-600">
                  {challenge.description}
                </p>
              </section>

              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                    <Award className="size-4 text-emerald-500" />
                    Reward
                  </dt>
                  <dd className="mt-2 text-xl font-semibold text-gray-950">
                    {formatOutcome(challenge.outcome)}
                  </dd>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                    <CalendarDays className="size-4 text-amber-500" />
                    Deadline
                  </dt>
                  <dd className="mt-2 text-base font-semibold text-gray-950">
                    {formatChallengeDeadline(challenge.deadline)}
                  </dd>
                </div>
              </dl>
              {challenge.status === 'completed' && challenge.results && (
                <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                  <h2 className="font-semibold text-emerald-950">
                    Challenge results
                  </h2>
                  <ul className="mt-2 list-inside list-disc text-sm text-emerald-900">
                    {challenge.results.map((winner) => (
                      <li key={winner.submissionId}>
                        {winner.displayName} —{' '}
                        {challenge.outcome.recognitionLabel ?? 'Winner'}
                      </li>
                    ))}
                  </ul>
                  {challenge.outcome.type !== 'recognition' && (
                    <p className="mt-3 text-xs text-emerald-800">
                      Any reward is delivered directly by the company outside
                      CTE and is not verified or guaranteed by CTE.
                    </p>
                  )}
                </section>
              )}
            </div>
          </article>

          <aside className="lg:sticky lg:top-6">
            <SubmitSolutionForm challengeID={challengeId} />
          </aside>
        </div>
      </div>
    </main>
  );
};
