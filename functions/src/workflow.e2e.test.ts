import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import { deleteApp, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { finalizeWinnersTransaction } from './finalizeWinners';
import { publishChallengeOperation } from './publishChallenge';

const projectId = 'demo-cte';
const app = initializeApp({ projectId }, 'workflow-e2e-tests');
const db = getFirestore(app);

async function clearFirestore() {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  if (!host) throw new Error('FIRESTORE_EMULATOR_HOST is required.');
  await fetch(
    `http://${host}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    { method: 'DELETE' },
  );
  await db.collection('users').doc('company-1').set({
    role: 'ORGANIZATION',
    companyName: 'Acme',
  });
}

beforeEach(clearFirestore);
afterAll(() => deleteApp(app));

describe('critical challenge workflow', () => {
  it('publishes, receives, reviews, finalizes, and announces a winner', async () => {
    const { id: challengeId } = await publishChallengeOperation(
      db,
      'company-1',
      {
        title: 'Build a useful API',
        description: 'Build and document a complete provider-neutral API.',
        category: 'Coding',
        difficulty: 'Intermediate',
        outcome: { type: 'recognition', recognitionLabel: 'Winner' },
        winnerCount: 1,
        eligibility: 'Open to all developers.',
        deadline: '2099-01-01T00:00:00.000Z',
        responsibilityAccepted: true,
      },
    );

    const submissionId = `${challengeId}_developer-1`;
    await db
      .collection('submissions')
      .doc(submissionId)
      .set({
        schemaVersion: 3,
        challengeId,
        companyUid: 'company-1',
        challengeTitle: 'Build a useful API',
        challengeDescription:
          'Build and document a complete provider-neutral API.',
        challengeOutcome: { type: 'recognition', recognitionLabel: 'Winner' },
        submissionUrl: 'https://github.com/developer/api',
        publicWinnerConsent: true,
        developerUid: 'developer-1',
        developerName: 'Ada Developer',
        developerEmail: 'ada@example.com',
        status: 'submitted',
      });

    await db.collection('challenges').doc(challengeId).update({
      status: 'in_review',
    });
    await db.collection('submissions').doc(submissionId).update({
      status: 'under_review',
    });

    await expect(
      finalizeWinnersTransaction(db, 'company-1', {
        challengeId,
        submissionIds: [submissionId],
      }),
    ).resolves.toMatchObject({ challengeId, winnerCount: 1 });

    const [challenge, submission] = await Promise.all([
      db.collection('challenges').doc(challengeId).get(),
      db.collection('submissions').doc(submissionId).get(),
    ]);
    expect(challenge.data()).toMatchObject({
      status: 'completed',
      results: [{ submissionId, displayName: 'Ada Developer' }],
    });
    expect(submission.data()?.status).toBe('winner');
  });
});
