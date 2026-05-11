---
name: axios
description: Project adapter for HTTP requests using `axios`.
---

When to use

- All network requests from the client. Prefer `src/api/axios.ts` shared client.

Steps

1. Import the shared client: `import { api } from '../api/axios'` from `src/services/**`.
2. Implement feature services under `src/services/<feature>Service.ts`.
3. Keep UI components free of network calls; call service functions instead.

Pitfalls

- Do not create axios instances in UI components. Centralize interceptors in `src/api/axios.ts`.

Minimal snippet

```ts
// src/services/userService.ts
import { api } from "../api/axios";

export async function fetchProfile() {
  const res = await api.get("/api/me");
  return res.data;
}
```

## Update notes
