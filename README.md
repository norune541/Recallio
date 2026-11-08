# Recallio

**AI-powered product intelligence for Shopify merchants.**

Recallio connects to a Shopify store, syncs its product catalog, and uses Claude to generate structured product reviews, SEO suggestions, and actionable insights. Analysis results are persisted so the application can reuse them instead of repeating the same inference every time a product is viewed.

> Recallio is under active development. Features, APIs, and setup instructions may change.

## What it does

- **Connect a Shopify store** through Shopify OAuth.
- **Sync product catalog data** from the Shopify Admin GraphQL API, including product details, pricing, media, SEO fields, and variants.
- **Analyze products with Claude** and return structured AI output validated against a Zod schema.
- **Persist analysis results** in PostgreSQL alongside synchronized product data.
- **Reuse existing analysis** for unchanged products rather than paying to regenerate the same result on every request.
- **Explore store data** through a React dashboard.

## How synchronization works

Recallio periodically checks connected Shopify stores and retrieves product data through cursor-based GraphQL pagination.

For each product, the sync process compares Shopify's `updatedAt` timestamp with the stored product timestamp:

1. Fetch a page of products from Shopify.
2. Find the corresponding products already stored in PostgreSQL.
3. Skip products whose Shopify `updatedAt` has not changed.
4. Retrieve and analyze changed products with Claude.
5. Persist the product data and structured AI review.

The current scheduled synchronization is configured to run daily at midnight UTC. The exact schedule and processing behavior may evolve as the synchronization pipeline develops.

Persisting AI reviews avoids redundant inference for unchanged products. This makes repeated reads cheaper and faster; a new analysis is needed when the product data changes or when an explicit re-analysis is introduced.

## Tech stack

### Backend

| Technology | Role |
| --- | --- |
| [NestJS](https://nestjs.com/) | Backend application framework |
| TypeScript | Application language |
| [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) | Claude API integration |
| [Shopify Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql) | Product catalog and store integration |
| [Prisma](https://www.prisma.io/) | Database access and schema management |
| [PostgreSQL](https://www.postgresql.org/) | Persistent application data |
| [Zod](https://zod.dev/) | Runtime validation and structured AI output |
| [Swagger / OpenAPI](https://swagger.io/specification/) | API documentation and generated client types |
| [Vitest](https://vitest.dev/) | Testing |

### Frontend

| Technology | Role |
| --- | --- |
| [React](https://react.dev/) | User interface |
| [Vite](https://vite.dev/) | Development server and production build |
| TypeScript | Application language |
| [TanStack Query](https://tanstack.com/query) | Server-state management |
| [React Router](https://reactrouter.com/) | Client-side routing |
| [Clerk](https://clerk.com/) | Authentication |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Base UI](https://base-ui.com/) | Accessible UI primitives |
| [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) | Type-safe API requests |

### Monorepo

Recallio is organized as a Bun workspace monorepo:

- `backend/` — NestJS API, Shopify integration, Claude integration, and persistence.
- `frontend/` — React dashboard.
- `shared/` — Shared Zod schemas and generated OpenAPI TypeScript definitions.

## Architecture overview

```text
recallio/
├── backend/
│   └── src/
│       ├── common/       # Shared backend types and utilities
│       ├── config/       # Environment configuration
│       ├── modules/
│       │   ├── claude/   # Claude client, prompts, and AI review schemas
│       │   └── shopify/  # OAuth, Admin API, sync, use cases, and DAO
│       └── prisma/       # Prisma schema, migrations, and client setup
├── frontend/
│   └── src/              # React application
├── shared/
│   └── src/
│       ├── schemas/      # Shared Zod schemas
│       └── types/        # Generated OpenAPI types
├── package.json
└── bun.lock
```

The backend keeps Shopify integration, AI analysis, application use cases, and database access in separate modules. The frontend consumes the backend API through generated OpenAPI types.

## Getting started

### Requirements

- [Bun](https://bun.sh/) 1.4 or later
- PostgreSQL
- A Shopify app configured for the required Admin API scopes
- An Anthropic API key
- Clerk application credentials

### 1. Clone and install

```bash
git clone https://github.com/norune541/Recallio.git
cd Recallio
bun install
```

### 2. Configure environment variables

Configure the backend environment using the variables defined by the backend configuration. These include credentials and settings for:

- PostgreSQL connection
- Anthropic API access
- Shopify app credentials and OAuth callback
- Token encryption
- Clerk authentication
- Backend runtime configuration

For local frontend development, create `frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:3000
```

Use the exact variable names expected by the current backend configuration. Never commit secrets or production credentials.

### 3. Build the shared package

From the repository root:

```bash
bun run --cwd shared build
```

### 4. Generate Prisma Client and apply migrations

```bash
bunx prisma generate --schema backend/src/prisma/schema.prisma
bunx prisma migrate dev --schema backend/src/prisma/schema.prisma
```

Make sure PostgreSQL is running and the database connection is configured before applying migrations.

### 5. Start the backend

```bash
bun run backend:dev
```

With the default local backend URL:

- Swagger UI: http://localhost:3000/docs
- OpenAPI JSON: http://localhost:3000/api-json

### 6. Generate frontend API types

With the backend running, open another terminal:

```bash
bun run api:generate
```

This generates `shared/src/types/api.d.ts` from the backend's OpenAPI document.

Regenerate the types after changing API routes or request/response schemas.

### 7. Start the frontend

```bash
bun run frontend:dev
```

Vite prints the local frontend URL when the development server starts.

## Development commands

Run commands from the repository root unless noted otherwise.

| Command | Description |
| --- | --- |
| `bun run backend:dev` | Start NestJS in watch mode |
| `bun run backend:build` | Build the backend |
| `bun run backend:start` | Start the backend |
| `bun run backend:lint` | Lint backend source |
| `bun run backend:test` | Run backend tests |
| `bun run frontend:dev` | Start the Vite development server |
| `bun run frontend:build` | Type-check and build the frontend |
| `bun run frontend:lint` | Lint frontend source |
| `bun run frontend:preview` | Preview the production frontend build |
| `bun run --cwd shared build` | Compile shared package |
| `bun run api:generate` | Generate OpenAPI TypeScript definitions |

Additional backend scripts:

```bash
bun --filter @recallio/backend start:debug
bun --filter @recallio/backend start:prod
bun --filter @recallio/backend test:watch
bun --filter @recallio/backend test:cov
bun --filter @recallio/backend test:e2e
```

## Project status

Recallio is actively being built. The repository currently contains the foundations for:

- Shopify OAuth and connected-store management.
- Shopify product retrieval and synchronization.
- Claude-powered structured product analysis.
- PostgreSQL persistence for products, variants, and AI reviews.
- A React dashboard and shared type-safe API contracts.

The implementation is evolving; this README describes the current direction and repository structure rather than promising production availability or service-level guarantees.

## License

Recallio is distributed under the **Recallio Source Available License**. See [LICENSE](LICENSE) for the applicable terms.
