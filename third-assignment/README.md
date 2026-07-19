# Third Assignment

## Criteria

1. Monorepo
2. AI layer, data layer, and presentation layer
3. One agentic workflow
4. One streaming chat

## Architecture

- `apps/web` — presentation layer
- `apps/api` — API and streaming chat
- `apps/worker` — agentic roadmap workflow
- `packages/db` — PostgreSQL and Prisma
- `packages/queue` — BullMQ and Redis
- `packages/ui` — shared UI components

## Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm --filter @third-assignment/db db:generate
pnpm --filter @third-assignment/db db:migrate
```

Add your OpenAI and Tavily API keys to `.env`.

## Run

```bash
pnpm dev
```

- Web: <http://localhost:3000>
- API: <http://localhost:8000>
