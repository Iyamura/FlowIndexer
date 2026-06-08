# GitHub Issues — FlowIndexer Contributor Sprint

Copy each issue into GitHub. Use the listed labels.
Labels to create first: `good first issue`, `advanced`, `sprint`, `frontend`, `backend`, `indexer`, `analytics`, `sdk`, `docs`, `testing`, `devex`.

---

## Beginner Issues (50)

### Frontend / Dashboard

**#1 — Add loading skeleton to Overview stats cards**
Labels: `good first issue` `sprint` `frontend`
The stat cards on `/` show empty values while fetching. Replace with animated skeleton placeholders using Tailwind's `animate-pulse` class.
Acceptance: Skeletons visible for ≥300ms on slow connections. No layout shift when data loads.

**#2 — Add "Copy address" button to wallet displays**
Labels: `good first issue` `sprint` `frontend`
Throughout the dashboard, Stellar addresses are truncated. Add a clipboard icon button next to each that copies the full address and shows a brief "Copied!" tooltip.
Files: `apps/dashboard/src/components/ui/`

**#3 — Implement dark mode toggle**
Labels: `good first issue` `sprint` `frontend`
Add a sun/moon toggle button in the Header that switches between light and dark Tailwind classes. Persist preference to `localStorage`.

**#4 — Add empty state illustrations to all pages**
Labels: `good first issue` `sprint` `frontend`
Pages like Payments, Funding, Users currently show plain text when empty. Add a simple SVG illustration and a helpful message with a call-to-action.

**#5 — Add pagination controls to the Payments table**
Labels: `good first issue` `sprint` `frontend`
The payments table shows 50 rows but has no pagination UI. Add Previous/Next buttons and a page indicator. Use the `hasMore` field from the API response.

**#6 — Add pagination controls to the Users table**
Labels: `good first issue` `sprint` `frontend`
Same as #5 but for `apps/dashboard/src/app/users/page.tsx`.

**#7 — Display trust score badge on user rows**
Labels: `good first issue` `sprint` `frontend`
User rows already receive `trustScores[0]` from the API. Style the score as a colored badge: green (>70), yellow (40-70), red (<40).

**#8 — Add country flag emoji to CountryChart**
Labels: `good first issue` `sprint` `frontend`
Prepend a flag emoji to each country code in `CountryChart.tsx`. Use a small lookup map for the top 20 recipient countries.

**#9 — Add "View on Stellar Expert" link to transaction detail**
Labels: `good first issue` `sprint` `frontend`
In the Explorer transaction view, add an external link to `https://stellar.expert/explorer/public/tx/{hash}`.

**#10 — Add tooltip to trust graph nodes**
Labels: `good first issue` `sprint` `frontend`
In `TrustGraphViewer`, show a styled tooltip with address, display name, and trust score when hovering a node.

**#11 — Show "Last indexed" timestamp in sidebar**
Labels: `good first issue` `sprint` `frontend`
The sidebar shows "Indexer Active" but no timestamp. Fetch `GET /health` periodically and show the last-updated time.

**#12 — Add responsive mobile navigation**
Labels: `good first issue` `sprint` `frontend`
The sidebar is hidden on small screens. Add a hamburger button in the Header that opens a slide-out drawer on mobile.

**#13 — Add search to Organizations page**
Labels: `good first issue` `sprint` `frontend`
Add a text input above the org grid that filters using `?search=` query param on the API.

**#14 — Add sort controls to Payments table**
Labels: `good first issue` `sprint` `frontend`
Allow sorting by Amount and Time with clickable column headers.

**#15 — Display funding stream progress percentage**
Labels: `good first issue` `sprint` `frontend`
In `apps/dashboard/src/app/funding/page.tsx`, add a text label like "25% released" next to the progress bar.

**#16 — Add "Asset" filter dropdown to Payments page**
Labels: `good first issue` `sprint` `frontend`
Add a dropdown to filter payments by asset code (XLM, USDC, PYUSD).

**#17 — Show active/completed stream counts on Overview**
Labels: `good first issue` `sprint` `frontend`
The Overview shows `activeFundingStreams`. Add a second metric card for completed streams from `GET /stats/funding`.

**#18 — Add breadcrumb navigation**
Labels: `good first issue` `sprint` `frontend`
Add a breadcrumb component that shows the current page path, e.g. "Overview / Analytics".

**#19 — Animate stat card numbers on mount**
Labels: `good first issue` `sprint` `frontend`
Use a simple count-up animation when stat card values first render (animate from 0 to the target value over 800ms).

**#20 — Add "No API key" banner**
Labels: `good first issue` `sprint` `frontend`
If `NEXT_PUBLIC_API_KEY` is not set, show a dismissible banner saying "Running without an API key — rate limits apply."

---

### Backend / API

