# Skill Update Protocol

Purpose
- Ensure learnings and bugfixes are recorded in skill files so future agents benefit.

When to append
- After fixing a bug that required a code or architecture change.
- After discovering a non-obvious pitfall or behavior change in a dependency.

How to append
1. Edit the affected skill's `Update notes` section (append, don't replace).
2. Add date and short rationale (one sentence).
3. Update `.agents/skills/_index.json` if you add/remove skills.

Example
- `2026-05-08 — Fix: switched service to use src/api/axios to centralize interceptors.`
