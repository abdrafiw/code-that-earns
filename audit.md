# CTE Project Audit

Audit date: 2026-09-09

Scope: React frontend, hooks and state, React Query, Firebase Authentication, Firestore services and rules, payment code, routing, deployment, tests, accessibility, and performance.

Validation baseline:

- Production build passes, with a JavaScript chunk-size warning.
- All 15 existing tests pass.
- ESLint completes with three warnings because generated coverage files are linted.
- Passing checks do not cover the security and runtime defects below.

## Critical: authorization and data integrity

[x] Submission creation checks a custom auth claim that the application never sets

Evidence: `submissionService.submitSolution()` checks `tokenResult.claims.role`, while signup stores the role only in `users/{uid}`. Valid developers can therefore be rejected even though the Firestore rule considers them developers.

Solution: Use the same trusted authorization source everywhere. Prefer server-managed custom claims set by an Admin SDK backend, or read the Firestore user profile as the bounty service currently does. Keep the Firestore rule aligned with that source and add emulator tests for developer/company access.

[x] A user can change their own role and promote themselves to a company

Evidence: `firestore.rules` allows a user to update their entire `users/{userId}` document. It does not prevent changes to `role`, `uid`, `email`, or other privileged fields.

Solution: Make role assignment server-controlled. In rules, permit only an explicit set of editable profile fields and require protected fields to remain unchanged using `request.resource.data.diff(resource.data).affectedKeys().hasOnly([...])`. Use custom claims for authorization if possible.

[x] Bounty ownership can be forged during creation

Evidence: the bounty create rule checks that the caller's profile says `COMPANY`, but does not require `request.resource.data.companyUid == request.auth.uid`. A company can create a bounty owned by another UID.

Solution: Validate `companyUid`, required fields, allowed category/difficulty values, positive reward, timestamps, and deadline in the create rule. Set ownership fields in a trusted Cloud Function for stronger guarantees.

[x] Submission ownership and bounty validity can be forged during creation

Evidence: the submission create rule checks only the caller's role. It does not require `developerUid == request.auth.uid`, verify that `bountyId` exists/is open, or validate submitted fields.

Solution: Require the developer UID to equal `request.auth.uid`, require the referenced bounty to exist and accept submissions, validate the GitHub URL and allowed keys, and set server-owned status/timestamp fields through trusted code.

[x] Company submission updates are effectively unrestricted

Evidence: a bounty owner may update the entire submission document. They can alter `developerUid`, `bountyId`, repository URL, wallet address, and creation timestamp, not only review fields.

Solution: Restrict company updates to review fields such as `status`, `reviewNotes`, `reviewedAt`, and score. Require ownership/reference fields to remain unchanged and validate status transitions.

[x] Transaction creation is insecure for a financial record

Evidence: any user whose editable profile says `COMPANY` can create any transaction payload, including arbitrary sender, recipient, amount, and status.

Solution: prohibit transaction writes from browser clients. Create and update transactions only through a trusted backend using the Admin SDK after payment-provider verification. Keep clients read-only for authorized records.

[x] All authenticated users can read every user profile

Evidence: `allow read: if isAuthenticated()` exposes complete user documents, including email and any wallet/profile fields, to every signed-in account.

Solution: make private user documents owner-only. Put intentionally public fields in a separate public profile collection with a minimal schema, or expose them through a backend projection.

[x] The payment service exposes an API credential to browser code and uses the wrong environment API

Evidence: `bitcoinService.ts` sends payments directly from the browser with `process.env.REACT_APP_BITNOB_KEY`. Vite uses `import.meta.env`, and any client-exposed key can be extracted from the bundle regardless.

Solution: remove payment execution from the frontend. Call a secured Cloud Function/server endpoint that stores the provider key in server secrets, authenticates the caller, validates bounty ownership and amount, applies idempotency, and records provider results.

## High: broken application behavior

[x] Creating a bounty invalidates the wrong React Query cache

Evidence: `useCreateBounty()` invalidates `['bounties']`, but the company page reads `['companyBounties', uid, filters]`. A successful create can leave the company table stale.

Solution: centralize query-key factories and invalidate both the public bounty list and the current company's bounty prefix, e.g. `bountyKeys.all` and `bountyKeys.company(uid)`. Alternatively update the company cache optimistically from the mutation result.

[x] Developer bounty filters have state and controls but do not filter anything

Evidence: `DevBountiesPage` stores category and difficulty with `useState`, but neither value is passed to the query nor applied to the rendered list.

Solution: add filters to `useGetBounties`, include them in the query key, and apply them in Firestore. Remove the controls until backend filtering is implemented if they cannot work correctly.

[x] The public bounty query silently shows only the first 20 records

