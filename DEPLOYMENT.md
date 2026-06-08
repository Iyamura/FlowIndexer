# Deployment Guide

## Docker Compose (recommended for self-hosting)

```bash
git clone https://github.com/opentrust/flow-indexer.git
cd flow-indexer

cp .env.example .env
# Edit .env with your production values

docker-compose up -d
docker-compose exec api pnpm db:migrate
docker-compose exec api pnpm db:seed  # optional
```

Access dashboard at http://your-server:3000, API at http://your-server:4000.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `STELLAR_NETWORK` | Yes | `testnet` or `mainnet` |
| `STELLAR_HORIZON_URL` | No | Custom Horizon endpoint |
| `API_PORT` | No | API port (default: 4000) |
| `API_SECRET_KEY` | Yes | JWT/session signing key |
| `JWT_SECRET` | Yes | JWT secret |
| `NEXT_PUBLIC_API_URL` | Yes | API URL for dashboard |
| `NEXT_PUBLIC_WS_URL` | Yes | WebSocket URL for dashboard |
| `RATE_LIMIT_WINDOW_MS` | No | Rate window in ms |
| `RATE_LIMIT_MAX` | No | Max requests per window |
| `INDEXER_POLL_INTERVAL_MS` | No | Indexer poll interval (default: 5000) |
| `INDEXER_BATCH_SIZE` | No | Indexer batch size (default: 100) |
| `LOG_LEVEL` | No | `info`, `debug`, `warn`, `error` |
| `SENTRY_DSN` | No | Sentry error tracking |

## Production Checklist

- [ ] Set strong `API_SECRET_KEY` and `JWT_SECRET`
- [ ] Use `STELLAR_NETWORK=mainnet` and Horizon pubnet URL
- [ ] Enable SSL/TLS on your reverse proxy (nginx/caddy)
- [ ] Configure Postgres with connection pooling (PgBouncer)
- [ ] Set Redis `maxmemory-policy allkeys-lru`
- [ ] Configure Sentry DSN for error monitoring
- [ ] Set up DB backups (pg_dump or managed DB snapshots)
- [ ] Review rate limit values for your traffic

## Scaling

The API is stateless and horizontally scalable behind a load balancer. Redis handles BullMQ queue coordination across instances.

For high-throughput deployments:
1. Deploy API behind nginx/caddy with multiple replicas
2. Use a managed Postgres (RDS, Neon, Supabase)
3. Use a managed Redis (Upstash, ElastiCache)
4. Separate indexer workers into dedicated containers

## Database Migrations

```bash
# Check pending migrations
pnpm prisma migrate status

# Apply migrations (production)
pnpm prisma migrate deploy

# Never use migrate dev in production
```

## Health Checks

```
GET /health → { "status": "ok", "timestamp": "..." }
```

Use this endpoint for load balancer and container orchestration health checks.
