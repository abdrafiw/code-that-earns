export type SubmitSolutionPayload = {
  githubUrl: string;
  bitcoinAddress: string;
  challengeID: string;
};

export type SubmissionRecord = Partial<SubmissionDocument> & {
  id: string;
  challengeId: string;
  githubUrl: string;
  bitcoinAddress: string;
};
import type { SubmissionDocument } from '../../services/firestore-structure';
