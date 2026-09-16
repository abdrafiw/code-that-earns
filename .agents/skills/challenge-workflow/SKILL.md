---
name: challenge-workflow
description: Preserve CTE's challenge, submission, outcome, and winner-selection rules when changing domain types, validation, services, UI, Firestore rules, Cloud Functions, migrations, tests, or product copy; skip unrelated platform work.
---

# Challenge Workflow

CTE is a provider-neutral challenge platform. Organizations publish challenges, developers submit solutions, and organizations select winners. CTE records promised outcomes but does not collect, hold, transfer, escrow, verify, or guarantee rewards.

## Read the authoritative scope

Before changing domain behavior, read the relevant sections of `requirements.md` and `challenge-outcome-policy.md`. Read both documents completely when a change affects outcomes, rewards, lifecycle states, winner selection, public results, privacy, or terminology.

Treat the MVP requirements as the implementation scope. The policy describes longer-term product direction: sections 5, 9, 10, and 12 are deferred and must not be partially exposed unless the user explicitly expands the product scope. Do not implement other items listed under `requirements.md`'s deferred work without explicit direction.

## Current domain invariants

- Keep roles as `DEVELOPER` and `ORGANIZATION`; require authentication for marketplace actions.
- Keep challenge states `open`, `in_review`, `completed`, and `cancelled`, and submission states `submitted`, `under_review`, `winner`, and `rejected`.
- Publish valid challenges directly as `open`. Drafts, previews, and post-publication material editing are outside the current MVP.
- Accept submissions only from eligible developers while the challenge is open and unexpired, with at most one submission per developer per challenge.
- Keep submission access limited to the submitting developer and the organization that owns the related challenge.
- Preserve category-specific submission requirements: UI/UX design accepts supported Figma, Behance, or Dribbble project links; other current technical challenges require a supported GitHub repository URL. Optional demo URLs must use HTTPS.
- Allow 1–10 winners. The published reward is per winner, not a shared pool, and finalization may never exceed the configured limit.
- Finalize winners only through the privileged atomic backend. Mark selected submissions `winner`, remaining submissions `rejected`, and the challenge `completed`; reject retries and conflicting finalization safely.

## Outcomes, privacy, and copy

- Support recognition, monetary reward, non-monetary reward, and recognition plus reward. Validate every conditional term at both UI and trusted boundaries.
- Store monetary values as integer minor units with their published currency. Format them for display without changing stored economic value.
- Show material eligibility, deadline, winner-count, outcome, and delivery terms before submission.
- Never collect reward-delivery details in the current MVP. Never expose private contact, wallet, payment, or non-consenting winner information.
- Publish a winner's display name only with consent; otherwise use `Private winner` without identifying information.
- State clearly that any reward is delivered off-platform and is neither processed nor guaranteed by CTE.
- Use the policy terminology: challenge, outcome, recognition, reward, reward method, and reward status. Do not describe CTE as processing payouts, transactions, escrow, guaranteed payments, or verified payments.

## Change checklist

- Trace a domain change through constants, TypeScript types, runtime schemas, form validation, transforms, services, query keys, rules, indexes, Functions, UI states, tests, and user-facing documentation.
- Preserve readable legacy challenge and submission records. If stored fields or semantics change, inspect `migration-runbook.md` and the migration scripts; do not perform or deploy a migration without explicit authorization.
- Keep lifecycle and authorization rules consistent across client affordances, service guards, Firestore rules, and trusted Functions. Use `$firebase-security` as well when the change touches a Firebase trust boundary.
- Cover affected outcome variants, valid and invalid transitions, role and ownership boundaries, deadlines, duplicate submissions, winner limits, consent-aware results, and legacy reads at the lowest useful test level.
- Run relevant tests and, in proportion to the change, `npm run test:rules`, `npm run test:backend`, `npm run format:check`, `npm run lint`, and `npm run build`.

When reviewing, distinguish current MVP requirements from future policy and report violations with concrete file and line evidence, ordered by product, security, privacy, and data-integrity impact.
