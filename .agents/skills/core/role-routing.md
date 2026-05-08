# Role: Routing

When to use
- Adding routes, redirects, and auth gating.

Steps
- Place route-level pages in `src/pages/**`.
- Use `src/components/PrivateRoute.tsx` style guards and `Navigate` with `state.from` to preserve redirect target.

Minimal snippet

```tsx
// preserve 'from' when redirecting unauthenticated users
<Navigate to="/sign-in" replace state={{ from: location }} />
```

Pitfalls
- Avoid deep routing logic inside components—keep routing in app shell (`src/app` or `src/main.tsx`).

Update notes
-
