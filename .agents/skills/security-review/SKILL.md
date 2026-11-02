---
name: security-review
description: Security review of Recallio code changes — authn/authz, secrets, Shopify OAuth/tokens, webhooks, tenant isolation, and sensitive data exposure. Use when the user invokes /security-review or /review-security, or explicitly asks for a security review of branch or uncommitted changes.
disable-model-invocation: true
---

# Security Review

Read-only security review of **code changes**. Do not modify files or auto-fix findings.

**Convention baseline:** `.cursor/rules/security.mdc` (primary), plus `architecture.mdc` / `backend.mdc` / `database.mdc` when they affect trust boundaries. Flag only violations reachable from the reviewed diff.

## Target

Default diff: **branch changes** (merge-base with default base branch → HEAD, including staged/unstaged).

Use **uncommitted changes** only when the user asks for local/working-tree/dirty/not-yet-committed review.

If the user names a PR or branch, check it out first (ask before stash if checkout would overwrite local work). Then review that tree.

If the diff is empty, say so in one sentence and stop.

Do not expand into a full-repo audit. Follow only code touched by the diff and the callees it newly depends on for a realistic exploit path.

## Priority (strict order)

1. Authn / authz / tenant isolation / ownership
2. Secrets, tokens, encryption, logging of sensitive data
3. OAuth / webhook / HMAC / state integrity
4. Input validation at trust boundaries
5. Injection, SSRF, unsafe deserialization, prototype pollution (only with a reachable path)
6. Missing security tests for the above

Cap actionable findings at **5**. No speculative “consider hardening” without a concrete path.

## Recallio focus areas

Inspect the diff for these project-specific risks:

| Area | Fail if |
|------|---------|
| Secrets / env | Hardcoded credentials; secrets outside `backend/src/config/env.ts`; non-`VITE_*` secrets in frontend |
| Clerk auth | Protected route missing `ClerkAuthGuard`; trusting client-supplied identity over `req.user` |
| Ownership | Resource actions without use-case ownership/role checks (e.g. shop delete not limited to `OWNER`) |
| Shopify OAuth | Weak/missing HMAC, timestamp, or one-time state checks on callback; storing raw OAuth state |
| Shopify tokens | Plaintext token storage; tokens sent to frontend; plaintext tokens in logs; decrypt/refresh off-server |
| Webhooks | Clerk webhook without `verifyWebhook` + raw body |
| HTTP hardening | Weakening Helmet, CORS credentials/origin, throttling, or trust proxy without justification |
| Data exposure | Access tokens, refresh tokens, encryption keys, or `ANTHROPIC_API_KEY` / DB URLs in responses or client bundles |

Before flagging auth/OAuth/encryption/webhook issues, read the current implementation of the touched path — do not invent requirements.

## Evidence rules

- Every finding needs a realistic execution path from the diff.
- Distinguish **confirmed** issues from **defense-in-depth trade-offs**.
- Do not invent threat models or business rules absent from code/rules.
- Missing tests ≠ vulnerability; list them under Missing Tests only when they cover CRITICAL/HIGH scenarios above.

## Severity and verdict

| Severity | Meaning |
|----------|---------|
| CRITICAL | Authn/authz bypass, secret/token leak, or plaintext Shopify token handling exploitable in production |
| HIGH | Broken ownership/tenant check, failed OAuth/webhook integrity validation, or sensitive data likely exposed |
| MEDIUM | Real weakness that needs a non-trivial chain or misconfiguration to exploit |
| LOW | Minor hardening gap with evidence; skip pure style |

| Verdict | When |
|---------|------|
| BLOCK | Any CRITICAL |
| NEEDS ATTENTION | No CRITICAL, but one or more HIGH |
| APPROVED WITH NOTES | Only MEDIUM/LOW (or notes) |
| APPROVED | No actionable findings in scope |

## Output

### Scope

One line: diff type + base (if known) + packages/areas touched.

### Findings

Up to 5, severity-ordered:

`[CRITICAL|HIGH|MEDIUM|LOW] file:line — problem → consequence → recommendation`

### Missing Tests

High-value security gaps only (authz bypass, OAuth failure modes, token handling) — or “None noted”.

### Verdict

One of: `BLOCK` | `NEEDS ATTENTION` | `APPROVED WITH NOTES` | `APPROVED`