Evidence: `getAllBounties()` supports a cursor and `hasMore`, but `useGetBounties()` calls it once and discards `lastDoc` and `hasMore`.

Solution: use `useInfiniteQuery` with Firestore cursors and render a Load More/infinite-scroll control, or remove pagination from the service and explicitly document the bounded result.

[x] Bounty-detail failures are converted into a false "not found" state

Evidence: `useBounty.ts` casts `result.bounty` without checking `result.success`, has no `enabled: Boolean(bountyId)`, and `SubmitSolutionPage` does not render query errors.

Solution: make `getBountyById` throw the service error, disable the query when no ID exists, and render `PageErrorState` with retry separately from a genuine not-found response.

[x] Auth profile loading can preserve a stale user or incorrectly appear logged out

Evidence: `AppContext` does not clear `user` when an authenticated Firebase account has no profile or when profile loading fails. `getCurrentUserData()` also collapses network errors and missing profiles into `null`.

Solution: model auth as explicit states (`loading`, `authenticated`, `profile-missing`, `error`, `anonymous`). Clear stale state before loading a new UID, surface retryable errors, and handle missing-profile recovery deliberately.

[x] Signup can leave an orphaned Firebase Auth account

Evidence: Auth creation, profile update, and Firestore profile creation are separate client operations. If Firestore creation fails, the Auth account remains and the next signup reports that the email already exists.

Solution: move signup/profile provisioning to a trusted backend workflow, or delete the newly created Auth user on profile-write failure. Provide a recover-profile path and test partial failures.

[x] Login silently creates a developer profile when a profile is missing

Evidence: `signIn()` defaults every missing profile to `DEVELOPER`. This can misclassify company accounts and hides data corruption.

Solution: never infer a role during login. Route to profile recovery/onboarding, or reconstruct the profile from trusted server metadata/custom claims.

[x] Logout clears local state before Firebase confirms sign-out

Evidence: `handleLogout()` does not await `toast.promise(authService.signOut())`; it immediately clears context and navigates even if sign-out fails. The surrounding `try/catch` cannot catch the asynchronous rejection/result.

Solution: await the sign-out result, throw on `{ success: false }`, then clear state and navigate only after success. Let `onAuthStateChanged` remain the source of truth for context state.

[x] Submit-solution success has incomplete UX and failures are not shown

Evidence: `SubmitSolutionForm` clears fields on success but shows no success message or navigation, and provides no mutation `onError` handler.

Solution: show normalized success/error feedback, navigate to the developer submissions page after success, retain form values on failure, and prevent duplicate submissions while pending.

[x] Duplicate submissions are not prevented

Evidence: neither service nor rules prevent the same developer from submitting repeatedly for one bounty.

Solution: use a deterministic document ID such as `${bountyId}_${developerUid}` or a backend transaction, and reject creation when an active submission already exists.

[x] Company search excludes all legacy bounties without `searchTerms`

Evidence: filtered search uses `array-contains` on a field only added by the newer create flow. Existing documents are never returned by search.

Solution: run a one-time Admin SDK migration to populate normalized search fields for every existing bounty. Version the search schema and test migration/backfill behavior.

[x] Company KPI values represent filtered rows but are labeled as global totals

Evidence: published count, reward pool, and category count are calculated from the currently filtered query result.

Solution: fetch global metrics separately with Firestore aggregation queries, or relabel them as filtered metrics. Do not download all documents merely to compute totals.

[x] Firestore backend search issues requests for intermediate keystrokes

Evidence: `useDeferredValue` prioritizes rendering but is not a debounce guarantee; changing the search value changes the React Query key and can issue multiple indexed reads.

Solution: use a real 250–400 ms debounced search value, require a sensible minimum search length, and cancel/ignore superseded requests where supported.

[x] Firestore profile and content data is trusted through unchecked type assertions

Evidence: services use `DocumentData`, `any`, and `as UserData`/`as TBounty` without runtime validation. Malformed documents can propagate invalid roles, dates, and amounts into UI and authorization decisions.

Solution: add Firestore data converters plus runtime schemas (for example Zod or Valibot) at the service boundary. Reject or safely default invalid documents and keep domain types aligned with stored data.

## React, hooks, and frontend architecture

[x] Header uses an effect and state for a value derived entirely from context

Evidence: `name` is set from `user` inside `useEffect`. It can stay stale after logout and causes an unnecessary render cycle.

Solution: derive `const name = user?.success ? ... : ''` during render. Reserve effects for synchronization with external systems, not derived render data.

[x] AppContext contains dead global state

Evidence: `currentView` and `selectedBounty` are stored and exposed but never consumed outside the provider. Router state already represents the current view.

Solution: remove both state pairs from context. Use route params/query state for navigation and React Query cache or local component state for selected records.

[x] The context provider value is recreated on every provider render

