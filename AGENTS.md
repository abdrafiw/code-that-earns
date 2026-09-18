# Repository Guidelines

## Project Structure & Module Organization

The React 19/Vite client lives in `src/`. Put feature code in `src/features/<feature>/` using `components/`, `pages/`, `hooks/`, `utils/`, and `__tests__/` as needed. Shared primitives belong in `src/components/ui`; reusable application states belong in `src/components/common`. Firebase access is isolated under `src/services`, while shared hooks, layouts, and utilities live in their matching top-level directories.

Trusted Firebase code is in `functions/src`. Firestore rules and indexes are in `firestore.rules` and `firestore.indexes.json`. Migration utilities live in `scripts/`, static assets in `public/`, and agent guidance in `.agents/skills/`.

## Build, Test, and Development Commands

- `npm run dev`: start the Vite development server.
- `npm run build`: type-check and build the production client.
- `npm run lint`: run ESLint with zero warnings allowed.
- `npm run format:check`: verify Prettier formatting without modifying files.
- `npm test`: run Jest unit and component tests.
- `npm run test:rules`: run Firestore rule tests against the emulator.
- `npm run test:backend`: run trusted-backend transaction tests.
- `npm --prefix functions run build`: compile Firebase Functions.

Run checks in proportion to the change; Firebase boundary changes require the relevant emulator suite.

## Coding Style & Naming Conventions

Use TypeScript, two-space indentation, semicolons, single quotes, and trailing commas. Prettier sorts Tailwind classes. ESLint requires type-only imports, strict equality, no explicit `any`, and no unused variables except intentionally prefixed `_` parameters.

Use `PascalCase` for React components and types, `camelCase` for functions and values, and `useX` for hooks. Prefer existing shared components, typed form helpers, query keys, and domain schemas over duplicated logic.

## Testing Guidelines

Tests use Jest, ts-jest, Testing Library, and `userEvent`. Name files `*.test.ts` or `*.test.tsx`. Feature tests belong in `src/features/<feature>/__tests__`; service and backend tests remain beside their modules. Test observable behavior through accessible roles and labels. Cover relevant success, validation, pending, error, authorization, and concurrency paths. No fixed coverage percentage is enforced.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commit prefixes such as `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, and `chore:`. Keep commits focused and messages imperative. Pull requests should explain the user-visible change, identify security or migration impact, link the issue when available, list verification commands, and include screenshots for UI changes.

## Security & Agent Instructions

Never commit `.env` files, credentials, or private reward details. Treat browser input as untrusted and keep privileged writes in Firebase Functions. Before relevant work, follow the project skills in `.agents/skills/`: `branch-workflow`, `frontend-standards`, `firebase-security`, and `challenge-workflow`.
