import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { FieldPath, getFirestore } from 'firebase-admin/firestore';

import {
  BOUNTY_SEARCH_SCHEMA_VERSION,
  createBountyFilterFacets,
  createBountySearchTerms,
} from '../src/features/bounties/utils/bountyFilters';

const PAGE_SIZE = 400;

const shouldApply = process.argv.includes('--apply');
const wantsHelp =
  process.argv.includes('--help') || process.argv.includes('-h');
const projectArgument = process.argv.find((argument) =>
  argument.startsWith('--project='),
);
const projectId = projectArgument?.slice('--project='.length);

if (wantsHelp) {
  console.info(`Usage: npm run migrate:bounty-search -- [options]

Options:
  --project=<firebase-project-id>  Override the ADC Firebase project
  --apply                          Write changes (default is dry-run)
  --help                           Show this message

Authentication uses Application Default Credentials. Set
GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON file when running
outside Google Cloud.`);
} else {
  await migrateBountySearch();
}

async function migrateBountySearch() {
  const app =
    getApps()[0] ??
    initializeApp({
      credential: applicationDefault(),
      ...(projectId ? { projectId } : {}),
    });
  const firestore = getFirestore(app);
  let cursor: FirebaseFirestore.QueryDocumentSnapshot | undefined;
  let scanned = 0;
  let eligible = 0;
  let skipped = 0;

  do {
    let bountyQuery = firestore
      .collection('bounties')
      .orderBy(FieldPath.documentId())
      .limit(PAGE_SIZE);
    if (cursor) bountyQuery = bountyQuery.startAfter(cursor);

    const snapshot = await bountyQuery.get();
    if (snapshot.empty) break;

    const batch = firestore.batch();
    let batchWrites = 0;

    for (const bounty of snapshot.docs) {
      scanned += 1;
      const data = bounty.data();
      const { title, description, category, difficulty } = data;

      if (
        typeof title !== 'string' ||
        typeof description !== 'string' ||
        typeof category !== 'string' ||
        typeof difficulty !== 'string'
      ) {
        skipped += 1;
        console.warn(`Skipping malformed bounty ${bounty.id}`);
        continue;
      }

      if (
        data.searchSchemaVersion === BOUNTY_SEARCH_SCHEMA_VERSION &&
        Array.isArray(data.searchTerms) &&
        Array.isArray(data.filterFacets)
      ) {
        continue;
      }

      eligible += 1;
      if (shouldApply) {
        batch.update(bounty.ref, {
          searchTerms: createBountySearchTerms(title, description, category),
          filterFacets: createBountyFilterFacets(category, difficulty),
          searchSchemaVersion: BOUNTY_SEARCH_SCHEMA_VERSION,
        });
        batchWrites += 1;
      }
    }

    if (batchWrites > 0) await batch.commit();
    cursor = snapshot.docs[snapshot.docs.length - 1];
  } while (cursor);

  console.info(
    `${shouldApply ? 'Applied' : 'Dry run complete'}: scanned ${scanned}, ` +
      `${eligible} eligible, ${skipped} malformed.`,
  );
  if (!shouldApply && eligible > 0) {
    console.info('Run the apply script after reviewing this dry-run result.');
  }
}
