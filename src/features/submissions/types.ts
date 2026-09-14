export type SubmitSolutionPayload = {
  githubUrl: string;
  liveDemoUrl?: string;
  notes?: string;
  publicWinnerConsent: boolean;
  challengeID: string;
};

export type SubmissionRecord = Partial<SubmissionDocument> & {
  id: string;
  challengeId: string;
  githubUrl: string;
};
import type { SubmissionDocument } from '../../services/firestore-structure';
