import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import pino from "pino";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { PrismaClient } from "@prisma/client";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./graphql/schema.js";
import { statsRouter } from "./routes/stats.js";
import { transactionsRouter } from "./routes/transactions.js";
import { paymentsRouter } from "./routes/payments.js";
import { trustRouter } from "./routes/trust.js";
import { fundingRouter } from "./routes/funding.js";
import { organizationsRouter } from "./routes/organizations.js";
import { usersRouter } from "./routes/users.js";
import { apiKeyMiddleware } from "./middleware/auth.js";
import { rateLimiter } from "./middleware/rateLimit.js";
import { setupWebSocket } from "./websocket/index.js";
import { startWorkers } from "./workers/index.js";

const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });
const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(pinoHttp({ logger }));

// Health
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// REST routes
const v1 = express.Router();
v1.use(rateLimiter);
v1.use(apiKeyMiddleware);
v1.use("/stats", statsRouter(prisma));
v1.use("/transactions", transactionsRouter(prisma));
v1.use("/payments", paymentsRouter(prisma));
v1.use("/trust", trustRouter(prisma));
v1.use("/funding", fundingRouter(prisma));
v1.use("/organizations", organizationsRouter(prisma));
v1.use("/users", usersRouter(prisma));
app.use("/api", v1);

// GraphQL
app.use(
  "/graphql",
  createHandler({
    schema,
    context: () => ({ prisma }),
  })
);

// WebSocket
setupWebSocket(wss, prisma);

const PORT = Number(process.env.API_PORT ?? 4000);

async function main() {
  await startWorkers();
  httpServer.listen(PORT, () => {
    logger.info({ port: PORT }, "FlowIndexer API started");
  });
}

main().catch((err) => {
  logger.error({ err }, "Fatal startup error");
  process.exit(1);
});
