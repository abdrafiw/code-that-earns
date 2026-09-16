---
name: frontend-standards
description: Apply this project's clean-code and UX standards when building or reviewing frontend components, pages, hooks, forms, state management, responsive layouts, accessibility, and behavior tests; skip backend-only work.
---

# Frontend Standards

Inspect the surrounding implementation before editing. Reuse its established components, hooks, form reducer, query keys, utilities, naming, and test organization unless the task requires a deliberate change.

## Architecture and state

- Derive display values during render. Do not copy props, query results, or context values into state.
- Use effects only to synchronize with an external system, subscription, timer, or imperative browser API. Event-driven work belongs in event handlers.
- Keep server state in TanStack Query and form state in the shared typed form reducer. Do not mirror either in component state.
- Keep page components focused on orchestration and semantic page layout. Extract substantial forms, cards, tables, and workflow controls into feature components.
- Prefer composition and colocated hooks. Use context only for genuinely shared cross-tree state; do not introduce context merely to avoid passing a prop through one component boundary.
- Keep context providers narrowly scoped and memoize provider values containing functions or derived objects.
- Prefer existing shared UI components, helpers, constants, and domain types over duplicating markup or logic.
- Keep business rules out of presentation components and use clear names, focused functions, and early returns where they improve readability.

## Forms and async behavior

- Keep form values and errors in the shared typed form reducer. Derive readiness and other display state instead of storing it separately.
- Disable the primary action until all conditionally required fields are populated. Validate again on submission; readiness is not validation.
- Disable actions while their mutation is pending, prevent duplicate submissions, and provide clear pending and failure feedback.
- Validate input at the UI boundary and again at the trusted data boundary. Normalize values such as trimmed text before crossing that boundary.
- Use consistent control heights within a form. Group vertical form content with `space-y-*`; do not use `mt-*` or `mb-*` to space form elements.
- Reuse centralized TanStack Query keys and invalidate the narrowest relevant key after successful mutations.
- Provide explicit loading, empty, error, and success states when those states are possible.

## Layout and responsive behavior

- Build mobile-first layouts and verify them at narrow and wide widths. Avoid desktop tables, fixed widths, or control groups that overflow small screens.
- Preserve meaningful content. Allow names and labels to wrap or expose their full value accessibly instead of silently truncating essential information.
- Maintain a consistent spacing rhythm and align related controls. Use shared design tokens and existing variants instead of introducing near-duplicate styles.

## Accessibility

- Use semantic HTML and associated labels. Prefer native interactive elements and preserve keyboard operation and visible focus styles.
- Give icon-only controls accessible names and mark decorative icons as hidden from assistive technology.
- Connect field errors and help text with `aria-describedby`, expose invalid state, and make submitted error summaries or asynchronous feedback perceivable.
- Manage focus when dialogs, sheets, and other overlays open or close. Ensure destructive or external navigation is clearly communicated and external links are safe.
- Do not rely on color alone to communicate state. Maintain readable contrast and usable target sizes.

## Tests

- Place feature tests in `src/features/<feature>/__tests__`; keep service and shared-component tests with their respective modules.
- Test user-visible behavior with Testing Library and `userEvent`. Prefer role, label, and visible-name queries over implementation selectors.
- Cover the changed happy path and relevant validation, disabled, pending, error, empty, responsive-alternative, and accessibility behavior. Do not test component implementation details.

## Scope and validation

- Keep the requested scope; do not refactor unrelated code merely because it predates the standards.
- Resolve clear standards violations in code directly touched by the change.
- Run the relevant tests and, in proportion to the change, `npm run format:check`, `npm run lint`, and `npm run build`.

When reviewing, report violations with concrete file and line evidence, ordered by impact. Distinguish required fixes from optional improvements.
