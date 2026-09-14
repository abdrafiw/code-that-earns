/** @jest-environment node */
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from '@jest/globals';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  Timestamp,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

let environment: RulesTestEnvironment;
const projectId = 'demo-cte';
const future = Timestamp.fromDate(new Date('2099-01-01T00:00:00Z'));

const challenge = (companyUid = 'company-1') => ({
  schemaVersion: 2,
  title: 'Provider-neutral challenge',
  description: 'Build and document a useful working solution.',
  category: 'Coding',
  difficulty: 'Intermediate',
  outcome: {
    type: 'monetary',
    amountMinor: 10000,
    currency: 'USD',
    deliveryTerms: 'Delivered outside CTE within 14 days.',
  },
  winnerCount: 2,
  eligibility: 'Open to all developers.',
  deadline: future,
  searchTerms: ['provider'],
  searchSchemaVersion: 1,
  filterFacets: [
    'category:Coding',
    'difficulty:Intermediate',
    'category:Coding|difficulty:Intermediate',
  ],
  companyName: 'Acme',
  companyUid,
  status: 'open',
  submissions: 0,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'users/company-1'), {
      uid: 'company-1',
      email: 'company@example.com',
      role: 'COMPANY',
      companyName: 'Acme',
      createdAt: Timestamp.now(),
    });
    await setDoc(doc(db, 'users/developer-1'), {
      uid: 'developer-1',
      email: 'developer@example.com',
      role: 'DEVELOPER',
      name: 'Dev',
      createdAt: Timestamp.now(),
    });
    await setDoc(doc(db, 'users/developer-2'), {
      uid: 'developer-2',
      email: 'other@example.com',
      role: 'DEVELOPER',
      name: 'Other developer',
      createdAt: Timestamp.now(),
    });
  });
});

afterAll(async () => environment.cleanup());

