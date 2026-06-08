import { PrismaClient } from "@prisma/client";
import { sleep, retry } from "@flow-indexer/shared";
import pino from "pino";

export interface IndexerConfig {
  name: string;
  pollIntervalMs: number;
  batchSize: number;
}

export abstract class BaseIndexer {
  protected readonly prisma: PrismaClient;
  protected readonly logger: ReturnType<typeof pino>;
  protected readonly config: IndexerConfig;
  private running = false;

  constructor(prisma: PrismaClient, config: IndexerConfig) {
    this.prisma = prisma;
    this.config = config;
    this.logger = pino({ name: config.name, level: process.env.LOG_LEVEL ?? "info" });
  }

  async start(): Promise<void> {
    this.running = true;
    this.logger.info({ config: this.config }, "Indexer starting");
    await this.onStart();

    while (this.running) {
      try {
        await retry(() => this.tick(), 3, 2000);
      } catch (err) {
        this.logger.error({ err }, "Tick failed after retries");
      }
      await sleep(this.config.pollIntervalMs);
    }
  }

  stop(): void {
    this.running = false;
    this.logger.info("Indexer stopping");
  }

  protected abstract tick(): Promise<void>;
  protected async onStart(): Promise<void> {}

  protected async getState(): Promise<{ lastLedger: number; lastCursor: string | null }> {
    const state = await this.prisma.indexerState.findUnique({
      where: { indexerName: this.config.name },
    });
    return { lastLedger: state?.lastLedger ?? 0, lastCursor: state?.lastCursor ?? null };
  }

  protected async saveState(lastLedger: number, lastCursor?: string): Promise<void> {
    await this.prisma.indexerState.upsert({
      where: { indexerName: this.config.name },
      create: { indexerName: this.config.name, lastLedger, lastCursor },
      update: { lastLedger, lastCursor, updatedAt: new Date() },
    });
  }
}
