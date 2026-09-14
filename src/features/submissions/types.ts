export type SubmitSolutionPayload = {
  submissionUrl: string;
  liveDemoUrl?: string;
  notes?: string;
  publicWinnerConsent: boolean;
  challengeID: string;
};

export type SubmissionRecord = Partial<SubmissionDocument> & {
  id: string;
  challengeId: string;
};
import type { SubmissionDocument } from '../../services/firestore-structure';
