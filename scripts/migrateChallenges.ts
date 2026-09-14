import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import {
  FieldPath,
  getFirestore,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import {
  convertLegacyChallenge,
  convertLegacySubmission,
  MIGRATION_ID,
} from './generalRewardMigration';

const PAGE_SIZE = 200;
const shouldApply = process.argv.includes('--apply');
const wantsHelp =
  process.argv.includes('--help') || process.argv.includes('-h');
const projectId = process.argv
  .find((argument) => argument.startsWith('--project='))
  ?.slice('--project='.length);

type MigrationStats = {
  scanned: number;
  migrated: number;
  skipped: number;
  malformed: string[];
};

const emptyStats = (): MigrationStats => ({
  scanned: 0,
  migrated: 0,
  skipped: 0,
  malformed: [],
});

function backupRef(firestore: Firestore, collection: string, id: string) {
  return firestore
    .collection('migrationBackups')
    .doc(MIGRATION_ID)
    .collection('records')
    .doc(`${collection}__${id}`);
}

async function copyLegacyBounties(
  firestore: Firestore,
  apply: boolean,
  stats: MigrationStats,
) {
  let cursor: QueryDocumentSnapshot | undefined;
  do {
    let sourceQuery = firestore
      .collection('bounties')
      .orderBy(FieldPath.documentId())
      .limit(PAGE_SIZE);
    if (cursor) sourceQuery = sourceQuery.startAfter(cursor);
    const snapshot = await sourceQuery.get();
    if (snapshot.empty) break;
    const targets = await firestore.getAll(
      ...snapshot.docs.map((source) =>
        firestore.collection('challenges').doc(source.id),
      ),
    );
    const batch = firestore.batch();
    snapshot.docs.forEach((source, index) => {
      stats.scanned += 1;
      if (targets[index].exists) {
        stats.skipped += 1;
        return;
      }
      try {
        const converted = convertLegacyChallenge(source.data());
        stats.migrated += 1;
        if (apply) {
          batch.set(targets[index].ref, converted);
        }
      } catch (error) {
        stats.malformed.push(
          `bounties/${source.id}: ${(error as Error).message}`,
        );
      }
    });
    if (apply) await batch.commit();
    cursor = snapshot.docs.at(-1);
  } while (cursor);
}

async function migrateCollection(
  firestore: Firestore,
  collectionName: 'challenges' | 'submissions',
  apply: boolean,
  stats: MigrationStats,
) {
  let cursor: QueryDocumentSnapshot | undefined;
  do {
    let sourceQuery = firestore
      .collection(collectionName)
      .orderBy(FieldPath.documentId())
      .limit(PAGE_SIZE);
    if (cursor) sourceQuery = sourceQuery.startAfter(cursor);
    const snapshot = await sourceQuery.get();
    if (snapshot.empty) break;

    const outcomes = new Map<string, DocumentData>();
    if (collectionName === 'submissions') {
      const challengeIds = [
        ...new Set(
          snapshot.docs
            .map((item) => item.data().challengeId ?? item.data().bountyId)
            .filter((id): id is string => typeof id === 'string'),
        ),
      ];
      const challenges = challengeIds.length
        ? await firestore.getAll(
            ...challengeIds.map((id) =>
              firestore.collection('challenges').doc(id),
            ),
          )
        : [];
      challenges.forEach((item) => {
        if (item.exists && item.data()?.outcome) {
          outcomes.set(item.id, item.data()!.outcome);
        }
      });
    }

    const existingBackups = await firestore.getAll(
      ...snapshot.docs.map((item) =>
        backupRef(firestore, collectionName, item.id),
      ),
    );
    const batch = firestore.batch();
    for (const [index, item] of snapshot.docs.entries()) {
      stats.scanned += 1;
      const data = item.data();
      if (data.schemaVersion === 2) {
        stats.skipped += 1;
        continue;
      }
      try {
        const converted =
          collectionName === 'challenges'
            ? convertLegacyChallenge(data)
            : convertLegacySubmission(
                data,
                outcomes.get(data.challengeId ?? data.bountyId),
              );
        stats.migrated += 1;
        if (apply) {
          if (!existingBackups[index].exists) {
            batch.set(existingBackups[index].ref, {
              sourceCollection: collectionName,
              sourceId: item.id,
              original: data,
            });
          }
          batch.set(item.ref, converted);
        }
      } catch (error) {
        stats.malformed.push(
          `${collectionName}/${item.id}: ${(error as Error).message}`,
        );
      }
    }
    if (apply) await batch.commit();
    cursor = snapshot.docs.at(-1);
  } while (cursor);
}

export async function migrateGeneralRewards(
  firestore: Firestore,
  apply: boolean,
) {
  const stats = {
    bounties: emptyStats(),
    challenges: emptyStats(),
    submissions: emptyStats(),
  };
  await copyLegacyBounties(firestore, apply, stats.bounties);
  await migrateCollection(firestore, 'challenges', apply, stats.challenges);
  await migrateCollection(firestore, 'submissions', apply, stats.submissions);
  return stats;
}

function printStats(stats: Awaited<ReturnType<typeof migrateGeneralRewards>>) {
  for (const [collectionName, result] of Object.entries(stats)) {
    console.info(
      `${collectionName}: scanned=${result.scanned}, migrated=${result.migrated}, skipped=${result.skipped}, malformed=${result.malformed.length}`,
    );
    result.malformed.forEach((message) => console.error(`  ${message}`));
  }
}

if (wantsHelp) {
  console.info(`Usage: npm run migrate:challenges -- [options]

Options:
  --project=<firebase-project-id>  Override the ADC Firebase project
  --apply                          Back up and write changes (default: dry-run)
  --help                           Show this message`);
} else {
  const app =
    getApps()[0] ??
    initializeApp({
      credential: applicationDefault(),
      ...(projectId ? { projectId } : {}),
    });
  const stats = await migrateGeneralRewards(getFirestore(app), shouldApply);
  printStats(stats);
  if (!shouldApply) console.info('Dry run only: no documents were written.');
}
