import { useInfiniteQuery } from '@tanstack/react-query';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { transactionService } from '../../../services/transactions/transactionService';
import type { TransactionStatus } from '../types';
import { transactionKeys } from '../queryKeys';

type TransactionCursor = QueryDocumentSnapshot<DocumentData> | undefined;

async function getTransactions({
  userId,
  status,
  cursor,
}: {
  userId: string;
  status?: TransactionStatus;
  cursor?: QueryDocumentSnapshot<DocumentData>;
}) {
  return transactionService.getTransactionsForUser({ userId, status, cursor });
}

export function useGetTransactions(
  userId: string | undefined,
  status?: TransactionStatus,
) {
  return useInfiniteQuery({
    queryKey: transactionKeys.list(userId, status),
    queryFn: ({ pageParam }) =>
      getTransactions({ userId: userId!, status, cursor: pageParam }),
    initialPageParam: undefined as TransactionCursor,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.cursor : undefined,
    enabled: Boolean(userId),
  });
}
