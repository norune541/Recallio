---
name: review-endpoint
description: Architecture-first review of one NestJS endpoint and its request flow — boundaries, authz, correctness, security, and tests. Use when the user invokes /review-endpoint or asks to review a specific API route or controller method.
disable-model-invocation: true
---

# Focused Endpoint Review

Review exactly **one** Recallio endpoint and its real request flow. Read-only: do not modify files or auto-fix findings.

**Convention baseline:** `.cursor/rules/{architecture,backend,security,database}.mdc`. Flag deviations only when this flow violates them.

## Target

Accept an HTTP method + route, or a controller method.

If missing:

1. Infer only from currently selected code, or from a single unambiguous endpoint in the current changes.
2. If shared DTOs/guards/use cases touch multiple routes, or more than one endpoint is plausible → ask which endpoint. Do not guess.
3. Never start a repository-wide, module-wide, or PR-wide review.

## Priority (strict order)

1. Architecture / responsibility boundaries
2. Authn / authz / tenant isolation
3. Correctness / consistency
4. Tests
5. Naming / terminology (only when it misleads architecture)

Cap actionable findings at **5**. Drop style and checklist noise.

## Trace

Follow the actual call path only:

```text
HTTP Route → Controller → Guards / Pipes / DTO Validation
  → Use Case → Collaborators → DB / External API → HTTP Response
```

Inspect only what this path uses:

- Controller route + method
- Request DTOs / Zod (or other) validation
- Guards and authorization on this route
- The invoked use case
- Direct collaborators of that use case (DAO, client, adapter, utils)
- Module DI only if it affects this wiring
- Prisma models / constraints / migrations when this flow reads or writes
- Tests that cover this flow

Verify the real call path. A module import does not mean the component is used.

Typical Recallio shape: thin controller → use case → DAO / integration client. Prisma stays in DAOs; Shopify / Anthropic / Clerk stay behind clients/adapters.

## Architecture

Evaluate for this flow only:

- Responsibility boundaries and cohesion
- Dependency direction and coupling
- Use-case vs controller vs DAO vs client responsibilities
- Whether abstractions earn their complexity
- Fit with project conventions (not generic “best practices”)

Do not recommend a pattern unless you can state the concrete problem it solves here.

### Terminology (only when present or misused)

| Term | Expectation |
|------|-------------|
| NestJS provider | DI registration — not automatically an architectural “Provider” |
| Adapter | Isolates/translates an external system behind an app boundary |
| Client | Owns SDK/HTTP communication with an external API |
| Use case | One application operation; coordinates collaborators |
| DAO | Persistence access for this domain; not interchangeable with “repository” by default |
| Service | Name must match actual responsibility |

Discuss a SOLID principle or ACID property **only** when this flow shows a concrete mismatch or write/transaction invariant. Absence of a transaction is not an ACID violation unless the operation requires one.

For each questionable term/principle: actual responsibility → mismatch → better term/design → why it matters. Do not rename valid Nest/framework usage for purity.

## Correctness and security

Report only risks reachable on this path:

- Input validation and HTTP contract
- Authentication and authorization
- Resource ownership / tenant isolation
- Invalid state transitions
- Error handling and status codes
- Sensitive data exposure (tokens, secrets — never acceptable in responses/logs)
- Races / concurrency where the flow has shared mutable state or check-then-act
- Idempotency where retries are realistic
- Partial failure / external API failure handling
- Transaction boundaries when writes need atomicity

No hypothetical vulns without a realistic execution path.

## Tests

Inspect tests for this endpoint only.

Missing tests ≠ implementation defect. List only high-value gaps (success, invalid input, unauthorized/cross-tenant, missing resource, critical failure/concurrency).

Run relevant tests when practical and cheap; state clearly if not run.

## Severity and verdict

| Severity | Meaning |
|----------|---------|
| CRITICAL | Exploitable authz/authn bypass, secret/token leak, or data corruption likely in production |
| HIGH | Clear correctness bug, broken ownership check, or severe contract/error-handling failure |
| MEDIUM | Real design/boundary issue that will cause maintainability or latent bugs |
| LOW | Minor, evidence-backed improvement; skip pure style |

| Verdict | When |
|---------|------|
| BLOCK | Any CRITICAL |
| NEEDS ATTENTION | No CRITICAL, but one or more HIGH |
| APPROVED WITH NOTES | Only MEDIUM/LOW (or notes) |
| APPROVED | No actionable findings in scope |

Approval is scoped to this endpoint review, not a defect-free guarantee.

Distinguish **confirmed problems** from **design trade-offs**. Support every finding with implementation evidence. Do not invent business requirements.

## Output

### Flow

One-line execution path.

### Findings

Up to 5, severity-ordered:

`[CRITICAL|HIGH|MEDIUM|LOW] file:line — problem → consequence → recommendation`

### Architecture & Terminology

Only applicable items:

`Term — Correct | Ambiguous | Incorrect: brief explanation.`

Mark SOLID/ACID as not applicable when unused.

### Missing Tests

Most important missing scenarios only (or “None noted”).

### Verdict

One of: `BLOCK` | `NEEDS ATTENTION` | `APPROVED WITH NOTES` | `APPROVED`
