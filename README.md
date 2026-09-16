# CTE — Code That Earns

CTE (Code That Earns) is a role-based platform where organizations publish technical challenges, developers submit solutions, and organizations select winners for recognition or optional off-platform rewards.

The project currently provides the core challenge, authentication, submission, review, and winner-selection workflows. CTE records published outcomes, while organizations and winners coordinate any reward delivery off-platform.

## Features

### Developers

- Create an account as a developer and sign in with email and password.
- Browse open challenges with pagination.
- View a challenge and submit a supported repository or design project URL.
- Optionally include a live demo and submission notes.
- Review personal submission history.

### Organizations

- Create an account as an organization and sign in with email and password.
- Create provider-neutral recognition, monetary, or non-monetary challenges.
- View challenges created by the organization.
- Review submissions associated with organization challenges.

### Shared

- Firebase Authentication and Firestore-backed application state.
- Role-aware navigation and access-denied, loading, empty, and error states.
- Responsive interface built with Tailwind CSS and Radix-based UI primitives.
- Provider-neutral outcomes with configurable winner counts.

## Current limitations

- CTE does not execute or verify reward delivery. Organizations and winners coordinate it outside the platform.
- Solutions are submitted as supported external links. The app does not upload or independently verify project contents.
- Firebase Analytics is initialized, so a configured Firebase project is required for the app to start successfully.

## Tech stack

- React 19 and TypeScript
- Vite 6
- React Router 7
- TanStack React Query
- Firebase 11: Authentication, Firestore, and Analytics
- Tailwind CSS 4 with the Tailwind Vite plugin
- Radix UI primitives and Lucide/React Icons
- Jest 29, Testing Library, and ts-jest
- Firebase Hosting

## Requirements

- Node.js 22 or newer
- npm
- A Firebase project with Authentication and Firestore enabled

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a .env file in the repository root. Vite exposes only variables prefixed with VITE_ to the client:

   ```dotenv
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

   These values are read in `src/config/firebase.ts`. Copy `.env.example` when creating a local environment file, and never commit secrets.

3. In Firebase Console, enable:

   - Email/password Authentication
   - Cloud Firestore
   - Analytics if you want analytics events enabled

4. Start the development server:

   ```bash
   npm run dev
   ```

   Vite will print the local URL, normally http://localhost:5173.

## Available scripts

| Command                          | Description                                       |
| -------------------------------- | ------------------------------------------------- |
| npm run dev                      | Start the Vite development server                 |
| npm run build                    | Type-check and create a production build in dist/ |
| npm run preview                  | Preview the production build locally              |
| npm run lint                     | Run ESLint                                        |
| npm test                         | Run the Jest test suite                           |
| npm run test:watch               | Run Jest in watch mode                            |
| npm run test:coverage            | Generate Jest coverage output                     |
| npm run test:rules               | Test Firestore rules against the local emulator   |
| npm run test:backend             | Test backend transactions against the emulator    |
| npm run migrate:challenges       | Preview the legacy challenge data migration       |
| npm run migrate:challenges:apply | Apply the legacy challenge data migration         |
| npm run format                   | Format source files with Prettier                 |
| npm run format:check             | Check formatting without changing files           |

### Trusted backend

Winner finalization runs in Firebase Functions and never transfers rewards.

```bash
npm install --prefix functions
npm --prefix functions run build
firebase emulators:start --only functions,firestore
```

Deploy it with `firebase deploy --only functions`. Deploy Firestore rules and
indexes before deploying the provider-neutral client.

## Application routes

| Route                    | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| /                        | Home page                                              |
| /login                   | Sign in                                                |
| /sign-up                 | Create a developer or organization account             |
| /challenges              | Role-aware marketplace or organization management page |
| /challenges/:challengeId | View challenge details and submit a solution           |
| /submissions             | View developer submissions                             |
| /company-submissions     | View submissions for organization challenges           |

## Firestore

The application uses these collections:

- users: Firebase user profile, role, email, developer name or organization name, and timestamps.
- challenges: challenge details, provider-neutral outcome, winner count, lifecycle status, organization ownership, and timestamps.
- submissions: challenge ID, submission/demo links, notes, developer ownership, lifecycle status, and timestamps.

The deployed rules are in firestore.rules. Authenticated users can read
challenges, while private user profiles remain owner-readable. Challenge
publication and winner finalization run through Firebase Functions; organizations
can only move their own open challenges into review or cancel them. Developers
can create one submission per challenge, and submission access is limited to
the submitting developer or the organization that owns the related challenge.

Keep role values consistent with the application’s uppercase values: DEVELOPER and ORGANIZATION.

### Legacy challenge migration

Follow [`migration-runbook.md`](migration-runbook.md) for backup, dry-run,
verification, and rollback requirements.

The application now stores challenges in the `challenges` collection. Existing
documents in the legacy collection and their submission references must be
migrated before deploying the renamed application. Authenticate with
Application Default Credentials, preview the migration, and only then apply it:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
npm run migrate:challenges -- --project=code-bounty-6e6b3
npm run migrate:challenges:apply -- --project=code-bounty-6e6b3
```

The migration is idempotent, paginates through each collection, copies legacy
challenge documents with their existing IDs, adds renamed reference fields, and
stamps challenges with the current search schema version. It does not delete
legacy collections or fields, which remain available for rollback during the
transition.

After applying and verifying the migration, deploy the renamed rules and indexes
before deploying the application:

```bash
firebase deploy --only firestore:rules,firestore:indexes --project=code-bounty-6e6b3
```

If the CLI asks whether to delete legacy indexes, answer `N` while the recovery
collection is retained. Wait for all new challenge indexes to become enabled.

## Project structure

```text
src/
├── components/          Shared and reusable UI components
├── config/              Firebase initialization
├── context/             Application context
├── features/            Feature-specific pages, components, hooks, types, and utilities
│   ├── auth/             Login and sign-up
│   ├── challenges/         Challenge browsing and creation
│   ├── home/             Home page
│   ├── submissions/      Submission and review workflows
├── hooks/                Shared hooks
├── layout/               App shell and header navigation
├── lib/                  General utilities
├── services/             Firebase and external-service access
└── test/                 Jest setup and browser polyfills
```

## Firebase deployment

The repository is configured to deploy the Vite dist/ directory to Firebase Hosting and to rewrite routes to index.html for client-side routing.

```bash
npm run build
firebase login
firebase deploy
```

The Firebase project selected by the Firebase CLI must match the project ID in your environment configuration. Firestore rules are deployed from firestore.rules.

## Testing

Tests live next to the implementation under src/ and use Jest with a jsdom environment. Run the full suite with:

```bash
npm test
```

The release checks also include Firestore emulator rules and trusted-backend
transaction tests:

```bash
npm run test:rules
npm run test:backend
```

## Contributing

1. Create a feature branch.
2. Make the change and add or update tests where appropriate.
3. Run npm run lint, npm run build, and npm test.
4. Open a pull request with a concise description of the change.

## License

This project is licensed under the MIT License.
