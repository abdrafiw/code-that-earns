export type SubmitSolutionPayload = {
  githubUrl: string;
  bitcoinAddress: string;
  bountyID: string;
};

export type SubmissionRecord = Partial<SubmissionDocument> & {
  id: string;
  bountyId: string;
  githubUrl: string;
  bitcoinAddress: string;
};
import type { SubmissionDocument } from '../../services/firestore-structure';
