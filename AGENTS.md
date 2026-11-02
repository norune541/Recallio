# AGENTS.md

## Project Overview

Recallio is a Bun workspaces monorepo for an AI-powered SaaS dashboard for Shopify merchants. It connects Shopify store data with Anthropic to provide product analysis and store insights.

## Repository Structure

```text
recallio/
├── backend/          # @recallio/backend — NestJS API
├── frontend/         # @recallio/frontend — React + Vite dashboard
├── shared/           # @recallio/shared — Zod schemas + generated OpenAPI types
├── .cursor/rules/    # Cursor rules (source of truth for conventions)
└── .agents/skills/   # Project agent skills
```

Inspect the relevant package before changing it. Do not invent new packages.

## Stack

TypeScript, Bun workspaces, NestJS, React, PostgreSQL, Prisma, Shopify Admin GraphQL, Clerk, Anthropic SDK, Zod, OpenAPI.

## Agent instructions

- Prefer existing patterns over new abstractions; inspect similar modules first.
- Keep business logic in use cases; keep controllers thin; keep Prisma in DAOs.
- Isolate Shopify, Anthropic, and Clerk behind module providers/clients — not controllers or DAOs.
- Do not introduce dependencies without justification.
- Preserve public API contracts unless the change explicitly requires updating them; regenerate OpenAPI types with root `api:generate` after backend route/DTO changes.
- Never hardcode secrets, log access tokens, or weaken auth/OAuth/encryption checks.
- Treat code as the source of truth; update docs when architectural decisions change; report doc/code mismatches.

### Before / after changes

1. Inspect relevant files and existing patterns.
2. Identify affected modules and shared contracts.
3. Implement the smallest change that fits current architecture.
4. Run the relevant tests, typecheck/build, and report anything that could not be verified.

## Cursor rules (read these for detail)

| Rule | Scope |
|------|--------|
| `.cursor/rules/architecture.mdc` | Always — package boundaries, shared package, tooling |
| `.cursor/rules/security.mdc` | Always — secrets, Clerk, Shopify OAuth/tokens, HTTP hardening |
| `.cursor/rules/backend.mdc` | `backend/**/*` — Nest modules, DI, use cases, integrations |
| `.cursor/rules/frontend.mdc` | `frontend/**/*` — features, API client, UI conventions |
| `.cursor/rules/database.mdc` | Prisma schema/migrations and `*.dao.ts` |

Do not duplicate rule content here. When guidance conflicts, prefer the applicable `.cursor/rules/*.mdc` file and the current code.

## Project skills

- `.agents/skills/clerk-backend-api/` — Clerk Backend REST API explorer/executor (requires `CLERK_SECRET_KEY`).
- `.agents/skills/review-endpoint/` — Architecture-first review of one NestJS endpoint and its request flow.
- `.agents/skills/security-review/` — Security review of branch or uncommitted changes (auth, secrets, OAuth/tokens).
