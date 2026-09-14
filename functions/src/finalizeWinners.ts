import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';

export type FinalizeWinnersInput = {
  challengeId: string;
  submissionIds: string[];
};

export async function finalizeWinnersTransaction(
  db: Firestore,
  actorUid: string,
  { challengeId, submissionIds }: FinalizeWinnersInput,
) {
  const uniqueIds = [...new Set(submissionIds)];
  if (!challengeId || uniqueIds.length === 0) {
    throw new HttpsError('invalid-argument', 'Select at least one submission.');
  }

  await db.runTransaction(async (transaction) => {
    const challengeRef = db.collection('challenges').doc(challengeId);
    const profileRef = db.collection('users').doc(actorUid);
    const [challengeSnapshot, profileSnapshot] = await Promise.all([
      transaction.get(challengeRef),
      transaction.get(profileRef),
    ]);

    if (!challengeSnapshot.exists) {
      throw new HttpsError('not-found', 'Challenge not found.');
    }
    if (!profileSnapshot.exists || profileSnapshot.data()?.role !== 'COMPANY') {
      throw new HttpsError(
        'permission-denied',
        'Only companies can finalize winners.',
      );
    }

    const challenge = challengeSnapshot.data()!;
    if (challenge.companyUid !== actorUid) {
      throw new HttpsError(
        'permission-denied',
        'Only the challenge owner can finalize winners.',
      );
    }
    if (challenge.status === 'completed') {
      throw new HttpsError(
        'already-exists',
        'Results have already been finalized.',
      );
    }
    if (challenge.status !== 'in_review') {
      throw new HttpsError(
        'failed-precondition',
        'Move the challenge to review before finalizing.',
      );
    }
    if (
      !Number.isInteger(challenge.winnerCount) ||
      uniqueIds.length > challenge.winnerCount
    ) {
      throw new HttpsError(
        'invalid-argument',
        'Winner selection exceeds the published limit.',
      );
    }

    const submissions = await transaction.get(
      db.collection('submissions').where('challengeId', '==', challengeId),
    );
    const submissionsById = new Map(
      submissions.docs.map((document) => [document.id, document]),
    );
    if (uniqueIds.some((id) => !submissionsById.has(id))) {
      throw new HttpsError(
        'invalid-argument',
        'A selected submission does not belong to this challenge.',
      );
    }
    if (
      uniqueIds.some((id) => {
        const status = submissionsById.get(id)?.data().status;
        return status !== 'submitted' && status !== 'under_review';
      })
    ) {
      throw new HttpsError(
        'failed-precondition',
        'A selected submission is not eligible.',
      );
    }

    for (const submission of submissions.docs) {
      transaction.update(submission.ref, {
        status: uniqueIds.includes(submission.id) ? 'winner' : 'rejected',
        reviewedAt: FieldValue.serverTimestamp(),
      });
    }

    const results = uniqueIds.map((submissionId) => {
      const submission = submissionsById.get(submissionId)!.data();
      return {
        submissionId,
        displayName: submission.publicWinnerConsent
          ? submission.developerName || 'Winner'
          : 'Private winner',
      };
    });

    transaction.update(challengeRef, {
      status: 'completed',
      results,
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return { challengeId, winnerCount: uniqueIds.length };
}
