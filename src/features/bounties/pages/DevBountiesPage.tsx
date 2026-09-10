import { useState } from 'react';
import { PageSkeleton } from '../../../components/common/PageSkeleton';
import { PageErrorState } from '../../../components/common/PageErrorState';
import { BountyCard } from '../components/BountyCard';
import { useGetBounties } from '../hooks/useBounties';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { Button } from '../../../components/ui/button';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

export const DevBountiesPage = () => {
  const [category, setCategory] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');

  const bountiesQuery = useGetBounties({ category, difficulty });
  const bounties =
    bountiesQuery.data?.pages.flatMap((page) => page.bounties) ?? [];

  if (bountiesQuery.isPending) {
    return <PageSkeleton variant="dev-bounties" />;
  }

  if (bountiesQuery.error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <PageErrorState
          message={getErrorMessage(bountiesQuery.error)}
          onRetry={() => void bountiesQuery.refetch()}
          isRetrying={bountiesQuery.isFetching}
        />
      </div>
    );
  }

  return (
    <section className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-body">
            Choose your next challenge and earn Bitcoin
          </p>

          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-card w-full py-5 sm:w-45">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Coding">Coding</SelectItem>
                <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                <SelectItem value="Blockchain">Blockchain</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-card w-full py-5 sm:w-45">
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
        </header>

        {bounties.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center">
            No bounties match the selected filters.
          </p>
        ) : (
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-1">
            {bounties.map((bounty) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
        )}

        {bountiesQuery.hasNextPage && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => void bountiesQuery.fetchNextPage()}
              disabled={bountiesQuery.isFetchingNextPage}
            >
              {bountiesQuery.isFetchingNextPage
                ? 'Loading…'
                : 'Load more bounties'}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
