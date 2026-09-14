import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type WithFieldValue,
} from 'firebase/firestore';
import { z } from 'zod';
import { isSupportedStoredSubmissionUrl } from '../utils/submissionUrl';

export const COLLECTIONS = {
  USERS: 'users',
  CHALLENGES: 'challenges',
  SUBMISSIONS: 'submissions',
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

export const OUTCOME_TYPES = [
  'recognition',
  'monetary',
  'non_monetary',
  'recognition_and_reward',
] as const;
export type OutcomeType = (typeof OUTCOME_TYPES)[number];

export const challengeOutcomeSchema = z
  .object({
    type: z.enum(OUTCOME_TYPES),
    recognitionLabel: z.string().trim().min(1).max(80).optional(),
    amountMinor: z.number().int().positive().optional(),
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .optional(),
    rewardDescription: z.string().trim().min(1).max(1000).optional(),
    deliveryTerms: z.string().trim().min(1).max(2000).optional(),
  })
  .superRefine((outcome, context) => {
    const hasRecognition =
      outcome.type === 'recognition' ||
      outcome.type === 'recognition_and_reward';
    const hasReward =
      outcome.type === 'monetary' || outcome.type === 'recognition_and_reward';
    if (hasRecognition && !outcome.recognitionLabel) {
      context.addIssue({
        code: 'custom',
        path: ['recognitionLabel'],
        message: 'Required',
      });
    }
    if (hasReward && !outcome.amountMinor && !outcome.rewardDescription) {
      context.addIssue({
        code: 'custom',
        path: ['amountMinor'],
        message: 'A reward is required',
      });
    }
    if (outcome.amountMinor && !outcome.currency) {
      context.addIssue({
        code: 'custom',
        path: ['currency'],
        message: 'Required',
      });
    }
    if (
      outcome.type === 'non_monetary' &&
      (!outcome.rewardDescription || !outcome.deliveryTerms)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['deliveryTerms'],
        message: 'Description and delivery terms are required',
      });
    }
  });

export const challengeDocumentSchema = z.object({
  schemaVersion: z.literal(2),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(1),
  difficulty: z.string().trim().min(1),
  outcome: challengeOutcomeSchema,
  winnerCount: z.number().int().min(1).max(10),
  eligibility: z.string().trim().min(1).max(2000),
  deadline: timestampSchema,
  searchTerms: z.array(z.string()).max(100).default([]),
  searchSchemaVersion: z.number().int().nonnegative().default(0),
  filterFacets: z.array(z.string()).max(3).default([]),
  companyName: nullableString,
  companyUid: z.string().min(1),
  status: z
    .enum(['open', 'in_review', 'completed', 'cancelled'])
    .default('open'),
  submissions: z.number().int().nonnegative().default(0),
  results: z
    .array(z.object({ submissionId: z.string(), displayName: z.string() }))
    .max(10)
    .optional(),
  completedAt: timestampSchema.optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const submissionDocumentSchema = z.object({
  schemaVersion: z.literal(2),
  challengeId: z.string().min(1),
  companyUid: z.string().min(1),
  challengeTitle: nullableString,
  challengeDescription: nullableString,
  challengeOutcome: challengeOutcomeSchema,
  githubUrl: z
    .string()
    .max(2048)
    .url()
    .refine(
      isSupportedStoredSubmissionUrl,
      'Expected a supported HTTPS submission URL',
    ),
  liveDemoUrl: z
    .string()
    .max(2048)
    .url()
    .refine((value) => new URL(value).protocol === 'https:', {
      message: 'Expected an HTTPS live demo URL',
    })
    .optional(),
  notes: z.string().trim().max(2000).optional(),
  publicWinnerConsent: z.boolean(),
  developerUid: z.string().min(1),
  developerName: nullableString,
  developerEmail: z.email().nullable(),
  status: z.enum(['submitted', 'under_review', 'winner', 'rejected']),
  reviewNotes: z.string().max(5000).optional(),
  reviewedAt: timestampSchema.optional(),
  score: z.number().finite().optional(),
  createdAt: timestampSchema,
});

export type UserDocument = z.infer<typeof userDocumentSchema>;
export type ChallengeDocument = z.infer<typeof challengeDocumentSchema>;
export type SubmissionDocument = z.infer<typeof submissionDocumentSchema>;
export type ChallengeOutcome = z.infer<typeof challengeOutcomeSchema>;

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
