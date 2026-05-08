# Skill Authoring Rules

When to use
- Create or update when adding local knowledge or automation to `.agents/skills/`.

Format (required)
- `When to use`: brief trigger for this skill.
- `Steps`: actionable steps an agent should follow.
- `Pitfalls`: common mistakes to avoid.
- `Minimal snippet`: a tiny, copy-paste-ready example using repo paths.
- `Update notes`: append lessons/bugfixes when you modify code.

Minimal skeleton

1. When to use: ...
2. Steps: ...
3. Pitfalls: ...
4. Minimal snippet:

```ts
// src/services/exampleService.ts
import { api } from '../api/axios';
export const fetchSomething = () => api.get('/something');
```

Update notes
-
