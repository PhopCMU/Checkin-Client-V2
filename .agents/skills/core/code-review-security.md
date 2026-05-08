# Code Review: Security

## When to use
- Any PR touching auth, storage, API calls, rendering remote content, exports, deps

## Manual review policy
- Only perform security reviews when explicitly requested by the user via the chat prompt (for example: "Run security review"). Do not auto-run security scans for every change to conserve API tokens.
- After performing the review, confirm that the review covered the requested areas and note any follow-ups or uncovered gaps.

## Checklist
- [ ] No secrets committed (keys, tokens, credentials)
- [ ] No tokens/headers in logs
- [ ] No token in URL query params
- [ ] XSS safe: no `dangerouslySetInnerHTML` unless sanitized and justified
- [ ] Cookie auth: CSRF considerations documented (backend contract)
- [ ] Storage auth: sessionStorage preferred; localStorage only with clear policy
- [ ] Dependencies: new deps justified; lockfile reviewed; remote tarballs documented (xlsx tgz)

## Review references
- `.agents/skills/core/security-baseline.md`
- `.agents/skills/core/security-frontend-xss.md`
- `.agents/skills/core/security-axios-auth.md`
- `.agents/skills/core/security-crypto-js-usage.md`
- `.agents/skills/core/security-dependencies.md`
