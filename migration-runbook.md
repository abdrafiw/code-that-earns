# Provider-neutral migration runbook

Migration ID: `provider-neutral-v2`

Do not deploy the provider-neutral client until this runbook has completed in
the target environment.

## Preparation

1. Stop legacy client writes or place the application in maintenance mode.
2. Record counts for `bounties`, `challenges`, and `submissions`.
3. Export Firestore using the approved project backup process and record the
   export location and timestamp.
4. Configure Application Default Credentials for the target project.

## Dry run

```bash
npm run migrate:challenges -- --project=<firebase-project-id>
```

Review the scanned, migrated, skipped, and malformed totals for every
collection. Every malformed record must be explained and corrected or explicitly
approved before apply. A dry run performs reads only.

## Apply and verify

```bash
npm run migrate:challenges:apply -- --project=<firebase-project-id>
npm run migrate:challenges:apply -- --project=<firebase-project-id>
```

The second apply must report zero migrations. Verify that:

- Source and destination record counts reconcile.
- Sample BTC values match `amountMinor = BTC * 100,000,000` exactly.
- Migrated documents use `schemaVersion: 2`.
- Active submissions contain no `bitcoinAddress` or floating BTC fields.
- Original challenge and submission documents exist under
  `migrationBackups/provider-neutral-v2/records`.
- Recognition/reward pages can read representative migrated records.

## Rollback

If verification fails, keep client writes disabled and restore the full Firestore
export taken during preparation. The per-document backup collection may be used
for investigation or targeted recovery, but the full export is the authoritative
rollback mechanism. Restore the legacy client, rules, and indexes together; do
not mix legacy clients with version 2 writes.

Do not delete the legacy `bounties` collection or the migration backup collection
until the rollback window has ended and record/value verification is approved.
