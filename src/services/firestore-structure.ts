import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type WithFieldValue,
} from 'firebase/firestore';
import { z } from 'zod';

export const COLLECTIONS = {
  USERS: 'users',
  CHALLENGES: 'challenges',
  SUBMISSIONS: 'submissions',
  TRANSACTIONS: 'transactions',
} as const;

export const USER_ROLES = ['DEVELOPER', 'COMPANY'] as const;
export type UserRole = (typeof USER_ROLES)[number];

const timestampSchema = z.instanceof(Timestamp);
const nullableString = z.string().nullable();

export const userDocumentSchema = z.object({
  uid: z.string().min(1),
  email: z.email(),
  role: z.enum(USER_ROLES),
  name: z.string().trim().min(1).optional(),
  companyName: z.string().trim().min(1).optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.optional(),
});

export const challengeDocumentSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(1),
  difficulty: z.string().trim().min(1),
  rewardBTC: z.number().positive().max(21),
  deadline: timestampSchema,
  searchTerms: z.array(z.string()).max(100).default([]),
  searchSchemaVersion: z.number().int().nonnegative().default(0),
  filterFacets: z.array(z.string()).max(3).default([]),
  companyName: nullableString,
  companyUid: z.string().min(1),
  status: z
    .enum(['open', 'in-progress', 'completed', 'cancelled'])
    .default('open'),
  submissions: z.number().int().nonnegative().default(0),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const submissionDocumentSchema = z.object({
  challengeId: z.string().min(1),
  companyUid: z.string().min(1),
  challengeTitle: nullableString,
  challengeDescription: nullableString,
  challengeRewardBTC: z.number().positive().nullable(),
  githubUrl: z.url().refine((url) => url.startsWith('https://github.com/'), {
    message: 'Expected a GitHub repository URL',
  }),
  bitcoinAddress: z.string().trim().min(14).max(90),
  developerUid: z.string().min(1),
  developerName: nullableString,
  developerEmail: z.email().nullable(),
  status: z.enum(['submitted', 'reviewed', 'winner', 'rejected']),
  reviewNotes: z.string().max(5000).optional(),
  reviewedAt: timestampSchema.optional(),
  score: z.number().finite().optional(),
  createdAt: timestampSchema,
});

export const TRANSACTION_STATUSES = ['pending', 'completed', 'failed'] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const transactionDocumentSchema = z.object({
  challengeId: z.string().min(1),
  challengeTitle: z.string().optional(),
  fromUserId: z.string().min(1),
  toUserId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.literal('BTC'),
  status: z.enum(TRANSACTION_STATUSES),
  transactionHash: z.string().min(1).optional(),
  confirmations: z.number().int().nonnegative().optional(),
  usdValue: z.number().nonnegative().optional(),
  createdAt: timestampSchema,
});

export type UserDocument = z.infer<typeof userDocumentSchema>;
export type ChallengeDocument = z.infer<typeof challengeDocumentSchema>;
export type SubmissionDocument = z.infer<typeof submissionDocumentSchema>;
export type TransactionDocument = z.infer<typeof transactionDocumentSchema>;

export class FirestoreDataValidationError extends Error {
  constructor(collectionName: string, documentId: string, error: z.ZodError) {
    const fields = error.issues
      .map((issue) => issue.path.join('.') || 'document')
      .join(', ');
    super(`Invalid ${collectionName} data for ${documentId}: ${fields}`);
    this.name = 'FirestoreDataValidationError';
  }
}

function createConverter<T extends DocumentData>(
  collectionName: string,
  schema: z.ZodType<T>,
): FirestoreDataConverter<T> {
  return {
    toFirestore: (value: WithFieldValue<T>) => value,
    fromFirestore: (snapshot, options) => {
      const result = schema.safeParse(snapshot.data(options));
      if (!result.success) {
        throw new FirestoreDataValidationError(
          collectionName,
          snapshot.id,
          result.error,
        );
      }
      return result.data;
    },
  };
}

export const userConverter = createConverter(
  COLLECTIONS.USERS,
  userDocumentSchema,
);
export const challengeConverter = createConverter(
  COLLECTIONS.CHALLENGES,
  challengeDocumentSchema,
);
export const submissionConverter = createConverter(
  COLLECTIONS.SUBMISSIONS,
  submissionDocumentSchema,
);
export const transactionConverter = createConverter(
  COLLECTIONS.TRANSACTIONS,
  transactionDocumentSchema,
);
