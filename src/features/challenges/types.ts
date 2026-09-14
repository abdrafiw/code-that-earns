import type { ChallengeDeadline } from './utils/challengeDeadline';
import type {
  ChallengeDocument,
  ChallengeOutcome,
} from '../../services/firestore-structure';

export type TChallenge = Omit<
  Partial<ChallengeDocument>,
  'deadline' | 'companyName'
> & {
  id: string | number;
  title: string;
  description: string;
  category: string;
  company?: string;
  difficulty: string;
  outcome: ChallengeOutcome;
  winnerCount: number;
  eligibility: string;
  deadline: ChallengeDeadline;
};

export type CreateChallengePayload = {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  outcome: ChallengeOutcome;
  winnerCount: number;
  eligibility: string;
  responsibilityAccepted: true;
  deadline: Date;
};
