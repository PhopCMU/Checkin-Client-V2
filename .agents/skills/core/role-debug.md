# Role: Debug

When to use
- Investigating runtime errors, network failures, or build issues.

Steps
1. Reproduce locally in dev (`npm run dev`).
2. Check browser console and network tab.
3. Check `src/api/axios.ts` interceptors and service clients for global side-effects.
4. Look for localStorage flags (e.g., `SSL_UPDATING`) and feature toggles.
5. Add minimal regression test or reproduce steps in Update notes.

Pitfalls
- Don't assume intermittent network errors are app bugs; add retries where appropriate.

Update notes
-
