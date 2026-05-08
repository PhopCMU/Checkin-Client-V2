---
name: tailwindcss
description: How Tailwind is used in this repo (styles + import points).
---

When to use

- Styling UI components and global styles.

Steps

- Global CSS imports live in `src/index.css` (this repo imports Tailwind there).
- If you need custom tokens or theme overrides, add `tailwind.config.js` at project root.

Pitfalls

- Missing `tailwind.config.js` can be acceptable if defaults suffice, but add it for custom themes.

Minimal snippet

```css
/* src/index.css */
@import "tailwindcss";
/* or: @tailwind base; @tailwind components; @tailwind utilities; */
```

## Update notes
