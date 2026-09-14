# Frontend implementation standards

Apply these rules to every new or changed frontend feature.

- Derive display values during render. Do not copy props, query results, or
  context values into state.
- Use effects only to synchronize with an external system, subscription, timer,
  or imperative browser API. Event-driven work belongs in event handlers.
- Keep server state in TanStack Query and form state in the shared typed form
  reducer. Do not mirror either in component state.
- Keep page components focused on orchestration and semantic page layout.
  Extract substantial forms, cards, tables, and workflow controls into feature
  components.
- Prefer composition and colocated hooks. Use context only for genuinely shared
  cross-tree state; do not introduce context merely to avoid passing a prop
  through one component boundary.
- Keep context providers narrowly scoped and memoize provider values containing
  functions or derived objects.
- Keep mutations in services/hooks, invalidate domain query keys deliberately,
  and render pending, error, empty, unauthorized, and success states.
- Validate user input at the UI boundary and again at the trusted data boundary.
- Use semantic HTML, associated labels, keyboard-accessible controls, and safe
  external links.
- Add or update tests for behavior, not component implementation details.
