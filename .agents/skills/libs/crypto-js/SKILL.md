---
name: crypto-js
description: Notes for using `crypto-js` in client-side code; consider threat model for secrets.
---

When to use

- Small client-side hashing/crypto operations where acceptable.

Pitfalls

- Do not store secrets in client code; prefer server-side for sensitive cryptography.

## Update notes
