import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import { deleteApp, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  publishChallengeOperation,
  type PublishChallengeInput,
} from './publishChallenge';

const projectId = 'demo-cte';
const app = initializeApp({ projectId }, 'publish-tests');
const db = getFirestore(app);

const validInput: PublishChallengeInput = {
  title: 'Build a useful API',
  description: 'Build and document a complete provider-neutral API.',
  category: 'Coding',
  difficulty: 'Intermediate',
  outcome: { type: 'recognition', recognitionLabel: 'Winner' },
  winnerCount: 1,
  eligibility: 'Open to all developers.',
  geographicRestrictions: 'None',
  deadline: '2099-01-01T00:00:00.000Z',
  responsibilityAccepted: true,
};

async function clearFirestore() {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  if (!host) throw new Error('FIRESTORE_EMULATOR_HOST is required.');
  await fetch(
    `http://${host}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    { method: 'DELETE' },
  );
  await db.collection('users').doc('company-1').set({
    role: 'COMPANY',
    companyName: 'Acme',
  });
  await db.collection('users').doc('developer-1').set({ role: 'DEVELOPER' });
}

beforeEach(clearFirestore);
afterAll(() => deleteApp(app));

describe('trusted challenge publication', () => {
  it.each([
    ['recognition', { type: 'recognition', recognitionLabel: 'Winner' }],
    [
      'monetary',
      {
        type: 'monetary',
        amountMinor: 10_000,
        currency: 'USD',
        deliveryTerms: 'Delivered outside CTE within 14 days.',
      },
    ],
    [
      'non-monetary',
      {
        type: 'non_monetary',
        rewardDescription: 'Mentorship session',
        deliveryTerms: 'Scheduled within 14 days.',
      },
    ],
    [
      'recognition and reward',
      {
        type: 'recognition_and_reward',
        recognitionLabel: 'Top solution',
        amountMinor: 10_000,
        currency: 'USD',
        deliveryTerms: 'Delivered outside CTE within 14 days.',
      },
    ],
  ])('publishes a valid %s challenge', async (_label, outcome) => {
    const result = await publishChallengeOperation(db, 'company-1', {
      ...validInput,
      outcome,
    });
    const created = await db.collection('challenges').doc(result.id).get();
    expect(created.data()).toMatchObject({
      schemaVersion: 2,
      status: 'open',
      companyUid: 'company-1',
      outcome,
    });
  });

  it('rejects unsupported currencies', async () => {
    await expect(
      publishChallengeOperation(db, 'company-1', {
        ...validInput,
        outcome: {
          type: 'monetary',
          amountMinor: 100,
          currency: 'ZZZ',
          deliveryTerms: 'External delivery.',
        },
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' });
  });

  it('rejects publication by a developer', async () => {
    await expect(
      publishChallengeOperation(db, 'developer-1', validInput),
    ).rejects.toMatchObject({ code: 'permission-denied' });
  });

  it('requires explicit off-platform responsibility confirmation', async () => {
    await expect(
      publishChallengeOperation(db, 'company-1', {
        ...validInput,
        responsibilityAccepted: false,
      }),
    ).rejects.toMatchObject({ code: 'failed-precondition' });
  });
});
