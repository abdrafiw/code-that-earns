import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from '@jest/globals';
import { deleteApp, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { finalizeWinnersTransaction } from './finalizeWinners';

const projectId = 'demo-cte';
const app = initializeApp({ projectId }, 'winner-tests');
const db = getFirestore(app);

async function clearFirestore() {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  if (!host) throw new Error('FIRESTORE_EMULATOR_HOST is required.');
  const response = await fetch(
    `http://${host}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    { method: 'DELETE' },
  );
  if (!response.ok) throw new Error('Could not clear the Firestore emulator.');
}

async function seedChallenge(winnerCount = 1) {
  await Promise.all([
    db.collection('users').doc('company-1').set({ role: 'COMPANY' }),
    db.collection('users').doc('company-2').set({ role: 'COMPANY' }),
    db.collection('users').doc('developer-1').set({ role: 'DEVELOPER' }),
    db.collection('challenges').doc('challenge-1').set({
      companyUid: 'company-1',
      status: 'in_review',
      winnerCount,
    }),
    db.collection('submissions').doc('submission-1').set({
      challengeId: 'challenge-1',
      status: 'under_review',
      developerName: 'Public Developer',
      publicWinnerConsent: true,
    }),
    db.collection('submissions').doc('submission-2').set({
      challengeId: 'challenge-1',
      status: 'submitted',
      developerName: 'Private Developer',
      publicWinnerConsent: false,
    }),
  ]);
}

beforeAll(() => {
  db.settings({ ignoreUndefinedProperties: true });
});
beforeEach(clearFirestore);
afterAll(() => deleteApp(app));

describe('winner finalization transaction', () => {
  it('atomically completes the challenge and publishes consent-aware results', async () => {
    await seedChallenge(1);
    await expect(
      finalizeWinnersTransaction(db, 'company-1', {
        challengeId: 'challenge-1',
        submissionIds: ['submission-1'],
      }),
    ).resolves.toEqual({ challengeId: 'challenge-1', winnerCount: 1 });

    const [challenge, winner, rejected] = await Promise.all([
      db.collection('challenges').doc('challenge-1').get(),
      db.collection('submissions').doc('submission-1').get(),
      db.collection('submissions').doc('submission-2').get(),
    ]);
    expect(challenge.data()).toMatchObject({
      status: 'completed',
      results: [
        { submissionId: 'submission-1', displayName: 'Public Developer' },
      ],
    });
    expect(challenge.data()?.completedAt).toBeInstanceOf(Timestamp);
    expect(winner.data()?.status).toBe('winner');
    expect(rejected.data()?.status).toBe('rejected');
  });

  it('rejects non-owners without changing records', async () => {
    await seedChallenge();
    await expect(
      finalizeWinnersTransaction(db, 'company-2', {
        challengeId: 'challenge-1',
        submissionIds: ['submission-1'],
      }),
    ).rejects.toMatchObject({ code: 'permission-denied' });
    expect(
      (await db.collection('challenges').doc('challenge-1').get()).data()
        ?.status,
    ).toBe('in_review');
  });

  it('rejects selections over the limit without partial writes', async () => {
    await seedChallenge(1);
    await expect(
      finalizeWinnersTransaction(db, 'company-1', {
        challengeId: 'challenge-1',
        submissionIds: ['submission-1', 'submission-2'],
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' });
    expect(
      (await db.collection('submissions').doc('submission-1').get()).data()
        ?.status,
    ).toBe('under_review');
  });

  it('allows only one concurrent finalization to commit', async () => {
    await seedChallenge(1);
    const attempts = await Promise.allSettled([
      finalizeWinnersTransaction(db, 'company-1', {
        challengeId: 'challenge-1',
        submissionIds: ['submission-1'],
      }),
      finalizeWinnersTransaction(db, 'company-1', {
        challengeId: 'challenge-1',
        submissionIds: ['submission-2'],
      }),
    ]);
    expect(
      attempts.filter(({ status }) => status === 'fulfilled'),
    ).toHaveLength(1);
    expect(attempts.filter(({ status }) => status === 'rejected')).toHaveLength(
      1,
    );
  });

  it('rejects a repeated finalization request', async () => {
    await seedChallenge();
    const input = {
      challengeId: 'challenge-1',
      submissionIds: ['submission-1'],
    };
    await finalizeWinnersTransaction(db, 'company-1', input);
    await expect(
      finalizeWinnersTransaction(db, 'company-1', input),
    ).rejects.toMatchObject({ code: 'already-exists' });
  });
});
