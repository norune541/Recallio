# Recallio

Recallio is an AI-powered SaaS dashboard for Shopify merchants.

By connecting their Shopify store, merchants will be able to use AI to understand store data, generate content, summarize information, and streamline everyday workflows.

AI is at the core of Recallio. The goal is to provide an intelligent workspace that combines Shopify data and AI-powered capabilities in one dashboard, going beyond a traditional chatbot interface.

## Architecture

Recallio is a monorepo managed with [Bun Workspaces](https://bun.com). The application is divided into three packages:

- **`backend`** — NestJS API responsible for server-side logic, configuration, integrations, and data access.
- **`frontend`** — React application providing the dashboard and user interface.
- **`shared`** — Shared TypeScript schemas, types, and definitions consumed by the backend and frontend.

```text
recallio/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment configuration
│   │   ├── modules/         # Application modules
│   │   ├── prisma/          # Prisma service, schema, and migrations
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts          # Application entry point
│   ├── test/
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
├── shared/
│   ├── src/
│   │   ├── schemas/         # Shared Zod schemas
│   │   └── types/
│   │       └── api.d.ts     # Generated OpenAPI types
│   ├── dist/                # Compiled shared modules
│   └── package.json
├── package.json
└── bun.lock
```

## Tech Stack

### Backend — `@recallio/backend`

Built with NestJS and TypeScript.

| Technology          | Purpose                                     |
| ------------------- | ------------------------------------------- |
| NestJS              | Backend application framework               |
| Express             | HTTP platform                               |
| Google GenAI SDK    | Integration with Google AI models           |
| Shopify API SDK     | Shopify API integration                     |
| Prisma              | Database access and schema management       |
| PostgreSQL adapter  | Prisma integration with PostgreSQL          |
| `@nestjs/config`    | Application configuration                   |
| `@nestjs/swagger`   | API documentation and OpenAPI specification |
| `@nestjs/terminus`  | Health checks and service monitoring        |
| `@nestjs/throttler` | Request throttling                          |
| Zod                 | Runtime schema validation                   |
| Helmet              | HTTP security headers                       |
| Vitest              | Unit and integration testing                |
| Oxlint              | Code linting                                |
| Prettier            | Code formatting                             |

### Frontend — `@recallio/frontend`

Built with React, TypeScript, and Vite.

| Technology      | Purpose                                  |
| --------------- | ---------------------------------------- |
| React           | User interface                           |
| Vite            | Development server and production builds |
| React Router    | Client-side routing                      |
| TanStack Query  | Server-state management                  |
| Base UI         | Accessible UI primitives                 |
| shadcn          | UI component tooling                     |
| Tailwind CSS    | Utility-first styling                    |
| Lucide React    | Icons                                    |
| React Hook Form | Form state management                    |
| Sonner          | Toast notifications                      |
| next-themes     | Theme management                         |
| Geist           | Typography                               |
| ESLint          | Code linting                             |
| `openapi-fetch` | Type-safe API requests                   |

### Shared — `@recallio/shared`

Contains shared TypeScript schemas and definitions used across workspaces.

- **Zod schemas** provide runtime validation and are compiled into `shared/dist`.
- **OpenAPI types** are generated from the backend's OpenAPI document and stored in `shared/src/types/api.d.ts`.
- The backend and frontend consume the shared package and generated API definitions.

Both the backend and frontend declare `@recallio/shared` as a workspace dependency where required.

## Application Overview

Recallio is designed to bring Shopify store data and AI capabilities together in a single dashboard.

The intended workflow is:

1. **Connect Shopify** — A merchant connects their Shopify store to Recallio.
2. **Access store data** — The application retrieves and processes relevant information through the Shopify API.
3. **Interact with AI** — Users can ask questions, summarize data, generate text, and perform other AI-assisted tasks.
4. **Work from a unified dashboard** — AI capabilities are integrated into the broader application experience rather than being limited to a standalone chat interface.

The backend is responsible for API requests, application configuration, integrations, and data access. The frontend provides the interface through which merchants interact with Recallio.

The current backend foundation includes application configuration, a health-check module, and Prisma infrastructure. Additional business modules can be developed as the application evolves.

## Prerequisites

- [Bun](https://bun.com) 1.4+
- PostgreSQL
- Google AI API credentials for AI functionality
- Shopify app credentials for Shopify integration

## Initial Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd Recallio
```

### 2. Install dependencies

Run from the repository root:

```bash
bun install
```

Bun installs dependencies for the configured workspaces, including their shared workspace dependencies.

### 3. Configure environment variables

Configure the environment variables required by the backend and frontend.

The backend configuration may include:

- PostgreSQL connection string
- Google AI API credentials
- Shopify app credentials
- Application runtime configuration

For local frontend development, configure `frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:3000
```

Adjust the URL if the backend uses a different address or port.

Refer to the backend environment configuration for the exact variable names and required values.

Do not commit secrets or private credentials to version control.

### 4. Build the shared package

Run from the repository root:

```bash
bun run --cwd shared build
```

This compiles shared runtime modules, including Zod schemas, into `shared/dist`.

Rebuild the shared package after modifying shared runtime code or schemas.

### 5. Generate Prisma Client

Run from the repository root:

```bash
bunx prisma generate --schema backend/src/prisma/schema.prisma
```

This generates Prisma Client based on the configured Prisma schema.

Regenerate the client whenever changes to the Prisma schema require it.

### 6. Apply database migrations

Make sure PostgreSQL is running and the database connection string is configured.

Run from the repository root:

```bash
bunx prisma migrate dev --schema backend/src/prisma/schema.prisma
```

This applies pending migrations to the development database and creates a migration when schema changes require one.

### 7. Start the backend

Run from the repository root:

```bash
bun run backend:dev
```

The backend starts in development mode with file watching enabled.

With the default local backend URL, the API documentation is available at:

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/api-json`

Keep the backend running for the next step.

### 8. Generate OpenAPI types

Open a separate terminal and run from the repository root:

```bash
bun run api:generate
```

This fetches the OpenAPI document from the running backend and generates TypeScript API definitions at:

```text
shared/src/types/api.d.ts
```

The generated definitions expose types such as `paths`, `components`, and `operations`.

Regenerate these definitions whenever API endpoints, request parameters, or response schemas change. Ensure the running backend reflects the latest API changes before generating.

### 9. Start the frontend

Open another terminal and run from the repository root:

```bash
bun run frontend:dev
```

Vite starts the frontend development server and prints its local URL in the terminal.

## Development Commands

Run these commands from the repository root.

### Shared

| Command                      | Description                                                             |
| ---------------------------- | ----------------------------------------------------------------------- |
| `bun run --cwd shared build` | Compile shared runtime modules and Zod schemas                          |
| `bun run api:generate`       | Generate TypeScript API definitions from the backend's OpenAPI document |

### Database

| Command                                                             | Description                           |
| ------------------------------------------------------------------- | ------------------------------------- |
| `bunx prisma generate --schema backend/src/prisma/schema.prisma`    | Generate Prisma Client                |
| `bunx prisma migrate dev --schema backend/src/prisma/schema.prisma` | Apply development database migrations |

### Backend

| Command                  | Description                           |
| ------------------------ | ------------------------------------- |
| `bun run backend:dev`    | Start the backend in development mode |
| `bun run backend:build`  | Build the backend                     |
| `bun run backend:start`  | Start the backend                     |
| `bun run backend:format` | Format backend source and test files  |
| `bun run backend:lint`   | Lint backend source and tests         |
| `bun run backend:test`   | Run backend tests                     |

Additional backend scripts can be run directly through the workspace:

```bash
bun --filter @recallio/backend start:debug
bun --filter @recallio/backend start:prod
bun --filter @recallio/backend test:watch
bun --filter @recallio/backend test:cov
bun --filter @recallio/backend test:e2e
```

### Frontend

| Command                    | Description                           |
| -------------------------- | ------------------------------------- |
| `bun run frontend:dev`     | Start the frontend development server |
| `bun run frontend:build`   | Type-check and build the frontend     |
| `bun run frontend:lint`    | Lint frontend code                    |
| `bun run frontend:preview` | Preview the production build          |

## Workspaces

The root `package.json` defines the following workspaces:

```json
{
  "workspaces": ["backend", "frontend", "shared"]
}
```

Each workspace has its own `package.json`.

To execute a command directly within a specific workspace, use Bun's `--filter` option:

```bash
bun --filter @recallio/backend build
bun --filter @recallio/backend start:dev
```

## Type-Safe API Client

Recallio uses `openapi-typescript` to generate TypeScript definitions from the backend's OpenAPI document and `openapi-fetch` to make type-safe API requests from the frontend.

The frontend API client is configured in `frontend/src/lib/api.ts`:

```typescript
import createClient from 'openapi-fetch';
import type { paths } from '@recallio/api-types';

export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
});
```

Example request:

```typescript
const { data, error, response } = await api.GET('/health');
```

The generated `paths` type provides endpoint-aware request and response typing.

To regenerate the definitions, start the backend and run:

```bash
bun run api:generate
```

## License

Recallio is distributed under the Recallio Source Available License.

See the [LICENSE](LICENSE) file for the full license terms.