**#21 — Add `GET /api/assets` endpoint**
Labels: `good first issue` `sprint` `backend`
Return paginated list of indexed assets from the `assets` table. Include `code`, `issuer`, `name`, `isAnchored`, `totalSupply`.

**#22 — Add `GET /api/payroll` endpoint**
Labels: `good first issue` `sprint` `backend`
Return paginated payroll batches. Support filtering by `organizationId` and `status`.

**#23 — Add `GET /api/payroll/:id/beneficiaries` endpoint**
Labels: `good first issue` `sprint` `backend`
Return beneficiaries for a specific payroll batch with status and country.

**#24 — Add request logging middleware**
Labels: `good first issue` `sprint` `backend`
`pino-http` is already installed. Wire it into the Express app to log method, path, status code, and duration for every request.

**#25 — Add `X-Request-ID` header to all responses**
Labels: `good first issue` `sprint` `backend`
Generate a UUID per request and attach it to both the request object and response headers for tracing.

**#26 — Return `createdAt` in ISO format consistently**
Labels: `good first issue` `sprint` `backend`
Audit all API responses — some return `Date` objects, some return strings. Standardize to ISO 8601 strings throughout.

**#27 — Add `GET /api/trustlines` endpoint**
Labels: `good first issue` `sprint` `backend`
Return paginated trustlines. Support filtering by `account` and `assetCode`.

**#28 — Add input sanitization for search params**
Labels: `good first issue` `sprint` `backend`
The `search` param in `/users` and `/organizations` is passed to Prisma `contains`. Add `.trim()` and a max-length of 100 chars to prevent abuse.

**#29 — Return 400 for invalid Stellar addresses**
Labels: `good first issue` `sprint` `backend`
In `GET /users/:address`, validate the address matches the Stellar format (`/^G[A-Z2-7]{55}$/`) before querying. Return 400 with a clear error if invalid.

**#30 — Add `GET /api/stats/countries` endpoint**
Labels: `good first issue` `sprint` `backend`
Expose the `getCountryStats()` analytics method as a REST endpoint with `?assetCode=` filter support.

---

### SDK

**#31 — Add JSDoc comments to all FlowIndexerClient methods**
Labels: `good first issue` `sprint` `sdk` `docs`
Add one-line JSDoc `/** */` comments to each public method in `packages/sdk/src/FlowIndexerClient.ts`.

