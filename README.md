# Checkin-Client-V2

## Autodetect agent skills

This repository includes a small helper script that detects the project's tech stack and recommends matching agent skills from `.agents/skills/_index.json`.

Preview recommendations (no changes):

```bash
# recommended (CommonJS) when `package.json` uses `type: "module"`
npx ./scripts/autodetect-skills.cjs --dry-run

# or run directly with Node
node scripts/autodetect-skills.cjs --dry-run
```

Apply recommendations (writes `.agents/skills/auto-selection.json` and creates a helper skill):

```bash
npx ./scripts/autodetect-skills.cjs --yes

# or
node scripts/autodetect-skills.cjs --yes
```

Notes:

- The script only recommends skills already registered in `.agents/skills/_index.json`.
- To make `npx your-package` available globally, add a `bin` entry in `package.json` and publish the package.
