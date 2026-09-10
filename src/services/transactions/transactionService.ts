import {
  collection,
  and,
  getDocs,
  limit,
  or,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS, transactionConverter } from '../firestore-structure';
import type {
  TransactionRecord,
  TransactionStatus,
} from '../../features/transactions/types';
import { getErrorMessage } from '../../utils/getErrorMessage';

export type TransactionPage = {
  transactions: TransactionRecord[];
  cursor?: QueryDocumentSnapshot<DocumentData>;
  hasMore: boolean;
};

class TransactionService {
  async getTransactionsForUser({
    userId,
    status,
    pageSize = 20,
    cursor,
  }: {
    userId: string;
    status?: TransactionStatus;
    pageSize?: number;
    cursor?: QueryDocumentSnapshot<DocumentData>;
  }): Promise<TransactionPage> {
    try {
      const transactionCollection = collection(
        db,
        COLLECTIONS.TRANSACTIONS,
      ).withConverter(transactionConverter);
      const participantFilter = status
        ? or(
            and(
              where('fromUserId', '==', userId),
              where('status', '==', status),
            ),
            and(where('toUserId', '==', userId), where('status', '==', status)),
          )
        : or(
            where('fromUserId', '==', userId),
            where('toUserId', '==', userId),
          );
      const transactionQuery = cursor
        ? query(
            transactionCollection,
            participantFilter,
            orderBy('createdAt', 'desc'),
            startAfter(cursor),
            limit(pageSize),
          )
        : query(
            transactionCollection,
            participantFilter,
            orderBy('createdAt', 'desc'),
            limit(pageSize),
          );
      const snapshot = await getDocs(transactionQuery);

      return {
        transactions: snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        })),
        cursor: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === pageSize,
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const transactionService = new TransactionService();
