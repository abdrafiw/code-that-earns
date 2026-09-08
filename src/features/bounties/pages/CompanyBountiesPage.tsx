import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bitcoin, CalendarDays, Code2, Search, Users } from 'lucide-react';
import { useAppContext } from '../../../hooks/useAppContext';
import { useGetCompanyBounties } from '../../../hooks/useCompanyBounties';
import { CreateBountyDialog } from '../components/CreateBountyDialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

import { PageSkeleton } from '../../../components/common/PageSkeleton';

const difficultyStyles: Record<string, string> = {
  beginner: 'bg-green-50 text-green-700',
  intermediate: 'bg-yellow-50 text-yellow-700',
  advanced: 'bg-red-50 text-red-700',
};

const normalize = (value: string) => {
  return value.toLowerCase().replace(/[-_]/g, ' ').trim();
};

export const CompanyBountiesPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  const { user } = useAppContext();
  const uid = user?.success ? user.user.uid : undefined;

  const {
    data: bounties = [],
    isPending: isBountiesPending,
    error,
  } = useGetCompanyBounties(uid, user ?? null);

  const filteredBounties = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return bounties.filter((bounty) => {
      const matchesSearch =
        !searchTerm ||
        [bounty.title, bounty.description, bounty.category].some((value) =>
          value.toLowerCase().includes(searchTerm),
        );
      const matchesCategory =
        category === 'all' ||
        normalize(bounty.category) === normalize(category);
      const matchesDifficulty =
        difficulty === 'all' ||
        normalize(bounty.difficulty) === normalize(difficulty);

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [bounties, category, difficulty, search]);

  const totalRewards = bounties.reduce(
    (total, bounty) => total + Number(bounty.bountyBTC || 0),
    0,
  );
  const categories = new Set(
    bounties.map((bounty) => normalize(bounty.category)),
  ).size;

  if (isBountiesPending) return <PageSkeleton variant="company-bounties" />;

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
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

        {error ? (
          <p className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load your bounties: {error.message}
          </p>
        ) : (
          <>
            <section className="grid gap-4 py-8 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-3 text-gray-500">
                  <span className="rounded-md bg-orange-50 p-2 text-orange-600">
                    <Code2 className="size-4" />
                  </span>
                  <span className="text-sm">Published bounties</span>
                </div>
                <p className="mt-4 text-2xl font-semibold text-gray-950">
                  {bounties.length}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-3 text-gray-500">
                  <span className="rounded-md bg-green-50 p-2 text-green-600">
                    <Bitcoin className="size-4" />
                  </span>
                  <span className="text-sm">Total reward pool</span>
                </div>

                <p className="mt-4 text-2xl font-semibold text-gray-950">
                  {totalRewards.toFixed(4)}{' '}
                  <span className="text-sm font-medium text-gray-500">BTC</span>
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-3 text-gray-500">
                  <span className="rounded-md bg-blue-50 p-2 text-blue-600">
                    <Users className="size-4" />
                  </span>
                  <span className="text-sm">Categories used</span>
                </div>
                <p className="mt-4 text-2xl font-semibold text-gray-950">
                  {categories}
                </p>
              </div>
            </section>

            <section>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="">
                  <h2 className="text-xl font-semibold text-gray-950">
                    Bounty list
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {filteredBounties.length} of {bounties.length} bounties
                    shown
                  </p>
                </div>
                <Link
                  to="/company-submissions"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  Review submissions
                </Link>
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search bounties"
                    className="h-10 border-gray-200 pl-9 shadow-none"
                  />
                </div>

                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10 w-full border-gray-200 sm:w-44">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="data-analysis">Data Analysis</SelectItem>
                    <SelectItem value="blockchain">Blockchain</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="h-10 w-full border-gray-200 sm:w-44">
                    <SelectValue placeholder="All difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All difficulties</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredBounties.length === 0 ? (
                <div className="mt-5 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                  <Code2 className="mx-auto size-8 text-gray-300" />
                  <h3 className="mt-4 font-medium text-gray-950">
                    {bounties.length === 0
                      ? 'No bounties yet'
                      : 'No matching bounties'}
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                    {bounties.length === 0
                      ? 'Create a bounty to start receiving solutions from developers.'
                      : 'Try changing your search or filters.'}
                  </p>
                  {bounties.length === 0 ? (
                    <div className="mt-5">
                      <CreateBountyDialog />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="mt-5"
                      onClick={() => {
                        setSearch('');
                        setCategory('all');
                        setDifficulty('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="mt-5 overflow-x-auto rounded-lg border border-gray-200 bg-white">
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
                      {filteredBounties.map((bounty) => {
                        const difficulty = normalize(bounty.difficulty);
                        const badgeClass =
                          difficultyStyles[difficulty] ||
                          'bg-gray-100 text-gray-600';

                        return (
                          <tr
                            key={bounty.id}
                            className="transition-colors hover:bg-gray-50"
                          >
                            <td className="max-w-[280px] px-5 py-5">
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
                                {bounty.deadline || 'No deadline'}
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
            </section>
          </>
        )}
      </section>
    </main>
  );
};
