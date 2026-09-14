import { useState } from 'react';
import { Code2, Search, SlidersHorizontal } from 'lucide-react';
import { PageSkeleton } from '../../../components/common/PageSkeleton';
import { PageErrorState } from '../../../components/common/PageErrorState';
import { ChallengeCard } from '../components/ChallengeCard';
import { useGetChallenges } from '../hooks/useChallenges';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { normalizeChallengeFilter } from '../utils/challengeFilters';
import { CHALLENGE_CATEGORIES } from '../constants';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

export const DevChallengesPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const normalizedSearch = normalizeChallengeFilter(search);
  const debouncedSearch = useDebouncedValue(normalizedSearch, 350);
  const effectiveSearch =
    normalizedSearch.length >= 3 && debouncedSearch.length >= 3
      ? debouncedSearch
      : '';

  const challengesQuery = useGetChallenges({
    search: effectiveSearch,
    category,
    difficulty,
  });
  const challenges =
    challengesQuery.data?.pages.flatMap((page) => page.challenges) ?? [];
  const hasActiveFilters = Boolean(
    search || category !== 'all' || difficulty !== 'all',
  );

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setDifficulty('all');
  };

  if (challengesQuery.isPending) {
    return <PageSkeleton variant="dev-challenges" />;
  }

  if (challengesQuery.error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <PageErrorState
          message={getErrorMessage(challengesQuery.error)}
          onRetry={() => void challengesQuery.refetch()}
          isRetrying={challengesQuery.isFetching}
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="border-b border-gray-200 pb-8">
          <h1
            id="challenges-heading"
            className="text-3xl font-semibold tracking-tight text-gray-950"
          >
            Browse challenges
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Find a challenge, submit your solution, and earn recognition or a
            stated reward.
          </p>
        </header>

        <section className="space-y-5" aria-labelledby="challenges-heading">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              {challenges.length}{' '}
              {challenges.length === 1 ? 'challenge' : 'challenges'} available
            </p>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-2 px-1 text-sm font-medium text-gray-600 lg:mr-auto">
              <SlidersHorizontal className="size-4 text-indigo-500" />
              Filter challenges
            </div>

            <div className="flex flex-1 flex-col gap-3 sm:flex-row lg:max-w-3xl">
              <div className="relative flex-1">
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
                  placeholder="Search challenges"
                  aria-label="Search challenges"
                  className="h-10 border-gray-200 pl-9 shadow-none"
                />
              </div>

              <Select
                value={category}
                onValueChange={(value) => {
                  setSearch('');
                  setCategory(value);
                }}
              >
                <SelectTrigger className="h-10 w-full border-gray-200 bg-transparent shadow-none sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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
                <SelectTrigger className="h-10 w-full border-gray-200 bg-transparent shadow-none sm:w-48">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {challenges.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
              <Code2 className="mx-auto size-9 text-gray-300" />
              <h3 className="mt-4 font-medium text-gray-950">
                No matching challenges
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try a different search, category, or difficulty.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
              {challenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}

          {challengesQuery.hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => void challengesQuery.fetchNextPage()}
                disabled={challengesQuery.isFetchingNextPage}
              >
                {challengesQuery.isFetchingNextPage
                  ? 'Loading…'
                  : 'Load more challenges'}
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
