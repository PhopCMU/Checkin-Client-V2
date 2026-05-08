# Agents

## AutoSkills

This repository supports installing additional local skills using AutoSkills.

Usage (as referenced in the project README):

```bash
npx autoskills
```

Installed skills should be placed under `./.agents/skills/` — one skill per directory. Example:

- `./.agents/skills/my-new-skill/`

After installing or adding skills, ensure `./.agents/skills/_index.json` contains an entry for each skill with the following fields:

- `id`: skill identifier (typically the skill folder name)
- `path`: relative path to the skill folder (for example `./vite/`)
- `tags`: an array of tags (optional)

Keep the `_index.json` up to date after adding or removing skills so agents can discover them reliably.

Structure:

- Core skills: `./.agents/skills/core/` — project-specific workflows and conventions.
- Library skills: `./.agents/skills/libs/` — one skill per third-party library used by the project.
