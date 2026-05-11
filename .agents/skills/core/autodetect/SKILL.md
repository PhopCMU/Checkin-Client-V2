# Autodetect Installer Skill

When to use: Run this helper to auto-detect the project's tech stack and recommend relevant agent skills from this repository's skill index.

Steps:

1. Run the script in preview mode: `npx ./scripts/autodetect-skills.js --dry-run`
2. Review the recommended list printed to the terminal.
3. Apply the recommendations: `npx ./scripts/autodetect-skills.js --yes`
4. This writes `.agents/skills/auto-selection.json` with the recommended skills.

Pitfalls:

- The tool only recommends skills that are already registered in `.agents/skills/_index.json`.
- It does not install npm packages or modify source code.

Minimal snippet:

```
npx ./scripts/autodetect-skills.js --dry-run
npx ./scripts/autodetect-skills.js --yes
```

Update notes: This file is created by the autodetect installer and is safe to edit if you want to change its wording.
