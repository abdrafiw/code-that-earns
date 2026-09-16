# CTE Provider-Neutral MVP Requirements

## Objective

Expand CTE from a Bitcoin-only bounty app into a provider-neutral challenge
platform. Organizations publish challenges, developers submit solutions, and
organizations select and recognize one or more winners.

A challenge may offer recognition, a monetary reward, a non-monetary reward, or
recognition plus a reward. CTE records the promised outcome but never collects,
holds, transfers, escrows, refunds, verifies, or guarantees a reward. Organizations
and winners arrange any delivery outside CTE.

This is the smallest useful release. Items under "Deferred work" are not required
for the MVP.

## MVP completion outcome

The MVP is complete when:

1. An organization can create and publish a valid challenge.
2. A developer can find an open challenge and submit before its deadline.
3. The organization can review submissions and select no more than the published
   winner count.
4. Finalization marks winners and rejected submissions, completes the challenge,
   and publishes the result.
5. Rewarded challenges clearly state that delivery happens outside CTE.
6. Existing Bitcoin challenges remain readable after migration.

## MVP decisions

- Keep the existing `DEVELOPER` and `ORGANIZATION` roles.
- Require authentication for marketplace actions.
- Support one submission per developer per challenge.
- Support 1–10 winners, with the same reward offered to each winner.
- Store monetary amounts as integer minor units with an ISO 4217 currency code.
- Do not collect bank, mobile-money, payment-service, or wallet details. Winners
  and organizations coordinate delivery outside CTE using their existing contact
  channels.
- Publish challenges directly as `open`; drafts and previews are deferred.
- Use challenge states `open`, `in_review`, `completed`, and `cancelled`.
- Use submission states `submitted`, `under_review`, `winner`, and `rejected`.

## Implementation order

Complete these tasks in order. A task is complete only when its acceptance
criteria pass.

### [x] MVP-001 — Approve the outcome policy

Review and approve [`challenge-outcome-policy.md`](challenge-outcome-policy.md)
with these MVP constraints:

- CTE records outcomes but does not process or guarantee rewards.
- Reward-detail collection, fulfillment tracking, and disputes describe future
  behavior and are not implemented in the MVP.
- Every challenge discloses its outcome, winner count, eligibility, deadline,
  and relevant reward terms before submission.

Acceptance criteria:

- The four outcome types are defined: `recognition`, `monetary`,
  `non_monetary`, and `recognition_and_reward`.
- No wording presents CTE as a payment processor, escrow service, verifier, or
  guarantor.
- The policy is marked approved by the product owner.

### [x] MVP-002 — Replace the Bitcoin-only model

Replace `rewardBTC` with a provider-neutral outcome object:

```ts
type ChallengeOutcome = {
  type: 'recognition' | 'monetary' | 'non_monetary' | 'recognition_and_reward';
  recognitionLabel?: string;
  amountMinor?: number;
  currency?: string;
  rewardDescription?: string;
  deliveryTerms?: string;
};
```

- Remove `bitcoinAddress` from submissions.
- Remove transaction hashes, BTC totals, Bitcoin-specific copy, icons, and
  validation from the active product.
- Add `schemaVersion` and Firestore timestamps to challenges and submissions.
- Centralize locale-aware currency formatting.

Acceptance criteria:

- Recognition-only challenges require no amount or currency.
- Monetary amounts are positive integers and currencies are three-letter ISO
  codes.
- Non-monetary rewards require a description and delivery terms.
- TypeScript builds without legacy Bitcoin fields in production models or UI.

### [x] MVP-003 — Enforce lifecycle and access rules

- Permit `open -> in_review` when the deadline passes or the owner closes
  submissions.
- Permit `open -> cancelled` before winner finalization.
- Permit `in_review -> completed` only through winner finalization.
- Treat `completed` and `cancelled` as terminal.
- Permit `submitted -> under_review` and
  `submitted|under_review -> winner|rejected` during finalization.
- Keep ownership IDs and creation timestamps immutable.
- Update Firestore rules and indexes for the new fields and queries.
- Prevent duplicates with submission ID `{challengeId}_{developerUid}`.

Acceptance criteria:

- Unauthenticated users cannot write marketplace data.
- Developers cannot create challenges or review submissions.
- Organizations cannot submit or modify another organization's challenge.
- Clients cannot assign winner status or reopen terminal records.
- Rule tests cover both roles, owners, non-owners, and unauthenticated users.

### [x] MVP-004 — Add a minimal trusted backend

Add Firebase Cloud Functions or an equivalent trusted backend for privileged
multi-document operations. It must:

- Verify the Firebase ID token and validate role, ownership, input, state, and
  winner limit.
- Finalize winners in one Firestore transaction.
- Mark selected submissions `winner`, remaining submissions `rejected`, and the
  challenge `completed`.
- Reject repeated or conflicting finalization requests safely.
- Never transfer a reward.

Acceptance criteria:

- Browser or Firestore writes alone cannot select winners.
- Concurrent requests cannot exceed the winner count.
- A failed transaction leaves all records unchanged.
- Emulator and deployment instructions are documented.

