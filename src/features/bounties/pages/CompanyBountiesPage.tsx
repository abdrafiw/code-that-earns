import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bitcoin, CalendarDays, Code2, Search, Users } from 'lucide-react';
import { useAppContext } from '../../../hooks/useAppContext';
import { CreateBountyDialog } from '../components/CreateBountyDialog';
import { EmptyBountiesState } from '../components/EmptyBountiesState';
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
import { normalizeBountyFilter } from '../utils/bountyFilters';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { formatBountyDeadline } from '../utils/bountyDeadline';
import {
  useGetCompanyBounties,
  useGetCompanyBountyMetrics,
} from '../hooks/useBounties';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';

const difficultyStyles: Record<string, string> = {
  beginner: 'bg-green-50 text-green-700',
  intermediate: 'bg-yellow-50 text-yellow-700',
  advanced: 'bg-red-50 text-red-700',
};

export const CompanyBountiesPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const normalizedSearch = normalizeBountyFilter(search);
  const debouncedSearch = useDebouncedValue(normalizedSearch, 350);
  const effectiveSearch =
    normalizedSearch.length >= 3 && debouncedSearch.length >= 3
      ? debouncedSearch
      : '';

  const { user } = useAppContext();
  const uid = user?.success ? user.user.uid : undefined;
  const metricsQuery = useGetCompanyBountyMetrics(uid);

  const {
    data: bounties = [],
    isPending: isBountiesPending,
    isFetching,
    error,
    refetch,
  } = useGetCompanyBounties(uid, {
    search: effectiveSearch,
    category,
    difficulty,
  });

  const hasActiveFilters = Boolean(
    effectiveSearch || category !== 'all' || difficulty !== 'all',
  );

  if (isBountiesPending || metricsQuery.isPending)
    return <PageSkeleton variant="company-bounties" />;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col justify-between gap-5 border-b border-gray-200 pb-8 sm:flex-row sm:items-end">
          <div className="">
            <p className="text-sm font-medium text-orange-600">
              Company dashboard
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
              Your bounties
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Keep track of the challenges you have published and the work
              coming in.
            </p>
          </div>
          <CreateBountyDialog />
        </header>

        {error || metricsQuery.error ? (
          <div className="mt-8">
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
            <div className="grid gap-4 py-8 sm:grid-cols-3">
              <KpiCard
                icon={Code2}
                label="Published bounties"
                value={metricsQuery.data?.published ?? 0}
                iconClassName="bg-orange-50 text-orange-600"
              />
              <KpiCard
                icon={Bitcoin}
                label="Total reward pool"
                value={(metricsQuery.data?.totalRewards ?? 0).toFixed(4)}
                suffix="BTC"
                iconClassName="bg-green-50 text-green-600"
              />
              <KpiCard
                icon={Users}
                label="Categories used"
                value={metricsQuery.data?.categoriesUsed ?? 0}
                iconClassName="bg-blue-50 text-blue-600"
              />
            </div>

            <div className="">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="">
                  <h2 className="text-xl font-semibold text-gray-950">
                    Bounty list
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {bounties.length} bounties shown
                  </p>
                </div>
                <Link
                  to="/company-submissions"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  Review submissions
                </Link>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        if (event.target.value.trim()) {
                          setCategory('all');
                          setDifficulty('all');
                        }
                      }}
                      placeholder="Search bounties"
                      className="h-10 border-gray-200 pl-9 shadow-none"
                      aria-describedby="bounty-search-help"
                    />
                  </div>
                  <p
                    id="bounty-search-help"
                    className="mt-1 text-xs text-gray-500"
                  >
                    {normalizedSearch.length > 0 && normalizedSearch.length < 3
                      ? 'Enter at least 3 characters to search.'
                      : normalizedSearch !== debouncedSearch
                        ? 'Waiting for you to finish typing…'
                        : 'Search by title, description, or category.'}
                  </p>
                </div>

                <Select
                  value={category}
                  onValueChange={(value) => {
                    setSearch('');
                    setCategory(value);
                  }}
                >
                  <SelectTrigger className="h-10 w-full border-gray-200 sm:w-44">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="Coding">Coding</SelectItem>
                    <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                    <SelectItem value="Blockchain">Blockchain</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={difficulty}
                  onValueChange={(value) => {
                    setSearch('');
                    setDifficulty(value);
                  }}
                >
                  <SelectTrigger className="h-10 w-full border-gray-200 sm:w-44">
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

              {bounties.length === 0 ? (
                <EmptyBountiesState
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={() => {
                    setSearch('');
                    setCategory('all');
                    setDifficulty('all');
                  }}
                />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                  <table className="w-full min-w-180 text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs tracking-wide text-gray-500 uppercase">
                      <tr>
                        <th className="px-5 py-4 font-medium">Bounty</th>
                        <th className="px-5 py-4 font-medium">Difficulty</th>
                        <th className="px-5 py-4 font-medium">Reward</th>
                        <th className="px-5 py-4 font-medium">Deadline</th>
                        <th className="px-5 py-4 font-medium">Submissions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bounties.map((bounty) => {
                        const difficulty = normalizeBountyFilter(
                          bounty.difficulty,
                        );
                        const badgeClass =
                          difficultyStyles[difficulty] ||
                          'bg-gray-100 text-gray-600';

                        return (
                          <tr
                            key={bounty.id}
                            className="transition-colors hover:bg-gray-50"
                          >
                            <td className="max-w-70 px-5 py-5">
                              <p className="truncate font-semibold text-gray-950">
                                {bounty.title}
                              </p>
                              <p className="mt-1 truncate text-xs text-gray-500">
                                {bounty.category || 'General'}
                              </p>
                            </td>
                            <td className="px-5 py-5">
                              <span
                                className={
                                  'rounded-full px-2.5 py-1 text-xs font-medium capitalize ' +
                                  badgeClass
                                }
                              >
                                {bounty.difficulty || 'Unspecified'}
                              </span>
                            </td>
                            <td className="px-5 py-5 font-semibold text-gray-900">
                              <span className="inline-flex items-center gap-1.5">
                                <Bitcoin className="size-4 text-orange-500" />
                                {bounty.bountyBTC} BTC
                              </span>
                            </td>
                            <td className="px-5 py-5 text-gray-500">
                              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                <CalendarDays className="size-4" />
                                {formatBountyDeadline(bounty.deadline)}
                              </span>
                            </td>
                            <td className="px-5 py-5 text-gray-500">
                              <span className="inline-flex items-center gap-1.5">
                                <Users className="size-4" />
                                Submissions
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};
