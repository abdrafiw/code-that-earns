---
name: firebase-security
description: Preserve CTE's Firebase trust boundaries when changing authentication, Firestore schemas, queries, rules, indexes, client services, Cloud Functions, transactions, or emulator tests; skip frontend-only presentation work with no data-access impact.
---

# Firebase Security

Treat browser input and direct Firestore requests as untrusted. A UI guard is never authorization, and Firebase Admin SDK code bypasses Firestore rules.

## Inspect the complete boundary

Before editing, inspect the relevant path end to end:

- Read `firestore.rules`, `src/services/firestore-structure.ts`, and `src/services/serviceGuards.ts` for affected collections or fields.
- Read the relevant client service and query hook for browser access behavior.
- Read `functions/src` for publication, finalization, or another trusted operation.
- Read `firestore.indexes.json` when a query shape changes.
- Read the closest unit, rule-emulator, backend, and workflow tests before changing behavior.

Keep types, runtime schemas, services, rules, indexes, Functions, tests, and documentation synchronized. Preserve legacy-read compatibility unless the task explicitly includes a completed migration.

## Authorization and data integrity

- Deny access by default. Require authentication, the correct `DEVELOPER` or `ORGANIZATION` role, resource ownership, and a valid lifecycle transition as applicable.
- Re-check identity, role, ownership, input, current state, and limits inside every callable trusted operation; never rely on claims made by the client.
- Permit clients to write only the fields and transitions they own. Publication, winner assignment, finalization, and other privileged outcomes must remain trusted-backend operations.
- Prevent users from reading or mutating another user's private profile or submission unless the documented organization-ownership rule explicitly permits it.
- Validate document IDs, bounded text, URLs, dates, enums, page sizes, and allowed fields at the first trusted boundary. Reject unknown or privilege-bearing fields.
- Use server timestamps for authoritative lifecycle events. Store monetary values as integer minor units with an explicit currency or legacy asset code; do not use floating-point values.

## Trusted writes

- Use a Firestore transaction when one decision updates multiple documents or depends on current state.
- Make terminal operations safe against retries and concurrent requests. Reject repeated or conflicting transitions without partial writes.
- Keep a failed operation atomic: either every related write commits or none do.
- Return bounded, actionable errors without logging secrets, private reward details, tokens, or unnecessary personal data.
- Never place privileged credentials or payment-provider secrets in `VITE_*` variables or browser code.

## Verification

- Add positive and negative tests at the lowest useful layer. Security tests must prove forbidden access, not only successful access.
- For rules or direct client access, run `npm run test:rules` and cover unauthenticated, wrong-role, wrong-owner, invalid-field, and invalid-transition cases that the change affects.
- For Cloud Functions or transactions, run `npm run test:backend` and cover authorization, validation, atomic failure, retry, and concurrency behavior where relevant.
- Also run affected unit tests and, in proportion to the change, `npm run format:check`, `npm run lint`, and `npm run build`.
- Do not deploy rules, indexes, Functions, migrations, or application code without an explicit deployment request. Report any emulator or credential limitation clearly.

When reviewing, lead with exploitable authorization gaps, data-integrity failures, privacy exposure, and missing negative tests, using concrete file and line evidence.
