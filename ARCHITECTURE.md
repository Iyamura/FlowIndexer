# Architecture

## Overview

FlowIndexer is a monorepo with two apps and four packages:

```
┌─────────────────────────────────────────────────────────┐
│                     apps/dashboard                       │
│           Next.js 15 · Recharts · shadcn/ui             │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                       apps/api                           │
│        Express · GraphQL · WebSocket · BullMQ           │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  REST /api  │  │   /graphql   │  │  ws://        │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │            BullMQ Workers                        │   │
│  │  stellar-indexer · trust-indexer · analytics     │   │
│  └──────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│                    packages/                             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │   indexers   │  │  analytics   │  │    shared     │ │
│  │ StellarIndex │  │ AnalyticsEng │  │ types/utils   │ │
│  │ TrustFlowIdx │  └──────────────┘  └───────────────┘ │
│  │ RemitBridgeI │                                       │
│  └──────────────┘                                       │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────┐  ┌────────────────────────┐
│        PostgreSQL            │  │         Redis           │
│  Prisma ORM · 20+ tables    │  │  BullMQ queues · cache  │
└─────────────────────────────┘  └────────────────────────┘
             │
┌────────────▼────────────────┐
│      Stellar Network         │
│  Horizon API (testnet/main) │
└─────────────────────────────┘
```

## Data Flow

### Indexing

```
Stellar Horizon API
       │
       ▼
StellarIndexer.tick()
  └─ indexPayments()
       │
       ▼
PostgreSQL (transactions, payments, assets, trustlines)
       │
       ▼
BullMQ → TrustFlowIndexer (recompute scores for affected users)
       │
       ▼
AnalyticsEngine.snapshotDaily() (triggered by cron worker)
```

### Request Lifecycle

```
Client → Express → rateLimiter → apiKeyMiddleware → route handler
                                                          │
                                                    PrismaClient
                                                          │
                                                    PostgreSQL
```

## Database Schema

### Core entities

- `users` — Stellar account owners
- `organizations` — Institutions using TrustFlow/RemitBridge
- `trust_relationships` — Directed trust edges (trustor → trustee)
- `trust_scores` — Computed reputation scores (versioned)
- `funding_streams` — TrustFlow funding streams
- `funding_allocations` — Per-organization allocations within a stream
- `payroll_batches` — RemitBridge disbursement batches
- `beneficiaries` — Individual recipients within a batch
- `settlements` — Anchor cash-out records

### Stellar chain data

- `transactions` — Stellar ledger transactions
- `payments` — Individual payment operations
- `assets` — Known assets (USDC, PYUSD, XLM)
- `trustlines` — Account trustline balances

### Analytics

- `analytics_snapshots` — Time-series snapshots (daily/weekly/monthly)
- `country_stats` — Aggregated volume by country + date
- `indexer_state` — Cursor/ledger tracking for each indexer

## Indexers

Each indexer extends `BaseIndexer`:

```typescript
abstract class BaseIndexer {
  abstract tick(): Promise<void>;
  start(): Promise<void>  // poll loop with retry
  stop(): void
  getState(): Promise<{ lastLedger, lastCursor }>
  saveState(): Promise<void>
}
```

`StellarIndexer` tracks the Horizon cursor across payment operations.
`TrustFlowIndexer` recomputes stale trust scores and expires relationships.
`RemitBridgeIndexer` drives payroll batch state machine (PENDING → PROCESSING → COMPLETED).

## Authentication

API keys are hashed with SHA-256 before storage. The prefix (`fi_abc123...`) is stored in plaintext for display; only the hash is used for lookup. Keys can have permissions arrays and expiry dates.

## Queue Architecture

```
Queue: stellar-indexer
  ├─ job: index-payments
  └─ job: index-account

Queue: trust-indexer
  └─ job: compute-score { userId }

Queue: analytics
  └─ job: snapshot-daily

Queue: notifications
  └─ job: broadcast-event { type, payload }
```

Workers use `concurrency` settings to prevent Horizon rate-limit hits.
