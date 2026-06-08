# API Reference

Base URL: `http://localhost:4000/api`

## Authentication

Pass an API key in the `x-api-key` header:

```
x-api-key: fi_your_key_here
```

Unauthenticated requests work but are rate-limited to 60 req/min.
Authenticated requests: 300 req/min.

---

## Stats

### `GET /stats/ecosystem`

Returns ecosystem-wide aggregated metrics.

```json
{
  "success": true,
  "data": {
    "totalUsers": 1234,
    "totalOrganizations": 56,
    "totalTransactions": 98765,
    "totalVolume": "4500000.0000000",
    "totalTrustRelationships": 3421,
    "activeFundingStreams": 87,
    "totalRecipients": 5432,
    "countriesReached": 34
  }
}
```

### `GET /stats/volume/daily?days=30`

Daily payment volume for the last N days.

### `GET /stats/volume/monthly?months=12`

Monthly payment volume for the last N months.

### `GET /stats/funding`

Funding stream aggregates.

---

## Transactions

### `GET /transactions`

| Param | Type | Description |
|-------|------|-------------|
| page | int | Page number (default: 1) |
| pageSize | int | Results per page (max: 100) |
| address | string | Filter by source account |
| from | ISO8601 | Start date |
| to | ISO8601 | End date |

### `GET /transactions/:hash`

Single transaction with its payment operations.

---

## Payments

### `GET /payments`

| Param | Type | Description |
|-------|------|-------------|
| page | int | Page number |
| pageSize | int | Results per page |
| address | string | Sender or receiver address |
| assetCode | string | e.g. `USDC`, `XLM` |
| country | string | ISO 3166-1 alpha-2 |
| from | ISO8601 | Start date |
| to | ISO8601 | End date |

### `GET /payments/:operationId`

Single payment operation.

---

## Trust

### `GET /trust`

| Param | Type | Description |
|-------|------|-------------|
| userId | string | User ID (filters as trustor or trustee) |
| status | enum | ACTIVE \| REVOKED \| EXPIRED \| PENDING |

### `GET /trust/graph?userId=&depth=2`

Returns a trust graph (nodes + edges) centered on a user.

### `GET /trust/scores/:userId`

Historical trust score computations for a user.

### `POST /trust/compute/:userId`

Trigger an immediate trust score recomputation.

---

## Funding

### `GET /funding`

| Param | Type | Description |
|-------|------|-------------|
| status | enum | ACTIVE \| PAUSED \| COMPLETED \| CANCELLED |
| creatorId | string | Filter by creator |
| recipientId | string | Filter by recipient |

### `GET /funding/:id`

Single funding stream with allocations.

---

## Organizations

### `GET /organizations`

| Param | Type | Description |
|-------|------|-------------|
| search | string | Name or slug search |
| verified | boolean | Filter by verification status |
| country | string | ISO country code |

### `GET /organizations/:slug`

Organization detail with recent payroll batches.

---

## Users

### `GET /users`

| Param | Type | Description |
|-------|------|-------------|
| search | string | Address or display name |
| organizationId | string | Filter by org |

### `GET /users/:stellarAddress`

User profile with trust scores and counts.

---

## GraphQL

Endpoint: `POST /graphql`

Playground: `GET /graphql` (in development)

### Example query

```graphql
query {
  stats {
    totalUsers
    totalVolume
    activeFundingStreams
  }
  
  trustGraph(userId: "...") {
    nodes { id address displayName type }
    edges { source target weight trustType }
  }
  
  payments(assetCode: "USDC", country: "NG", pageSize: 10) {
    data {
      operationId
      fromAddress
      toAddress
      amount
      createdAt
    }
    total
    hasMore
  }
}
```

---

## WebSocket

Connect to `ws://localhost:4000`.

### Subscribe

```json
{ "type": "subscribe", "events": ["payment.new", "stream.created", "trust.changed"] }
```

### Events

| Event | Payload |
|-------|---------|
| `payment.new` | Payment object |
| `stream.created` | FundingStream object |
| `stream.updated` | { id, status, releasedAmount } |
| `stream.completed` | { id } |
| `trust.changed` | { userId, score } |
| `payroll.processed` | { batchId, status } |
| `analytics.updated` | EcosystemMetric |

### Ping/Pong

```json
{ "type": "ping" }
→ { "type": "pong" }
```

---

## Error Responses

```json
{
  "success": false,
  "error": "Transaction not found"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error |
| 401 | Invalid or missing API key |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
