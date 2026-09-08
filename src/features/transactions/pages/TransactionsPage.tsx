import { useState } from 'react';
import {
  Bitcoin,
  CheckCircle,
  Clock,
  Search,
  ArrowLeftRight,
} from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { formatTxHash } from '../utils/transactionUtils';

const sampleTransactions = [
  {
    id: 'tx_001',
    txHash: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
    amount: 0.025,
    usdValue: 1250,
    status: 'confirmed',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    bountyTitle: 'React Dashboard Implementation',
    confirmations: 6,
  },
  {
    id: 'tx_002',
    txHash: '9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a',
    amount: 0.05,
    usdValue: 2500,
    status: 'confirmed',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    bountyTitle: 'API Integration & Testing',
    confirmations: 12,
  },
  {
    id: 'tx_003',
    txHash: '5f4e3d2c1b0a9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g',
    amount: 0.0125,
    usdValue: 625,
    status: 'pending',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    bountyTitle: 'Bug Fix - Authentication Module',
    confirmations: 0,
  },
  {
    id: 'tx_004',
    txHash: '3g2f1e0d9c8b7a6z5y4x3w2v1u0t9s8r7q6p5o4n3m2l1k0j9i8h',
    amount: 0.075,
    usdValue: 3750,
    status: 'confirmed',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    bountyTitle: 'Mobile App UI/UX Redesign',
    confirmations: 25,
  },
  {
    id: 'tx_005',
    txHash: '7h6g5f4e3d2c1b0a9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i',
    amount: 0.1,
    usdValue: 5000,
    status: 'confirmed',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    bountyTitle: 'Blockchain Integration Project',
    confirmations: 45,
  },
  {
    id: 'tx_006',
    txHash: '8i7h6g5f4e3d2c1b0a9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j',
    amount: 0.03,
    usdValue: 1500,
    status: 'confirmed',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    bountyTitle: 'Database Optimization',
    confirmations: 78,
  },
  {
    id: 'tx_007',
    txHash: '2j1i0h9g8f7e6d5c4b3a2z1y0x9w8v7u6t5s4r3q2p1o0n9m8l7k',
    amount: 0.02,
    usdValue: 1000,
    status: 'confirmed',
    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    bountyTitle: 'Security Audit Implementation',
    confirmations: 156,
  },
  {
    id: 'tx_008',
    txHash: '4k3j2i1h0g9f8e7d6c5b4a3z2y1x0w9v8u7t6s5r4q3p2o1n0m9l',
    amount: 0.0085,
    usdValue: 425,
    status: 'pending',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    bountyTitle: 'Performance Optimization',
    confirmations: 0,
  },
];

export function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const confirmed = sampleTransactions.filter(
    (tx) => tx.status === 'confirmed',
  );
  const pending = sampleTransactions.filter((tx) => tx.status === 'pending');
  const totalPaid = confirmed.reduce((sum, tx) => sum + tx.amount, 0);
  const pendingAmount = pending.reduce((sum, tx) => sum + tx.amount, 0);
  const filtered = sampleTransactions
    .filter(
      (tx) =>
        (status === 'all' || tx.status === status) &&
        [tx.bountyTitle, tx.txHash].some((value) =>
          value.toLowerCase().includes(search.trim().toLowerCase()),
        ),
    )
    .sort((a, b) =>
      sort === 'newest'
        ? b.timestamp.getTime() - a.timestamp.getTime()
        : a.timestamp.getTime() - b.timestamp.getTime(),
    );
  const summaries = [
    {
      label: 'Confirmed payments',
      value: totalPaid.toFixed(4),
      unit: 'BTC',
      note: confirmed.length + ' confirmed transactions',
      icon: Bitcoin,
    },
    {
      label: 'Pending payments',
      value: pendingAmount.toFixed(4),
      unit: 'BTC',
      note: pending.length + ' awaiting confirmation',
      icon: Clock,
    },
    {
      label: 'Total transactions',
      value: String(sampleTransactions.length),
      unit: '',
      note: 'Across all bounty payments',
      icon: ArrowLeftRight,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-7">
        <div>
          <p className="text-sm font-medium text-orange-600">
            Payment activity
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
            Transactions
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Track bounty payments and their confirmation status.
          </p>
        </div>
        <span className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
          Demo data
        </span>
      </header>

      <p className="mt-5 text-sm text-gray-500">
        These are sample transactions, not live payment records.
      </p>
      <section
        aria-label="Payment summary"
        className="my-6 grid gap-4 sm:grid-cols-3"
      >
        {summaries.map(({ label, value, unit, note, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
              {label}
              <Icon
                aria-hidden="true"
                className="size-4 shrink-0 text-orange-600"
              />
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-gray-950 tabular-nums">
              {value}{' '}
              <span className="text-sm font-medium text-gray-500">{unit}</span>
            </p>
            <p className="mt-2 text-xs text-gray-500">{note}</p>
          </div>
        ))}
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
            {filtered.length} of {sampleTransactions.length} transactions
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
                aria-label="Search transactions"
                placeholder="Search bounty or transaction hash"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 pl-9 shadow-none"
              />
            </div>
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus-visible:outline-orange-600"
            >
              <option value="all">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
            </select>
            <select
              aria-label="Sort transactions"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus-visible:outline-orange-600"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          <div
            className="overflow-x-auto focus-visible:outline-orange-600"
            tabIndex={0}
            role="region"
            aria-label="Transaction table"
          >
            <table className="w-full min-w-[760px] text-left text-sm">
              <caption className="sr-only">
                Sample bounty payments with amounts, status, and dates
              </caption>
              <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
                <tr>
                  {['Bounty / transaction', 'Amount', 'Status', 'Date'].map(
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
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <th scope="row" className="px-5 py-5 font-normal">
                      <p className="font-medium text-gray-950">
                        {tx.bountyTitle}
                      </p>
                      <p
                        title={tx.txHash}
                        className="mt-1.5 font-mono text-xs text-gray-400"
                      >
                        {formatTxHash(tx.txHash)}
                      </p>
                    </th>
                    <td className="px-5 py-5 whitespace-nowrap">
                      <p className="font-medium text-gray-950 tabular-nums">
                        {tx.amount.toFixed(4)} BTC
                      </p>
                      <p className="mt-1.5 text-xs text-gray-500 tabular-nums">
                        {tx.usdValue.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </p>
                    </td>
                    <td className="px-5 py-5">
                      <span
                        className={
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ' +
                          (tx.status === 'confirmed'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-amber-50 text-amber-700')
                        }
                      >
                        {tx.status === 'confirmed' ? (
                          <CheckCircle
                            aria-hidden="true"
                            className="size-3.5"
                          />
                        ) : (
                          <Clock aria-hidden="true" className="size-3.5" />
                        )}
                        {tx.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </span>
                      <p className="mt-1.5 text-xs text-gray-500">
                        {tx.confirmations} confirmations
                      </p>
                    </td>
                    <td className="px-5 py-5 whitespace-nowrap text-gray-600">
                      <time dateTime={tx.timestamp.toISOString()}>
                        {tx.timestamp.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-14 text-center">
                      <Search
                        aria-hidden="true"
                        className="mx-auto size-6 text-gray-400"
                      />
                      <p className="mt-3 font-medium text-gray-950">
                        No matching transactions
                      </p>
                      <p className="mt-2 text-gray-500">
                        Try another search or reset the status filter.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setSearch('');
                          setStatus('all');
                        }}
                      >
                        Clear filters
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
