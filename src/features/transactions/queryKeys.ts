import type { TransactionStatus } from './types';

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (userId: string | undefined, status?: TransactionStatus) =>
    [...transactionKeys.lists(), userId, { status: status ?? 'all' }] as const,
};
