import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Code2, Search, Users } from 'lucide-react';
import { useAppContext } from '../../../hooks/useAppContext';
import { CreateChallengeDialog } from '../components/CreateChallengeDialog';
import { EmptyChallengesState } from '../components/EmptyChallengesState';
import { KpiCard } from '../components/KpiCard';
import { Input } from '../../../components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

import { PageSkeleton } from '../../../components/common/PageSkeleton';
import { PageErrorState } from '../../../components/common/PageErrorState';
import { normalizeChallengeFilter } from '../utils/challengeFilters';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { formatChallengeDeadline } from '../utils/challengeDeadline';
import {
  useGetCompanyChallenges,
  useGetCompanyChallengeMetrics,
} from '../hooks/useChallenges';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { formatOutcome } from '../utils/formatOutcome';
import { CHALLENGE_CATEGORIES } from '../constants';
import { CompanyChallengeMobileCard } from '../components/CompanyChallengeMobileCard';

const difficultyStyles: Record<string, string> = {
  beginner: 'bg-green-50 text-green-700',
  intermediate: 'bg-yellow-50 text-yellow-700',
  advanced: 'bg-red-50 text-red-700',
};

export const CompanyChallengesPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const normalizedSearch = normalizeChallengeFilter(search);
  const debouncedSearch = useDebouncedValue(normalizedSearch, 350);
  const effectiveSearch =
    normalizedSearch.length >= 3 && debouncedSearch.length >= 3
      ? debouncedSearch
      : '';

  const { user } = useAppContext();
  const uid = user?.success ? user.user.uid : undefined;
  const metricsQuery = useGetCompanyChallengeMetrics(uid);

  const {
    data: challenges = [],
    isPending: isChallengesPending,
    isFetching,
    error,
    refetch,
  } = useGetCompanyChallenges(uid, {
    search: effectiveSearch,
    category,
    difficulty,
  });

  const hasActiveFilters = Boolean(
    effectiveSearch || category !== 'all' || difficulty !== 'all',
  );

  if (isChallengesPending || metricsQuery.isPending)
    return <PageSkeleton variant="company-challenges" />;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:pb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
              Challenges
            </h1>
          </div>
          <CreateChallengeDialog triggerClassName="w-full sm:w-auto" />
        </header>

        {error || metricsQuery.error ? (
          <div>
            <PageErrorState
              message={getErrorMessage(error ?? metricsQuery.error)}
              onRetry={() => {
                void refetch();
                void metricsQuery.refetch();
              }}
              isRetrying={isFetching || metricsQuery.isFetching}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1">
              <KpiCard
                icon={Code2}
                label="Published challenges"
                value={metricsQuery.data?.published ?? 0}
                iconClassName="bg-indigo-50 text-indigo-500"
              />
              <KpiCard
                icon={Award}
                label="Total reward pool"
                value={metricsQuery.data?.totalRewards ?? 0}
                suffix=" minor units"
                iconClassName="bg-green-50 text-green-600"
              />
              <KpiCard
                icon={Users}
                label="Categories used"
                value={metricsQuery.data?.categoriesUsed ?? 0}
                iconClassName="bg-blue-50 text-blue-600"
              />
            </div>

            <div className="space-y-4 pt-6 sm:pt-8">
              <div className="flex justify-start sm:justify-end">
                <Link
                  to="/organization-submissions"
                  className="inline-flex min-h-11 items-center rounded-md px-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Review submissions
                </Link>
              </div>

              <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_11rem_11rem]">
                <div className="flex-1">
                  <div className="relative">
                    <Search
                      aria-hidden="true"
                      className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        if (event.target.value.trim()) {
                          setCategory('all');
                          setDifficulty('all');
                        }
                      }}
                      placeholder="Search challenges"
                      aria-label="Search challenges"
                      className="h-11 border-gray-200 pl-9 shadow-none"
                    />
                  </div>
                </div>

                <Select
                  value={category}
                  onValueChange={(value) => {
                    setSearch('');
                    setCategory(value);
                  }}
                >
                  <SelectTrigger className="h-11 w-full border-gray-200 bg-transparent shadow-none data-[size=default]:h-11">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {CHALLENGE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={difficulty}
                  onValueChange={(value) => {
                    setSearch('');
                    setDifficulty(value);
                  }}
                >
                  <SelectTrigger className="h-11 w-full border-gray-200 bg-transparent shadow-none data-[size=default]:h-11">
                    <SelectValue placeholder="All difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All difficulties</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {challenges.length === 0 ? (
                <EmptyChallengesState
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={() => {
                    setSearch('');
                    setCategory('all');
                    setDifficulty('all');
                  }}
                />
              ) : (
                <>
                  <ul className="space-y-3 md:hidden">
                    {challenges.map((challenge) => (
                      <CompanyChallengeMobileCard
                        key={challenge.id}
                        challenge={challenge}
                      />
                    ))}
                  </ul>
                  <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white md:block">
                    <table className="w-full min-w-180 text-left text-sm">
                      <thead className="border-b border-gray-200 text-xs tracking-wide text-gray-500 uppercase">
                        <tr className="bg-white">
                          <th className="px-5 py-4 font-medium">Challenge</th>
                          <th className="px-5 py-4 font-medium">Difficulty</th>
                          <th className="px-5 py-4 font-medium">Reward</th>
                          <th className="px-5 py-4 font-medium">Deadline</th>
                          <th className="px-5 py-4 font-medium">Submissions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {challenges.map((challenge) => {
                          const difficulty = normalizeChallengeFilter(
                            challenge.difficulty,
                          );
                          const badgeClass =
                            difficultyStyles[difficulty] ||
                            'bg-gray-100 text-gray-600';

                          return (
                            <tr
                              key={challenge.id}
                              className="transition-colors hover:bg-gray-50"
                            >
                              <td className="max-w-70 space-y-1 px-5 py-5">
                                <p className="truncate font-semibold text-gray-950">
                                  {challenge.title}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                  {challenge.category || 'General'}
                                </p>
                              </td>
                              <td className="px-5 py-5">
                                <span
                                  className={
                                    'rounded-full px-2.5 py-1 text-xs font-medium capitalize ' +
                                    badgeClass
                                  }
                                >
                                  {challenge.difficulty || 'Unspecified'}
                                </span>
                              </td>
                              <td className="px-5 py-5 font-semibold text-gray-900">
                                {formatOutcome(challenge.outcome)}
                              </td>
                              <td className="px-5 py-5 text-gray-500">
                                <span className="whitespace-nowrap">
                                  {formatChallengeDeadline(challenge.deadline)}
                                </span>
                              </td>
                              <td className="px-5 py-5 text-gray-500">
                                {challenge.submissions ?? 0}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};
