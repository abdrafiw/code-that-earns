import { useMemo, useState } from 'react';
import { CheckCircle, Clock, Search } from 'lucide-react';
import { PageErrorState } from '../../../components/common/PageErrorState';
import { PageSkeleton } from '../../../components/common/PageSkeleton';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useAppContext } from '../../../hooks/useAppContext';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { useGetTransactions } from '../hooks/useTransactions';
import type { TransactionStatus } from '../types';
import { formatTxHash } from '../utils/transactionUtils';

export function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | TransactionStatus>('all');
  const { user } = useAppContext();
  const userId = user?.success ? user.user.uid : undefined;
  const transactionsQuery = useGetTransactions(
    userId,
    status === 'all' ? undefined : status,
  );
  const transactions = useMemo(
    () =>
      transactionsQuery.data?.pages.flatMap((page) => page.transactions) ?? [],
    [transactionsQuery.data],
  );
  const searchTerm = search.trim().toLowerCase();
  const visibleTransactions = useMemo(
    () =>
      searchTerm
        ? transactions.filter((transaction) =>
            [
              transaction.challengeTitle ?? '',
              transaction.transactionHash ?? '',
            ].some((value) => value.toLowerCase().includes(searchTerm)),
          )
        : transactions,
    [searchTerm, transactions],
  );
  const completed = transactions.filter(
    (transaction) => transaction.status === 'completed',
  );
  const pending = transactions.filter(
    (transaction) => transaction.status === 'pending',
  );

  if (transactionsQuery.isPending) {
    return <PageSkeleton variant="transactions" />;
  }
  if (transactionsQuery.error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <PageErrorState
          message={getErrorMessage(transactionsQuery.error)}
          onRetry={() => void transactionsQuery.refetch()}
          isRetrying={transactionsQuery.isFetching}
        />
      </div>
    );
  }

  const summaries = [
    ['Completed payments', completed, 'completed'],
    ['Pending payments', pending, 'pending'],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header className="border-b border-gray-200 pb-7">
        <p className="text-sm font-medium text-indigo-500">Payment activity</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
          Transactions
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          View challenge payment records involving your account. Payments cannot
          be initiated from this dashboard.
        </p>
      </header>

      <section
        aria-label="Loaded payment summary"
        className="my-6 grid gap-4 sm:grid-cols-3"
      >
        {summaries.map(([label, records, state]) => (
          <article
            key={label}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-4 text-2xl font-semibold text-gray-950 tabular-nums">
              {records
                .reduce((sum, transaction) => sum + transaction.amount, 0)
                .toFixed(4)}{' '}
              <span className="text-sm text-gray-500">BTC</span>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              {records.length} {state}
            </p>
          </article>
        ))}
        <article className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Loaded transactions</p>
          <p className="mt-4 text-2xl font-semibold text-gray-950">
            {transactions.length}
          </p>
          <p className="mt-2 text-xs text-gray-500">Your loaded history</p>
        </article>
      </section>

      <section aria-labelledby="history-title" className="mt-9">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2
            id="history-title"
            className="text-lg font-semibold text-gray-950"
          >
            Payment history
          </h2>
          <span role="status" className="text-xs text-gray-500">
            {visibleTransactions.length} loaded
          </span>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-wrap gap-3 border-b border-gray-200 p-4">
            <div className="relative min-w-0 grow basis-60">
              <Search
                aria-hidden="true"
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
              />
              <Input
                aria-label="Search loaded transactions"
                placeholder="Search loaded challenge or transaction hash"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 pl-9 shadow-none"
              />
            </div>
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as 'all' | TransactionStatus)
              }
              className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700"
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div
            className="overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label="Transaction table"
          >
            <table className="w-full min-w-190 text-left text-sm">
              <caption className="sr-only">
                Your challenge payment transactions
              </caption>
              <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
                <tr>
                  {['Challenge / transaction', 'Amount', 'Status', 'Date'].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-3 font-medium"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <th scope="row" className="px-5 py-5 font-normal">
                      <p className="font-medium text-gray-950">
                        {transaction.challengeTitle ||
                          `Challenge ${transaction.challengeId}`}
                      </p>
                      <p className="mt-1.5 font-mono text-xs text-gray-400">
                        {transaction.transactionHash
                          ? formatTxHash(transaction.transactionHash)
                          : 'Transaction hash pending'}
                      </p>
                    </th>
                    <td className="px-5 py-5 font-medium whitespace-nowrap text-gray-950">
                      {Number(transaction.amount).toFixed(4)}{' '}
                      {transaction.currency}
                    </td>
                    <td className="px-5 py-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 capitalize">
                        {transaction.status === 'completed' ? (
                          <CheckCircle className="size-3.5 text-green-600" />
                        ) : (
                          <Clock className="size-3.5 text-amber-600" />
                        )}
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-5 py-5 whitespace-nowrap text-gray-600">
                      <time
                        dateTime={transaction.createdAt.toDate().toISOString()}
                      >
                        {transaction.createdAt.toDate().toLocaleDateString()}
                      </time>
                    </td>
                  </tr>
                ))}
                {visibleTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-14 text-center text-gray-500"
                    >
                      {transactions.length === 0
                        ? 'No payment transactions yet.'
                        : 'No loaded transactions match your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {transactionsQuery.hasNextPage && (
            <div className="border-t border-gray-200 p-4 text-center">
              <Button
                variant="outline"
                onClick={() => void transactionsQuery.fetchNextPage()}
                disabled={transactionsQuery.isFetchingNextPage}
              >
                {transactionsQuery.isFetchingNextPage
                  ? 'Loading…'
                  : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
