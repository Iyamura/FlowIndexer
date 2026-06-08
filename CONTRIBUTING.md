# Contributing to FlowIndexer

Welcome! FlowIndexer is an open-source project and we love contributions.

## Development Setup

```bash
git clone https://github.com/opentrust/flow-indexer.git
cd flow-indexer
pnpm install
cp .env.example .env
docker-compose up postgres redis -d
pnpm db:generate && pnpm db:migrate && pnpm db:seed
pnpm dev
```

## How to Contribute

1. Check [open issues](https://github.com/opentrust/flow-indexer/issues) — look for `good first issue` or `sprint` labels
2. Comment on the issue to claim it
3. Fork the repo and create a branch: `git checkout -b feat/my-feature`
4. Make your changes following the guidelines below
5. Open a Pull Request

## Code Guidelines

- **TypeScript strict mode** — no `any` escapes without justification
- **No comments** unless the why is non-obvious
- **Prisma for all DB access** — no raw SQL except for analytics aggregations
- **Zod for validation** at API boundaries
- **BullMQ for async work** — never do heavy computation in request handlers

## Commit Convention

```
feat: add country filter to payments API
fix: handle expired trustlines in indexer
chore: update prisma schema for compliance records
```

## Testing

```bash
pnpm test              # all packages
pnpm test --filter=api # specific package
```

Integration tests require Postgres and Redis (use `docker-compose up postgres redis -d`).

## Drips Wave Sprint

We participate in contributor sprint programs. During a sprint:
- Pick issues tagged `sprint`
- Each issue has a clear acceptance criterion
- PRs should be scoped to a single issue
- Ping `@maintainers` in your PR when ready for review

## Package Ownership

| Package | Maintainer Area |
|---------|----------------|
| `packages/indexers` | Stellar / blockchain |
| `packages/analytics` | Data / SQL |
| `apps/dashboard` | Frontend / React |
| `apps/api` | Backend / GraphQL |
| `packages/sdk` | DX / TypeScript |
