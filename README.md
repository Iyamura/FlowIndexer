# FlowIndexer

Open-source indexing and analytics platform for trust graphs, funding streams, and cross-border payment activity across the OpenTrust ecosystem.

[![CI](https://github.com/opentrust/flow-indexer/actions/workflows/ci.yml/badge.svg)](https://github.com/opentrust/flow-indexer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## What it indexes

| Source | Data |
|--------|------|
| **Stellar Network** | Transactions, payments, accounts, assets, trustlines, USDC/PYUSD flows |
| **TrustFlow** | Trust relationships, reputation scores, trust graph, funding streams |
| **RemitBridge** | Payroll batches, beneficiaries, settlements, cross-border metrics |

## Architecture

```
apps/
  dashboard/    Next.js 15 analytics dashboard
  api/          REST + GraphQL + WebSocket API

packages/
  indexers/     Stellar, TrustFlow, RemitBridge indexers
  analytics/    Analytics engine (volume, trust, funding metrics)
  shared/       Types, constants, utilities
  sdk/          TypeScript SDK (@flow-indexer/sdk)
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Local development

```bash
# Clone and install
git clone https://github.com/opentrust/flow-indexer.git
cd flow-indexer
pnpm install

# Copy env
cp .env.example .env

# Start Postgres + Redis
docker-compose up postgres redis -d

# Generate Prisma client and migrate
pnpm db:generate
pnpm db:migrate

# Seed with sample data
pnpm db:seed

# Start all services
pnpm dev
```

Dashboard: http://localhost:3000
API: http://localhost:4000
GraphQL: http://localhost:4000/graphql

### Docker (full stack)

```bash
docker-compose up -d
```

## SDK Usage

```typescript
import { FlowIndexerClient } from "@flow-indexer/sdk";

const client = new FlowIndexerClient({
  baseUrl: "https://api.flowindexer.io",
  apiKey: "your-api-key",
});

// Ecosystem metrics
const metrics = await client.getEcosystemMetrics();

// Trust graph
const graph = await client.getTrustGraph();

// Funding streams
const streams = await client.getFundingStreams({ status: "ACTIVE" });

// Payments by country
const payments = await client.getPayments({ country: "NG", assetCode: "USDC" });

// All analytics
const analytics = await client.getAnalytics();
```

## REST API

```
GET /api/stats/ecosystem
GET /api/stats/volume/daily?days=30
GET /api/stats/volume/monthly?months=12
GET /api/stats/funding

GET /api/transactions?page=1&pageSize=20&address=G...
GET /api/transactions/:hash

GET /api/payments?assetCode=USDC&country=NG
GET /api/payments/:operationId

GET /api/trust?status=ACTIVE
GET /api/trust/graph?userId=...
GET /api/trust/scores/:userId

GET /api/funding?status=ACTIVE
GET /api/funding/:id

GET /api/organizations?search=...
GET /api/organizations/:slug

GET /api/users?search=...
GET /api/users/:stellarAddress
```

Authentication: `x-api-key: <your-key>` header.

## WebSocket

```javascript
const ws = new WebSocket("ws://localhost:4000");

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: "subscribe",
    events: ["payment.new", "stream.created", "trust.changed"]
  }));
};

ws.onmessage = (msg) => {
  const event = JSON.parse(msg.data);
  // { type: "payment.new", payload: {...}, timestamp: "..." }
};
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). We run contributor sprints — check open issues labeled `good first issue` and `sprint`.

## License

MIT