### MVP-005 — Migrate existing data

Status: Deferred until production deployment; implementation and runbook are ready.

Replace the current migration with an idempotent dry-run/apply migration:

- Convert BTC rewards to monetary outcomes using `BTC` as the legacy asset code
  and an exact integer base-unit amount.
- Preserve legacy values in a rollback field or backup export.
- Remove Bitcoin addresses from active submission projections and the new UI.
- Map legacy statuses to the new lifecycle states.
- Report scanned, migrated, skipped, and malformed counts.

Acceptance criteria:

- Dry-run performs no writes and applying twice changes nothing the second time.
- Record counts and original economic values are verified.
- Rollback steps are documented before production use.

### [x] MVP-006 — Update challenge creation

Collect title, description, category, difficulty, deadline, outcome type, winner
count, and eligibility. Conditionally collect:

- A recognition label when recognition is offered.
- Integer amount and currency when money is offered.
- Description and delivery terms for a non-monetary reward.

Publish directly as `open` after the organization confirms responsibility for any
off-platform reward.

Acceptance criteria:

- All four outcome types can be published.
- Conditional fields are validated on the client and trusted write path.
- Invalid deadlines, winner counts, amounts, and missing terms produce actionable
  messages.

### [x] MVP-007 — Update discovery and challenge details

- Remove Bitcoin-specific wording and visuals.
- Show organization, deadline, status, outcome, per-winner reward, winner count,
  eligibility, and delivery terms.
- List only open, unexpired challenges by default.
- Retain search, category, difficulty, and stable pagination.
- Handle loading, empty, error, and retry states.

Acceptance criteria:

- Developers see all material terms before submitting.
- Recognition-only and rewarded challenges render correctly.
- Currency display is locale-aware and stored values use integer arithmetic.

### [x] MVP-008 — Generalize submissions

- Collect a Git repository URL, optional live-demo URL, and optional notes.
- Do not collect reward-delivery details.
- Allow one submission per developer per challenge.
- Reject submissions after the deadline or when the challenge is not `open`.
- Show developers their submitted links and current status.

Acceptance criteria:

- An eligible developer can submit once and view the result.
- Invalid URLs and excessive text are rejected.
- Developers cannot read or change another developer's submission.

### [x] MVP-009 — Complete review and winner selection

- Let organizations view only submissions to their own challenges.
- Show repository, demo, notes, developer display name, and status.
- Allow submissions to be marked `under_review`.
- Let the organization choose up to the winner count and explicitly confirm
  finalization through the trusted backend.

Acceptance criteria:

- Finalization is atomic and cannot be reversed from the client.
- Non-winners are rejected when results are finalized.
- An organization cannot select a submission from another challenge.

### [x] MVP-010 — Announce results and close the workflow

- Show results on the completed challenge page.
- Display consenting winners by display name; otherwise show `Private winner`.
- Show the recognition label and promised reward when applicable.
- State that rewards are delivered outside CTE and are not verified or
  guaranteed by CTE.

Acceptance criteria:

- Only finalized winners appear in results.
- No private contact, wallet, or payment information is public.
- Completed challenges reject submissions and further winner selection.

### [x] MVP-011 — Verify the release

- Add unit tests for outcomes, currency formatting, transitions, winner limits,
  and status display.
- Add Firestore emulator tests for role, ownership, duplicate submissions, and
  forbidden winner writes.
- Add backend integration tests for atomic finalization and retries.
- Add one end-to-end path covering publish, submit, review, finalize, and results.
- Update the README and deployment instructions.

Acceptance criteria:

- `npm run lint`, `npm run build`, and all tests pass.
- Critical workflows pass against Firebase emulators.
- Migrated challenges remain readable.
- No secrets or private reward information appear in bundles or logs.

## Deferred work

- Drafts, previews, versioned terms, and post-publication editing.
- Rich company/developer profiles, portfolios, skills, and logos.
- Account verification and password-recovery improvements.
- In-app and email notifications.
- Built-in collection, encryption, masking, and retention of delivery details.
- Reward `sent`, `confirmed`, and `disputed` workflows.
- Evidence uploads and administrator dispute resolution.
- Global Winners page and result filters.
- Reports, suspension, moderation dashboards, and administrator tooling.
- General-purpose immutable audit feeds.
- App Check, advanced rate limiting, and scheduled jobs.
- Account export/deletion automation and versioned consent records.
- Staging, monitoring alerts, backup automation, and rollout controls.
- Social features, chat, leaderboards, badges, AI matching, teams,
  subscriptions, native apps, escrow, and payment processing.

Deferred work must not be partially exposed in the MVP UI. Add it only after the
core workflow has been validated with real users.

## Definition of done

An MVP task is complete only when:

- Its acceptance criteria pass.
- Relevant types, validation, rules, indexes, UI states, and documentation are
  updated.
- Tests are added at the lowest useful level.
- `npm run lint`, `npm run build`, and relevant tests pass.
- No secrets, private delivery data, or unrelated generated files are committed.
