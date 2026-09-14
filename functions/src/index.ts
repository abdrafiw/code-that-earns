import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { finalizeWinnersTransaction } from './finalizeWinners';
import {
  publishChallengeOperation,
  type PublishChallengeInput,
} from './publishChallenge';

initializeApp();

type FinalizeWinnersRequest = {
  challengeId?: unknown;
  submissionIds?: unknown;
};

export const finalizeWinners = onCall<FinalizeWinnersRequest>(
  async (request) => {
    if (!request.auth)
      throw new HttpsError('unauthenticated', 'Sign in to finalize winners.');
    const challengeId = request.data.challengeId;
    const submissionIds = request.data.submissionIds;
    if (
      typeof challengeId !== 'string' ||
      challengeId.trim().length === 0 ||
      challengeId.length > 256 ||
      !Array.isArray(submissionIds) ||
      submissionIds.length > 10 ||
      submissionIds.some(
        (id) =>
          typeof id !== 'string' || id.trim().length === 0 || id.length > 256,
      )
    ) {
      throw new HttpsError(
        'invalid-argument',
        'Provide a challenge ID and submission IDs.',
      );
    }
    return finalizeWinnersTransaction(getFirestore(), request.auth.uid, {
      challengeId,
      submissionIds: submissionIds as string[],
    });
  },
);

export const publishChallenge = onCall<PublishChallengeInput>(
  async (request) => {
    if (!request.auth)
      throw new HttpsError(
        'unauthenticated',
        'Sign in to publish a challenge.',
      );
    return publishChallengeOperation(
      getFirestore(),
      request.auth.uid,
      request.data,
    );
  },
);
