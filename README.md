# Recallio

Recallio is an AI-powered SaaS dashboard for Shopify merchants.

By connecting their Shopify store, merchants will be able to use AI to understand store data, generate content, summarize information, and streamline everyday workflows.

AI is at the core of Recallio. The goal is to provide an intelligent workspace that combines Shopify data and AI-powered capabilities in one dashboard, going beyond a traditional chatbot interface.

## Architecture

Recallio is a monorepo managed with [Bun Workspaces](https://bun.com). The application is divided into three packages:

- **`backend`** — NestJS API responsible for server-side logic, configuration, integrations, and data access.
- **`frontend`** — React application providing the dashboard and user interface.
- **`shared`** — Shared TypeScript types and definitions consumed by the backend and frontend.

```text
recallio/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment configuration
│   │   ├── modules/
│   │   │
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
│   └── package.json
├── package.json
└── bun.lock
```

## Tech Stack

### Backend — `@recallio/backend`

Built with NestJS and TypeScript.

| Technology          | Purpose                               |
| ------------------- | ------------------------------------- |
| NestJS              | Backend application framework         |
| Express             | HTTP platform                         |
| Google GenAI SDK    | Integration with Google AI models     |
| Shopify API SDK     | Shopify API integration               |
| Prisma              | Database access and schema management |
| PostgreSQL adapter  | Prisma integration with PostgreSQL    |
| `@nestjs/config`    | Application configuration             |
| `@nestjs/swagger`   | API documentation                     |
| `@nestjs/terminus`  | Health checks and service monitoring  |
| `@nestjs/throttler` | Request throttling                    |
| Zod                 | Runtime schema validation             |
| Helmet              | HTTP security headers                 |
| Vitest              | Unit and integration testing          |
| Oxlint              | Code linting                          |
| Prettier            | Code formatting                       |

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

### Shared — `@recallio/shared`

Contains shared TypeScript types and definitions used across workspaces.

Both the backend and frontend declare `@recallio/shared` as a workspace dependency.

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
- A PostgreSQL database if required by the configured Prisma datasource
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

Depending on the functionality being configured, these may include:

- Database connection settings
- Google AI API credentials
- Shopify app credentials
- Application runtime configuration

Refer to the backend environment configuration and the relevant integration setup for the exact variable names and required values.

Do not commit secrets or private credentials to version control.

### 4. Set up the database

If the application is configured to use PostgreSQL, configure the database connection and apply the Prisma migrations using the project's Prisma setup.

Consult the Prisma schema and migration configuration before running database commands.

### 5. Start the backend

```bash
bun run backend:dev
```

The backend starts in development mode with file watching enabled.

### 6. Start the frontend

In a separate terminal:

```bash
bun run frontend:dev
```

Vite starts the frontend development server and prints its local URL in the terminal.

## Development Commands

Run these commands from the repository root.

### Backend

| Command                  | Description                           |
| ------------------------ | ------------------------------------- |
| `bun run backend:dev`    | Start the backend in development mode |
| `bun run backend:build`  | Build the backend                     |
| `bun run backend:start`  | Start the backend                     |
| `bun run backend:format` | Format backend source and test files  |
| `bun run backend:lint`   | Lint backend source and tests         |
| `bun run backend:test`   | Run backend tests                     |

Additional backend scripts are available within the workspace:

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

## License

Recallio is distributed under the Recallio Source Available License.

See the [LICENSE](LICENSE) file for the full license terms.
