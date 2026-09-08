# CTE — Code That Earns

CTE (Code That Earns) is a role-based web application for connecting companies with developers through paid coding challenges. Companies publish bounties, developers browse and submit solutions through GitHub repository links, and companies can review submissions.

The project currently provides the core bounty, authentication, and submission workflows. Bitcoin payment integration and transaction history are represented in the UI, but the transaction page currently uses sample data and payment execution is not yet connected to a production backend.

## Features

### Developers

- Create an account as a developer and sign in with email and password.
- Browse open bounties with pagination.
- View a bounty and submit a GitHub repository URL.
- Provide a Bitcoin address/hash with a submission.
- Review personal submission history.

### Companies

- Create an account as a company and sign in with email and password.
- Create bounties with a title, description, category, difficulty, BTC amount, and deadline.
- View bounties created by the company.
- Review submissions associated with company bounties.

### Shared

- Firebase Authentication and Firestore-backed application state.
- Role-aware navigation and access-denied, loading, empty, and error states.
- Responsive interface built with Tailwind CSS and Radix-based UI primitives.
- Public transaction-history UI with Bitcoin explorer links using Blockstream.

## Current limitations

- The transactions page currently displays hard-coded sample transactions; it does not read from the Firestore transactions collection.
- The Bitcoin service contains a client-side Bitnob API call using a legacy REACT_APP_BITNOB_KEY reference. Do not expose a real private payment key in the browser. Production payments should be moved behind a trusted server or Firebase Cloud Function.
- GitHub repositories are submitted as URLs. The app does not upload repository contents or verify repositories automatically.
- Firebase Analytics is initialized, so a configured Firebase project is required for the app to start successfully.

## Tech stack

- React 19 and TypeScript
- Vite 6
- React Router 7
- TanStack React Query
- Firebase 11: Authentication, Firestore, and Analytics
- Tailwind CSS 4 with the Tailwind Vite plugin
- Radix UI primitives and Lucide/React Icons
- Jest 30, Testing Library, and ts-jest
- Firebase Hosting

## Requirements

- Node.js 16 or newer
- npm
- A Firebase project with Authentication and Firestore enabled

## Getting started

1. Install dependencies:

   ~~~bash
   npm install
   ~~~

2. Create a .env file in the repository root. Vite exposes only variables prefixed with VITE_ to the client:

   ~~~dotenv
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ~~~

   These values are read in src/config/firebase.ts. The repository currently includes a local .env file but does not include a .env.example; create one for new environments without committing secrets.

3. In Firebase Console, enable:

   - Email/password Authentication
   - Cloud Firestore
   - Analytics if you want analytics events enabled

4. Start the development server:

   ~~~bash
   npm run dev
   ~~~

   Vite will print the local URL, normally http://localhost:5173.

## Available scripts

| Command | Description |
| --- | --- |
| npm run dev | Start the Vite development server |
| npm run build | Type-check and create a production build in dist/ |
| npm run preview | Preview the production build locally |
| npm run lint | Run ESLint |
| npm test | Run the Jest test suite |
| npm run test:watch | Run Jest in watch mode |
| npm run test:coverage | Generate Jest coverage output |
| npm run format | Format source files with Prettier |
| npm run format:check | Check formatting without changing files |

## Application routes

| Route | Purpose |
| --- | --- |
| / | Home page |
| /login | Sign in |
| /sign-up | Create a developer or company account |
| /dev-bounties | Browse bounties as a developer |
| /company-bounties | View company bounties and open the create-bounty dialog |
| /submit/:bountyId | Submit a solution for a bounty |
| /submissions | View developer submissions |
| /company-submissions | View submissions for company bounties |
| /transactions | View the current transaction-history UI |

## Firestore

The application uses these collections:

- users: Firebase user profile, role, email, developer name or company name, and timestamps.
- bounties: title, description, category, difficulty, BTC amount, deadline, company name/UID, and timestamps.
- submissions: bounty ID, GitHub URL, Bitcoin address/hash, developer UID, and creation timestamp.
- transactions: reserved for transaction records; the current transactions page uses local sample data instead.

The deployed rules are in firestore.rules. Authenticated users can read user profiles and bounties. Companies can create, update, and delete their own bounties; developers can create submissions; and submission access is limited to the submitting developer or the company that owns the related bounty.

Keep role values consistent with the application’s uppercase values: DEVELOPER and COMPANY.

## Project structure

~~~text
src/
├── components/          Shared and reusable UI components
├── config/              Firebase initialization
├── context/             Application context
├── features/            Feature-specific pages, components, hooks, types, and utilities
│   ├── auth/             Login and sign-up
│   ├── bounties/         Bounty browsing and creation
│   ├── home/             Home page
│   ├── submissions/      Submission and review workflows
│   └── transactions/     Transaction-history UI and utilities
├── hooks/                Shared hooks
├── layout/               App shell and header navigation
├── lib/                  General utilities
├── services/             Firebase and external-service access
└── test/                 Jest setup and browser polyfills
~~~

## Firebase deployment

The repository is configured to deploy the Vite dist/ directory to Firebase Hosting and to rewrite routes to index.html for client-side routing.

~~~bash
npm run build
firebase login
firebase deploy
~~~

The Firebase project selected by the Firebase CLI must match the project ID in your environment configuration. Firestore rules are deployed from firestore.rules.

## Testing

Tests live next to the implementation under src/ and use Jest with a jsdom environment. Run the full suite with:

~~~bash
npm test
~~~

## Contributing

1. Create a feature branch.
2. Make the change and add or update tests where appropriate.
3. Run npm run lint, npm run build, and npm test.
4. Open a pull request with a concise description of the change.

## License

This project is licensed under the MIT License.
