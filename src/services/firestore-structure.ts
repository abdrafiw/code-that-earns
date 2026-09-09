import type {
  DocumentData,
  FirestoreDataConverter,
  Timestamp,
  WithFieldValue,
} from 'firebase/firestore';

export const COLLECTIONS = {
  USERS: 'users',
  BOUNTIES: 'bounties',
  SUBMISSIONS: 'submissions',
  TRANSACTIONS: 'transactions',
} as const;

export const USER_ROLES = ['DEVELOPER', 'COMPANY'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface UserDocument extends DocumentData {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
  companyName?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface BountyDocument extends DocumentData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  bountyBTC: number;
  deadline: Timestamp;
  searchTerms: string[];
  companyName: string | null;
  companyUid: string;
  status?: string;
  submissions?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SubmissionDocument extends DocumentData {
  bountyId: string;
  companyUid: string;
  bountyTitle: string | null;
  bountyDescription: string | null;
  bountyRewardBTC: number | null;
  githubUrl: string;
  bitcoinAddress: string;
  developerUid: string;
  developerName: string | null;
  developerEmail: string | null;
  status?: string;
  createdAt: Timestamp;
}

export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface TransactionDocument extends DocumentData {
  bountyId: string;
  bountyTitle?: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: 'BTC';
  status: TransactionStatus;
  transactionHash?: string;
  confirmations?: number;
  usdValue?: number;
  createdAt: Timestamp;
}

function createConverter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (value: WithFieldValue<T>) => value,
    fromFirestore: (snapshot, options) => snapshot.data(options) as T,
  };
}

export const userConverter = createConverter<UserDocument>();
export const bountyConverter = createConverter<BountyDocument>();
export const submissionConverter = createConverter<SubmissionDocument>();
export const transactionConverter = createConverter<TransactionDocument>();
