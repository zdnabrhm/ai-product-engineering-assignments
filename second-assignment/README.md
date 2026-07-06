# Second Assignment

## Criteria

1. Hono API
2. Use BullMQ and Redis
3. AI Pipeline Workflow

## Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
```

Add your OpenAI API key to `.env`.

## Run

Run the API:

```bash
pnpm dev
```

Run the BullMQ worker in a separate terminal:

```bash
pnpm worker:dev
```