**#32 — Add `getPayrollBatches()` to the SDK**
Labels: `good first issue` `sprint` `sdk`
Wire up the new `/api/payroll` endpoint (from issue #22) in the SDK client.

**#33 — Add `getAssets()` to the SDK**
Labels: `good first issue` `sprint` `sdk`
Wire up `/api/assets` in the SDK.

**#34 — Write SDK usage examples in a `examples/` folder**
Labels: `good first issue` `sprint` `sdk` `docs`
Create `packages/sdk/examples/basic.ts` with a runnable example showing ecosystem metrics, trust graph, and funding streams.

**#35 — Export all enum values from the SDK**
Labels: `good first issue` `sprint` `sdk`
Add const enum exports for `TrustType`, `TrustStatus`, `StreamStatus`, `StreamType`, `BatchStatus` so SDK consumers don't need magic strings.

---

### DevEx / Tooling

**#36 — Add `.editorconfig` file**
Labels: `good first issue` `sprint` `devex`
Add an `.editorconfig` enforcing `indent_style=space`, `indent_size=2`, `end_of_line=lf`, `insert_final_newline=true`.

**#37 — Add Prettier config and format all files**
Labels: `good first issue` `sprint` `devex`
Create `.prettierrc` with `printWidth: 100`, `singleQuote: false`, `trailingComma: "all"`. Run `pnpm format` and commit the result.

**#38 — Add `pnpm-workspace.yaml`**
Labels: `good first issue` `sprint` `devex`
Create `pnpm-workspace.yaml` that references `apps/*` and `packages/*` so pnpm resolves workspace packages correctly.

**#39 — Add `make dev` shortcut**
Labels: `good first issue` `sprint` `devex`
Create a `Makefile` with targets: `dev` (docker up + pnpm dev), `db-reset` (migrate reset + seed), `clean` (docker down + rm node_modules).

**#40 — Add VS Code recommended extensions file**
Labels: `good first issue` `sprint` `devex`
Create `.vscode/extensions.json` recommending: Prisma, ESLint, Tailwind CSS IntelliSense, REST Client, and Thunder Client.

---

### Documentation

**#41 — Write API.md examples for the GraphQL endpoint**
Labels: `good first issue` `sprint` `docs`
Add 3 example GraphQL queries to `API.md`: one for the trust graph, one for funding streams, one for country analytics.

**#42 — Add inline schema comments to `prisma/schema.prisma`**
Labels: `good first issue` `sprint` `docs`
Add `/// Description` doc comments to each model in the Prisma schema explaining what it represents and its key relationships.

**#43 — Document environment variables in README**
Labels: `good first issue` `sprint` `docs`
Add a table of all `.env.example` variables to README.md with descriptions and whether they're required.

**#44 — Create a CHANGELOG.md**
Labels: `good first issue` `sprint` `docs`
Create `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com) format. Add an `[Unreleased]` section with the initial feature list.

**#45 — Add architecture diagram alt text**
Labels: `good first issue` `sprint` `docs`
The ASCII diagram in `ARCHITECTURE.md` needs an accessible description. Add a prose paragraph below it describing the same topology.

---

### Testing

**#46 — Write unit tests for `packages/shared/src/utils.ts`**
Labels: `good first issue` `sprint` `testing`
Add a `utils.test.ts` using Vitest. Cover: `formatAmount`, `truncateAddress`, `isStellarAddress`, `chunkArray`, `buildDateRange`.

**#47 — Write unit tests for `AnalyticsEngine.getEcosystemMetrics()`**
Labels: `good first issue` `sprint` `testing`
Mock Prisma using `vitest-mock-extended`. Verify the method calls the right Prisma methods and returns the expected shape.

**#48 — Add an API health check integration test**
Labels: `good first issue` `sprint` `testing`
Using `supertest`, write a test that starts the Express app and asserts `GET /health` returns 200 with `{ status: "ok" }`.

**#49 — Add Vitest config to all packages**
Labels: `good first issue` `sprint` `testing` `devex`
Create `vitest.config.ts` in `packages/shared`, `packages/analytics`, and `apps/api` with `test.environment: "node"` and coverage via `@vitest/coverage-v8`.

**#50 — Add GitHub Actions test matrix for Node 20 and 22**
Labels: `good first issue` `sprint` `testing` `devex`
Update `.github/workflows/ci.yml` to run the test job in a matrix with `node-version: [20, 22]`.

---

## Advanced Issues (25)

**#51 — Implement real-time payment streaming via WebSocket**
Labels: `advanced` `sprint` `backend` `indexer`
When `StellarIndexer` indexes a new payment, emit a `payment.new` WebSocket event to all subscribed clients using the `broadcast()` function. Add an integration test that verifies the event is emitted within 5s of a payment being inserted.

**#52 — Build trust score V2 algorithm using PageRank**
Labels: `advanced` `sprint` `analytics`
Implement a PageRank-based trust propagation algorithm in `packages/analytics/src/TrustPageRank.ts`. The score should propagate through the trust graph edges weighted by `TrustRelationship.weight`. Compare output against V1 scores in a test.

**#53 — Add Stellar account streaming with SSE cursor**
Labels: `advanced` `sprint` `indexer`
Replace the polling loop in `StellarIndexer` with Horizon's EventSource streaming (`payments().stream()`). Maintain the cursor in `indexer_states` and resume on restart.

**#54 — Implement API key creation and management endpoints**
Labels: `advanced` `sprint` `backend`
Add `POST /api/auth/keys`, `GET /api/auth/keys`, `DELETE /api/auth/keys/:id`. Keys should be generated as `fi_<random 32 bytes hex>`, stored as SHA-256 hashes, and scoped to the authenticated user.

**#55 — Build a TrustFlow funding stream state machine**
Labels: `advanced` `sprint` `indexer` `backend`
Implement a proper state machine for `FundingStream` transitions (ACTIVE → PAUSED → ACTIVE → COMPLETED/CANCELLED). Enforce valid transitions in the API and indexer. Add state transition audit logs.

**#56 — Add Redis caching layer to analytics endpoints**
Labels: `advanced` `sprint` `backend` `analytics`
Cache `GET /stats/ecosystem` (TTL: 60s) and `GET /stats/volume/*` (TTL: 300s) in Redis. Implement a cache invalidation strategy that busts the cache when the indexer writes new payment records.

**#57 — Build a country-level payment heatmap component**
Labels: `advanced` `sprint` `frontend`
Create a world map SVG heatmap component using D3 that colors countries by payment volume. Use the `GET /api/stats/countries` data. Countries with no data should be shown in grey.

**#58 — Implement GraphQL subscriptions for real-time events**
Labels: `advanced` `sprint` `backend`
Wire `graphql-ws` subscriptions for `paymentAdded`, `streamCreated`, and `trustScoreUpdated`. Use `graphql-subscriptions` PubSub internally and connect it to the WebSocket broadcast system.

**#59 — Add multi-hop trust path finder**
Labels: `advanced` `sprint` `analytics`
Implement BFS in `packages/analytics/src/TrustPathFinder.ts` that finds the shortest trust path between two user IDs through the trust graph. Expose via `GET /api/trust/path?from=&to=`. Max depth: 6 hops.

**#60 — Build a payroll batch CSV import endpoint**
Labels: `advanced` `sprint` `backend`
Add `POST /api/payroll/import` that accepts a CSV with columns `stellarAddress,amount,country`. Parse it with a streaming parser, validate each row, and create a `PayrollBatch` with associated `Beneficiary` records.

**#61 — Implement anchor discovery via SEP-1 (stellar.toml)**
Labels: `advanced` `sprint` `indexer`
When a new asset issuer is indexed, fetch `https://<domain>/.well-known/stellar.toml` and extract anchor metadata. Store it in the `assets` table (`domain`, `name`, `imageUrl`).

**#62 — Add rate limit storage to Redis**
Labels: `advanced` `sprint` `backend`
Replace the in-memory `express-rate-limit` store with `rate-limit-redis` so rate limits are shared across API replicas.

**#63 — Build analytics snapshot scheduler**
Labels: `advanced` `sprint` `analytics` `backend`
Create a BullMQ repeatable job that runs `AnalyticsEngine.snapshotDaily()` every day at midnight UTC. Add `GET /api/analytics/snapshots` to retrieve historical snapshots.

**#64 — Add Prisma query performance monitoring**
Labels: `advanced` `sprint` `backend`
Use Prisma's `$on("query")` extension to log slow queries (>100ms) with query text and duration. Expose a `GET /api/admin/slow-queries` endpoint (admin-key protected) that returns the last 50 slow queries.

**#65 — Implement trust graph layout with force-directed algorithm**
Labels: `advanced` `sprint` `frontend`
Upgrade `TrustGraphViewer` to use `d3-force` properly with drag-and-drop node repositioning, zoom/pan via `d3-zoom`, and smooth transitions when the graph updates.

**#66 — Add USDC anchor activity dashboard tab**
Labels: `advanced` `sprint` `frontend` `analytics`
Add a dedicated "Anchors" tab to the Analytics page showing: top anchors by volume, USDC vs PYUSD split, and a time-series chart of anchor settlement volume.

**#67 — Build a beneficiary status webhook system**
Labels: `advanced` `sprint` `backend`
Allow organizations to register webhook URLs via `POST /api/webhooks`. When a `Beneficiary` status changes to SETTLED or FAILED, POST the event payload to all registered webhooks for that organization. Include HMAC-SHA256 signatures.

**#68 — Add full-text search across entities**
Labels: `advanced` `sprint` `backend`
Create `GET /api/search?q=` that searches across Users, Organizations, and Transactions simultaneously. Use PostgreSQL `tsvector` + `to_tsquery` for full-text search. Return ranked results grouped by entity type.

**#69 — Implement trust relationship bulk import**
Labels: `advanced` `sprint` `indexer` `backend`
Add `POST /api/trust/import` that accepts a JSON array of `{trustorAddress, trusteeAddress, trustType, weight}`. Process in batches of 100, upsert relationships, and enqueue trust score recomputation for all affected users.

**#70 — Build an Ecosystem Growth trend component**
Labels: `advanced` `sprint` `frontend` `analytics`
Create a multi-line chart showing weekly growth rates for Users, Organizations, Payments, and Trust Relationships over the last 12 weeks. Pull from `analytics_snapshots`.

**#71 — Add Stellar Horizon failover**
Labels: `advanced` `sprint` `indexer`
If the primary Horizon URL fails 3 consecutive times, automatically switch to the backup (`STELLAR_HORIZON_URL_BACKUP`). Log the failover and recover when the primary comes back. Add tests with mocked fetch errors.

**#72 — Build a funding stream timeline visualization**
Labels: `advanced` `sprint` `frontend`
Create a Gantt-style timeline component for funding streams showing start/end dates, milestones, and release events on a horizontal time axis.

**#73 — Add OpenAPI spec generation**
Labels: `advanced` `sprint` `backend` `docs`
Use `zod-to-openapi` or `express-openapi-validator` to auto-generate an OpenAPI 3.1 spec from the existing Zod schemas and route definitions. Serve it at `GET /api/openapi.json` and add Swagger UI at `/api/docs`.

**#74 — Implement compliance record verification workflow**
Labels: `advanced` `sprint` `backend`
Add `POST /api/compliance` to create a `ComplianceRecord`, `PUT /api/compliance/:id/verify` to mark it approved/rejected, and a BullMQ worker that checks expiry and emits `compliance.expired` events.

**#75 — Build E2E tests with Playwright**
Labels: `advanced` `sprint` `testing`
Set up Playwright in `apps/dashboard`. Write E2E tests for: Overview page renders stat cards, Explorer search finds a seeded address, Payments table paginates correctly, Trust graph renders nodes. Run in CI.
