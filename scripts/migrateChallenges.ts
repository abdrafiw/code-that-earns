import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { FieldPath, Timestamp, getFirestore } from 'firebase-admin/firestore';

import {
  CHALLENGE_SEARCH_SCHEMA_VERSION,
  createChallengeFilterFacets,
  createChallengeSearchTerms,
} from '../src/features/challenges/utils/challengeFilters';

const PAGE_SIZE = 400;
const shouldApply = process.argv.includes('--apply');
const wantsHelp =
  process.argv.includes('--help') || process.argv.includes('-h');
const projectArgument = process.argv.find((argument) =>
  argument.startsWith('--project='),
);
const projectId = projectArgument?.slice('--project='.length);

if (wantsHelp) {
  console.info(`Usage: npm run migrate:challenges -- [options]

Options:
  --project=<firebase-project-id>  Override the ADC Firebase project
  --apply                          Write changes (default is dry-run)
  --help                           Show this message

Copies legacy bounties to challenges and renames challenge references in
submissions and transactions. The legacy bounties collection is retained as a
recovery copy. Authentication uses Application Default Credentials.`);
} else {
  await migrateChallenges();
}

function toChallengeData(data: FirebaseFirestore.DocumentData) {
  const { bountyBTC, rewardBTC, ...challengeData } = data;
  const deadline =
    typeof data.deadline === 'string' &&
    !Number.isNaN(Date.parse(data.deadline))
      ? Timestamp.fromDate(new Date(data.deadline))
      : data.deadline;

  return {
    ...challengeData,
    deadline,
    schemaVersion: 2,
    outcome: {
      type: 'monetary',
      amountMinor: Math.round((rewardBTC ?? bountyBTC) * 100_000_000),
      currency: 'BTC',
      deliveryTerms: 'Legacy Bitcoin reward arranged directly with the company.',
    },
    winnerCount: Number.isInteger(data.winnerCount) ? data.winnerCount : 1,
    eligibility: data.eligibility ?? 'See the original challenge terms.',
    geographicRestrictions: data.geographicRestrictions ?? 'Not specified in the legacy challenge.',
    status: data.status === 'in-progress' ? 'in_review' : (data.status ?? 'open'),
    legacy: { rewardBTC: rewardBTC ?? bountyBTC },
    searchTerms: createChallengeSearchTerms(
      data.title,
      data.description,
      data.category,
    ),
    filterFacets: createChallengeFilterFacets(data.category, data.difficulty),
    searchSchemaVersion: CHALLENGE_SEARCH_SCHEMA_VERSION,
  };
}

async function migrateChallenges() {
  const app =
    getApps()[0] ??
    initializeApp({
      credential: applicationDefault(),
      ...(projectId ? { projectId } : {}),
    });
  const firestore = getFirestore(app);

  let copiedChallenges = 0;
  let migratedSubmissions = 0;
  let migratedTransactions = 0;
  let skipped = 0;
  let cursor: FirebaseFirestore.QueryDocumentSnapshot | undefined;

  do {
    let legacyQuery = firestore
      .collection('bounties')
      .orderBy(FieldPath.documentId())
      .limit(PAGE_SIZE);
    if (cursor) legacyQuery = legacyQuery.startAfter(cursor);

    const snapshot = await legacyQuery.get();
    if (snapshot.empty) break;
    const targetSnapshots = await firestore.getAll(
      ...snapshot.docs.map((document) =>
        firestore.collection('challenges').doc(document.id),
      ),
    );
    const batch = firestore.batch();
    let batchWrites = 0;

    snapshot.docs.forEach((legacyChallenge, index) => {
      const data = legacyChallenge.data();
      if (
        targetSnapshots[index].exists ||
        typeof data.title !== 'string' ||
        typeof data.description !== 'string' ||
        typeof data.category !== 'string' ||
        typeof data.difficulty !== 'string' ||
        typeof (data.rewardBTC ?? data.bountyBTC) !== 'number'
      ) {
        if (!targetSnapshots[index].exists) skipped += 1;
        return;
      }

      copiedChallenges += 1;
      if (shouldApply) {
        batch.set(targetSnapshots[index].ref, toChallengeData(data));
        batchWrites += 1;
      }
    });

    if (batchWrites > 0) await batch.commit();
    cursor = snapshot.docs[snapshot.docs.length - 1];
  } while (cursor);

  // Convert documents that already live in the current challenges collection.
  // This also converts records copied from the legacy collection above.
  cursor = undefined;
  do {
    let challengeQuery = firestore.collection('challenges').orderBy(FieldPath.documentId()).limit(PAGE_SIZE);
    if (cursor) challengeQuery = challengeQuery.startAfter(cursor);
    const snapshot = await challengeQuery.get();
    if (snapshot.empty) break;
    const batch = firestore.batch();
    let batchWrites = 0;
    for (const document of snapshot.docs) {
      const data = document.data();
      if (data.schemaVersion === 2) continue;
      if (typeof (data.rewardBTC ?? data.bountyBTC) !== 'number') {
        skipped += 1;
        continue;
      }
      if (shouldApply) {
        batch.set(document.ref, toChallengeData(data));
        batchWrites += 1;
      }
    }
    if (batchWrites > 0) await batch.commit();
    cursor = snapshot.docs[snapshot.docs.length - 1];
  } while (cursor);

  const referenceMigrations = [
    {
      collection: 'submissions',
      legacyField: 'bountyId',
      targetField: 'challengeId',
      convert: (data: FirebaseFirestore.DocumentData) => ({
        challengeId: data.bountyId,
        challengeTitle: data.bountyTitle ?? null,
        challengeDescription: data.bountyDescription ?? null,
        schemaVersion: 2,
        challengeOutcome: {
          type: 'monetary',
          amountMinor: Math.round((data.bountyRewardBTC ?? 0) * 100_000_000),
          currency: 'BTC',
          deliveryTerms: 'Legacy Bitcoin reward arranged directly with the company.',
        },
      }),
    },
    {
      collection: 'transactions',
      legacyField: 'bountyId',
      targetField: 'challengeId',
      convert: (data: FirebaseFirestore.DocumentData) => ({
        challengeId: data.bountyId,
        challengeTitle: data.bountyTitle ?? null,
      }),
    },
  ] as const;

  for (const migration of referenceMigrations) {
    cursor = undefined;
    do {
      let referenceQuery = firestore
        .collection(migration.collection)
        .orderBy(FieldPath.documentId())
        .limit(PAGE_SIZE);
      if (cursor) referenceQuery = referenceQuery.startAfter(cursor);

      const snapshot = await referenceQuery.get();
      if (snapshot.empty) break;
      const batch = firestore.batch();
      for (const document of snapshot.docs) {
        const data = document.data();
        if (!(migration.legacyField in data) || migration.targetField in data) {
          continue;
        }
        if (migration.collection === 'submissions') migratedSubmissions += 1;
        else migratedTransactions += 1;
        if (shouldApply) {
          batch.update(document.ref, migration.convert(data));
        }
      }
      if (shouldApply) await batch.commit();
      cursor = snapshot.docs[snapshot.docs.length - 1];
    } while (cursor);
  }

  console.info(
    `${shouldApply ? 'Applied' : 'Dry run complete'}: ` +
      `${copiedChallenges} challenges to copy, ` +
      `${migratedSubmissions} submissions to update, ` +
      `${migratedTransactions} transactions to update, ${skipped} malformed.`,
  );
  if (!shouldApply) {
    console.info('Run the apply script after reviewing this result.');
  }
}
