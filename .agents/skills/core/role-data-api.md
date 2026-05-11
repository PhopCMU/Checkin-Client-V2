# Role: Data / API

When to use
- Building API clients, access tokens handling, retry strategies.

Steps
- Use the shared client at `src/api/axios.ts` for interceptors and common config.
- Implement feature services under `src/services/<feature>Service.ts` that import `src/api/axios`.

Pitfalls
- Avoid creating axios instances from UI components.
- Keep token storage strategy explicit (in-memory vs storage/cookies).

Minimal snippet

```ts
// src/services/userService.ts
import { api } from '../api/axios';
export async function getCurrentUser() { return (await api.get('/me')).data; }
```

Update notes
-
