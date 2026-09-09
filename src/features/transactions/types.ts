import type { TransactionDocument } from '../../services/firestore-structure';

export type { TransactionStatus } from '../../services/firestore-structure';

export type TransactionRecord = TransactionDocument & { id: string };