describe('Firestore marketplace rules', () => {
  it('denies unauthenticated reads and writes', async () => {
    const db = environment.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'challenges/challenge-1')));
    await assertFails(setDoc(doc(db, 'challenges/challenge-1'), challenge()));
  });

  it('prevents companies from bypassing trusted publication', async () => {
    const db = environment
      .authenticatedContext('company-1', { email: 'company@example.com' })
      .firestore();
    await assertFails(setDoc(doc(db, 'challenges/challenge-1'), challenge()));
    await assertFails(
      setDoc(doc(db, 'challenges/forged'), challenge('another-company')),
    );
  });

  it('prevents developers from creating challenges', async () => {
    const db = environment
      .authenticatedContext('developer-1', { email: 'developer@example.com' })
      .firestore();
    await assertFails(
      setDoc(doc(db, 'challenges/challenge-1'), challenge('developer-1')),
    );
  });

  it('allows one owned submission and prevents client winner assignment', async () => {
    await environment.withSecurityRulesDisabled(async (context) =>
      setDoc(doc(context.firestore(), 'challenges/challenge-1'), {
        ...challenge(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }),
    );
    const db = environment
      .authenticatedContext('developer-1', { email: 'developer@example.com' })
      .firestore();
    const submissionRef = doc(db, 'submissions/challenge-1_developer-1');
    const submission = {
      schemaVersion: 2,
      challengeId: 'challenge-1',
      companyUid: 'company-1',
      challengeTitle: 'Provider-neutral challenge',
      challengeDescription: 'Build and document a useful working solution.',
      challengeOutcome: challenge().outcome,
      githubUrl: 'https://github.com/example/project',
      publicWinnerConsent: false,
      developerUid: 'developer-1',
      developerName: 'Dev',
      developerEmail: 'developer@example.com',
      status: 'submitted',
      createdAt: serverTimestamp(),
    };
    await assertSucceeds(setDoc(submissionRef, submission));
    await assertFails(setDoc(doc(db, 'submissions/another-id'), submission));
    await assertFails(updateDoc(submissionRef, { status: 'winner' }));

    const otherDeveloper = environment
      .authenticatedContext('developer-2', { email: 'other@example.com' })
      .firestore();
    await assertFails(
      getDoc(doc(otherDeveloper, 'submissions/challenge-1_developer-1')),
    );
    await assertFails(
      updateDoc(doc(otherDeveloper, 'submissions/challenge-1_developer-1'), {
        notes: 'Tampered',
      }),
    );
  });

  it('rejects invalid, excessive, closed, and expired submissions', async () => {
    await environment.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'challenges/open'), {
        ...challenge(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await setDoc(doc(db, 'challenges/closed'), {
        ...challenge(),
        status: 'in_review',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await setDoc(doc(db, 'challenges/expired'), {
        ...challenge(),
        deadline: Timestamp.fromDate(new Date('2000-01-01T00:00:00Z')),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    const db = environment
      .authenticatedContext('developer-1', { email: 'developer@example.com' })
      .firestore();
    const submission = (challengeId: string) => ({
      schemaVersion: 2,
      challengeId,
      companyUid: 'company-1',
      challengeTitle: 'Provider-neutral challenge',
      challengeDescription: 'Build and document a useful working solution.',
      challengeOutcome: challenge().outcome,
      githubUrl: 'https://github.com/example/project',
      publicWinnerConsent: false,
      developerUid: 'developer-1',
      developerName: 'Dev',
      developerEmail: 'developer@example.com',
      status: 'submitted',
      createdAt: serverTimestamp(),
    });

    await assertFails(
      setDoc(doc(db, 'submissions/open_developer-1'), {
        ...submission('open'),
        githubUrl: 'https://example.com/not-a-repository',
      }),
    );
    await assertFails(
      setDoc(doc(db, 'submissions/open_developer-1'), {
        ...submission('open'),
        notes: 'x'.repeat(2001),
      }),
    );
    await assertFails(
      setDoc(doc(db, 'submissions/closed_developer-1'), submission('closed')),
    );
    await assertFails(
      setDoc(doc(db, 'submissions/expired_developer-1'), submission('expired')),
    );
  });

  it('lets only the owner review a submission and blocks winner status', async () => {
    await environment.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'challenges/challenge-1'), {
        ...challenge(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await setDoc(doc(db, 'submissions/challenge-1_developer-1'), {
        schemaVersion: 2,
        challengeId: 'challenge-1',
        companyUid: 'company-1',
        challengeTitle: 'Provider-neutral challenge',
        challengeDescription: 'Build and document a useful working solution.',
        challengeOutcome: challenge().outcome,
        githubUrl: 'https://github.com/example/project',
        publicWinnerConsent: false,
        developerUid: 'developer-1',
        developerName: 'Dev',
        developerEmail: 'developer@example.com',
        status: 'submitted',
        createdAt: Timestamp.now(),
      });
    });
    const owner = environment
      .authenticatedContext('company-1', { email: 'company@example.com' })
      .firestore();
    const other = environment
      .authenticatedContext('company-2', { email: 'other@example.com' })
      .firestore();
    const ref = doc(owner, 'submissions/challenge-1_developer-1');
    await assertSucceeds(
      updateDoc(ref, { status: 'under_review', reviewedAt: serverTimestamp() }),
    );
    await assertFails(
      updateDoc(doc(other, 'submissions/challenge-1_developer-1'), {
        status: 'rejected',
        reviewedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(ref, { status: 'winner', reviewedAt: serverTimestamp() }),
    );
  });

  it('allows valid challenge closing but does not reopen terminal states', async () => {
    await environment.withSecurityRulesDisabled(async (context) =>
      setDoc(doc(context.firestore(), 'challenges/challenge-1'), {
        ...challenge(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }),
    );
    const db = environment
      .authenticatedContext('company-1', { email: 'company@example.com' })
      .firestore();
    const ref = doc(db, 'challenges/challenge-1');
    await assertSucceeds(
      updateDoc(ref, { status: 'cancelled', updatedAt: serverTimestamp() }),
    );
    await assertFails(
      updateDoc(ref, { status: 'open', updatedAt: serverTimestamp() }),
    );
  });
});
