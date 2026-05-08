---
name: @tailwindcss/vite
description: Vite plugin integration for Tailwind used in `vite.config.ts`.
---

When to use

- Ensure Tailwind is processed correctly by the Vite dev server and build.

Steps

1. Ensure `tailwindcss` plugin is imported in `vite.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({ plugins: [tailwindcss() /* ... */] });
```

Pitfalls

- Plugin must be present in `vite.config.ts` for proper processing of Tailwind directives.

Minimal snippet

See `vite.config.ts` in repo (plugin already configured).

## Update notes
