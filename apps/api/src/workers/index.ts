import { Worker, Queue } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { QUEUE_NAMES } from "@flow-indexer/shared";
import { StellarIndexer, TrustFlowIndexer } from "@flow-indexer/indexers";
import { AnalyticsEngine } from "@flow-indexer/analytics";
import pino from "pino";

const logger = pino({ name: "workers" });
const prisma = new PrismaClient();

const redisConnection = {
  host: new URL(process.env.REDIS_URL ?? "redis://localhost:6379").hostname,
  port: Number(new URL(process.env.REDIS_URL ?? "redis://localhost:6379").port || 6379),
};

export function createQueue(name: string): Queue {
  return new Queue(name, { connection: redisConnection });
}

export async function startWorkers(): Promise<void> {
  const stellarIndexer = new StellarIndexer(prisma);
  const trustIndexer = new TrustFlowIndexer(prisma);
  const analytics = new AnalyticsEngine(prisma);

  new Worker(
    QUEUE_NAMES.STELLAR_INDEXER,
    async (job) => {
      logger.info({ jobId: job.id, name: job.name }, "Processing stellar job");
      if (job.name === "index-payments") {
        await stellarIndexer["indexPayments"]?.();
      }
    },
    { connection: redisConnection, concurrency: 2 }
  );

  new Worker(
    QUEUE_NAMES.TRUST_INDEXER,
    async (job) => {
      logger.info({ jobId: job.id, name: job.name }, "Processing trust job");
      if (job.name === "compute-score" && job.data.userId) {
        await trustIndexer.computeTrustScore(job.data.userId);
      }
    },
    { connection: redisConnection, concurrency: 5 }
  );

  new Worker(
    QUEUE_NAMES.ANALYTICS,
    async (job) => {
      logger.info({ jobId: job.id, name: job.name }, "Processing analytics job");
      if (job.name === "snapshot-daily") {
        await analytics.snapshotDaily();
      }
    },
    { connection: redisConnection, concurrency: 1 }
  );

  logger.info("All workers started");
}