Evidence: an inline object is passed to `AppContext.Provider`, so every consumer rerenders whenever any provider state changes.

Solution: after removing dead state, split auth into a focused context and memoize the value with `useMemo` if profiling shows meaningful fan-out. Prefer subscribing to narrower state slices.

[x] Route protection is scattered and inconsistent

Evidence: some pages redirect, some return access-denied content, and company/transaction routes rely mostly on page logic. Navigation visibility is not a route guard.

Solution: add declarative authenticated and role-aware route wrappers/loaders. Define allowed roles per route and redirect consistently while retaining Firestore rules as the real security boundary.

[x] There is no router error boundary or catch-all route

Evidence: `errorElement` is commented out and no `*` route exists.

Solution: add a route-level error boundary for loader/render failures and a proper 404 page with recovery navigation.

[x] Query hooks expose custom `loading`/`error` shapes inconsistently

Evidence: submission hooks remap React Query state while bounty hooks return the query object directly. This loses typed errors and creates inconsistent page APIs.

Solution: return React Query results consistently, or create a well-typed shared adapter used by every query. Preserve `isPending`, `isFetching`, `error`, and `refetch` semantics.

[x] Query-key naming is inconsistent and not centralized

Evidence: keys include `bounties`, `companyBounties`, `company-submissions`, and `developer-submissions`, making invalidation easy to get wrong.

Solution: create query-key factories by domain and use them in every query, mutation invalidation, prefetch, and test.

[x] The company bounty hook is outside its feature and duplicates bounty mapping

Evidence: `src/hooks/useCompanyBounties.tsx` belongs to the bounty feature and defines a second `Bounty` model/mapping separate from `TBounty` and `transformBounty`.

Solution: move it into `features/bounties/hooks/useBounties.ts`, use one domain type and one Firestore converter/transformer, and remove `any` mappings.

[x] Bounty hook names are singular even though they fetch collections

Evidence: the collection query previously used the singular names `getBounty`/`useGetBounty` even though `getAllBounties()` returns an array.

Solution: rename them to `getBounties`/`useGetBounties`; reserve singular names for ID-based queries.

[x] Form state and validation are duplicated and weakly typed

Evidence: auth and bounty forms keep large objects in `useState`, repeatedly spread snapshots, and implement ad hoc validation. Signup permits an empty developer name and has no shared schema.

Solution: use a typed form schema and reducer/form library, trim inputs, validate role-specific required fields, URLs, BTC addresses, bounds, and dates, and map schema errors to accessible field messages.

[x] The signup role is initialized as an invalid empty string and cast into `UserRole`

Evidence: state uses `role: ''` and later casts values with `as UserRole`, bypassing type safety.

Solution: type state as `UserRole | null`, avoid casts, and branch explicitly before creating the payload.

[x] Several semantic/accessibility states have incorrect layout and missing actions

Evidence: submission unauthenticated/not-found states place heading and paragraph directly in a flex row; the mobile sheet has an empty hidden title; error/empty pages often lack navigation or retry.

Solution: use a vertical content wrapper, meaningful dialog/sheet titles, focus management, login/back actions, and consistent retry support. Add accessibility tests with role/name assertions.

[x] The main bundle is too large

Evidence: the production build emits roughly 1.2 MB of JavaScript (about 334 KB gzip) and Vite warns that a chunk exceeds 500 KB.

Solution: lazy-load route modules with `React.lazy`/router lazy routes, load Firebase Analytics and heavy calendar components on demand, inspect the bundle, and remove unused dependencies/components.

## Backend/data model and product correctness

[x] The documented Firestore schema does not match the implementation

Evidence: `firestore-structure.tsx` documents lowercase roles and fields such as `createdBy`, `bountyAmount`, and `developerId`, while runtime code uses uppercase roles, `companyUid`, `bountyBTC`, and `developerUid`.

Solution: replace the stale `.tsx` pseudo-schema with shared TypeScript domain types/converters that exactly match stored documents. Use constants from one source in forms, services, rules tests, and migrations.

[x] Dates are stored as strings instead of Firestore timestamps

Evidence: bounty deadlines are formatted to `yyyy-MM-dd` before persistence even though the schema describes timestamps.

Solution: store deadlines as Firestore `Timestamp` values in UTC, convert only at the UI boundary, and define whether the deadline closes at start or end of day in a named timezone.

[x] Submission queries and joins are not scalable

Evidence: company submissions first fetch every company bounty, then chunk `in` queries for submissions, then fetch developers. Cost and latency grow with the company's full history.

Solution: denormalize `companyUid`, bounty title, and safe developer display fields into submissions at creation; query submissions directly by `companyUid` with pagination and indexes. Keep canonical references for reconciliation.

