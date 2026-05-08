# Project Conventions

Architecture (canonical `src/**` layout):

1. `src/app/**` — app shell, providers, router, layouts
2. `src/pages/**` — route-level pages only
3. `src/features/**` — feature modules (UI, hooks, services, types local to feature)
4. `src/components/**` — shared components; UI primitives in `src/components/ui/**`
5. `src/services/**` — domain services and API clients (network calls live here)
6. `src/api/**` — API contracts and shared axios client(s)
7. `src/lib/**` — cross-cutting helpers/adapters/integrations
8. `src/utils/**` — pure utility functions only (no side effects)
9. `src/hooks/**` — shared hooks
10. `src/contexts/**` — shared React contexts

Rules (short):

- Do not call `axios` directly from UI components/pages — use `src/services/**` and the shared client in `src/api/axios.ts`.
- Keep page components thin; move business logic to `src/features/**` or `src/services/**`.
- Prefer small, testable functions in services; export a minimal surface.
- Avoid creating new top-level folders unless the concern is cross-cutting.

Update notes
-