[x] Submission and bounty list queries have no deterministic ordering

Evidence: company bounty and submission queries omit `orderBy`, so list order is undefined and can change between reads.

Solution: add server timestamps and composite indexes, then order by `createdAt desc` with cursor pagination.

[x] Transactions are hard-coded demo objects rather than backend records

Evidence: `TransactionsPage` calculates all values from `sampleTransactions`; the Firestore transactions collection is unused.

Solution: either label the route as an explicit demo unavailable in production, or implement a read-only paginated transaction query backed by server-created records and provider verification.

[x] Firebase Analytics is initialized unconditionally

Evidence: `getAnalytics(app)` runs during module initialization without checking browser support, environment, consent, or whether a measurement ID exists.

Solution: initialize Analytics lazily only in production after `isSupported()` and consent checks. Do not let analytics failure prevent app startup.

[x] Error handling mixes result objects and thrown exceptions

Evidence: services return `{ success: false }`, query functions convert some failures to exceptions, and auth mutation functions resolve failures through `onSuccess`.

Solution: adopt one convention. For React Query, service/query functions should throw typed domain errors on failure so `isError`, retries, and `onError` work correctly; reserve result unions for expected non-error outcomes.

[x] Firestore query indexes are manually enumerated for every filter combination

Evidence: seven near-duplicate indexes support combinations of company, category, difficulty, and search tokens. This grows exponentially as filters are added.

Solution: simplify the search model, use a dedicated search service for full-text/faceted search, or constrain supported combinations. Monitor index storage/write amplification and document required indexes.

## Tooling, deployment, and repository hygiene

[x] A real `.env` file is tracked by Git

Evidence: `git ls-files .env` reports the file as tracked, while `.gitignore` does not ignore `.env`.

Solution: rotate any exposed credentials, remove `.env` from Git history/index, add `.env`, `.env.*`, and an allow-rule for `.env.example` to `.gitignore`, then commit a redacted example file.

[x] Firebase generated cache and placeholder artifacts are present in the repository/worktree

Evidence: a Firebase hosting cache file is tracked, another cache and `public/index.html` are untracked, and the placeholder previously caused the wrong site to deploy.

Solution: ignore `.firebase/`, remove generated cache files from version control, delete the placeholder `public/index.html`, keep `firebase.json` pointed at `dist`, and deploy only after a successful build.

[] Production deployment is not automated or verified

Evidence: the main CI workflow builds but never deploys. The generated Firebase workflow handles PR previews only.

Solution: add a protected post-CI production deployment job for pushes to `main`, pin action versions, use the Firebase service account secret, deploy hosting/rules/indexes deliberately, and add a smoke test against the deployed URL.

[x] ESLint scans generated coverage output and important rules are disabled

Evidence: lint reports warnings inside `coverage/`; `no-explicit-any` and `no-unused-vars` are disabled, hiding issues visible throughout services and models.

Solution: ignore `coverage`, `.firebase`, and generated output; re-enable TypeScript unused/`any` rules incrementally; add rules for strict equality and consistent type imports; fail CI on warnings.

[] Tests cover only four UI components and no backend security behavior

Evidence: 15 tests cover login, signup, bounty card, and submit form. Services, hooks, route guards, network errors, query invalidation, Firestore rules, and partial auth failures are untested.

Solution: add unit tests for query functions and converters, integration tests with mocked Firebase, and Firebase Emulator rule tests for every role/action. Add route/auth and mutation-cache tests to CI.

[x] Test tooling versions are mismatched

Evidence: Jest is version 30 while `ts-jest` is version 29, and tests emit a TypeScript interoperability warning.

Solution: align Jest and transformer major versions or migrate to Vitest for native Vite/ESM support. Remove the warning and make test compilation mirror production TypeScript settings where practical.

[x] Unnecessary runtime dependencies are installed

Evidence: `i` and `npm` are application dependencies, although neither is imported by source code. Shipping/maintaining them increases dependency and audit surface.

Solution: remove unused runtime packages, run a dependency audit, and keep build/test tools in devDependencies only.

[x] Dead files and exports remain in the project

Evidence: legacy loading components, unused service methods, starter assets, and the standalone Bitcoin service are not referenced by the app.

Solution: verify with static analysis, delete dead code/assets, and add an unused-export/dependency check such as Knip to CI.

## Recommended resolution order

1. Fix Firestore rules, submission authorization, role assignment, and payment architecture.
2. Fix auth consistency, mutation/query error semantics, and bounty cache invalidation.
3. Add route guards, query pagination/filter correctness, and legacy search migration.
4. Align the data schema and add Firestore converters/runtime validation.
5. Expand emulator/integration tests before changing additional UI behavior.
6. Clean deployment artifacts, secrets, lint configuration, dead code, and bundle size.
