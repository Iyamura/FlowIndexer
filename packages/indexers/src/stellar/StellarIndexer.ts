import { PrismaClient } from "@prisma/client";
import { Horizon, Networks } from "@stellar/stellar-sdk";
import { ASSETS, chunkArray } from "@flow-indexer/shared";
import { BaseIndexer, IndexerConfig } from "../base/BaseIndexer.js";

const TRACKED_ASSETS = [ASSETS.USDC, ASSETS.PYUSD];

export class StellarIndexer extends BaseIndexer {
  private readonly horizon: Horizon.Server;

  constructor(prisma: PrismaClient, config: Partial<IndexerConfig> = {}) {
    super(prisma, {
      name: "stellar-indexer",
      pollIntervalMs: Number(process.env.INDEXER_POLL_INTERVAL_MS ?? 5000),
      batchSize: Number(process.env.INDEXER_BATCH_SIZE ?? 100),
      ...config,
    });
    const horizonUrl =
      process.env.STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org";
    this.horizon = new Horizon.Server(horizonUrl, { allowHttp: horizonUrl.startsWith("http://") });
  }

  protected async tick(): Promise<void> {
    const { lastCursor } = await this.getState();
    await this.indexPayments(lastCursor ?? undefined);
  }

  private async indexPayments(cursor?: string): Promise<void> {
    const builder = this.horizon
      .payments()
      .limit(this.config.batchSize)
      .order("asc");

    if (cursor) builder.cursor(cursor);

    const { records } = await builder.call();
    if (records.length === 0) return;

    const lastRecord = records[records.length - 1];
    const batches = chunkArray(records, 20);

    for (const batch of batches) {
      await this.processPaymentBatch(batch);
    }

    await this.saveState(0, lastRecord.paging_token);
    this.logger.info({ count: records.length, cursor: lastRecord.paging_token }, "Indexed payments");
  }

  private async processPaymentBatch(records: Horizon.ServerApi.PaymentOperationRecord[]): Promise<void> {
    for (const record of records) {
      try {
        await this.upsertPayment(record);
      } catch (err) {
        this.logger.warn({ err, id: record.id }, "Failed to upsert payment");
      }
    }
  }

  private async upsertPayment(record: Horizon.ServerApi.PaymentOperationRecord): Promise<void> {
    if (record.type !== "payment" && record.type !== "path_payment_strict_send" && record.type !== "path_payment_strict_receive") return;

    const payment = record as Horizon.ServerApi.PaymentOperationRecord;
    const assetCode = payment.asset_type === "native" ? "XLM" : (payment as any).asset_code ?? "UNKNOWN";
    const assetIssuer = payment.asset_type === "native" ? undefined : (payment as any).asset_issuer;

    const txHash = record.transaction_hash;

    await this.prisma.$transaction(async (tx) => {
      const existingTx = await tx.transaction.findUnique({ where: { txHash } });
      if (!existingTx) {
        await tx.transaction.create({
          data: {
            txHash,
            ledger: 0,
            sourceAccount: record.source_account,
            fee: 100,
            operationCount: 1,
            successful: true,
            createdAt: new Date(record.created_at),
          },
        });
      }

      const txRecord = await tx.transaction.findUnique({ where: { txHash } });
      if (!txRecord) return;

      await tx.payment.upsert({
        where: { operationId: record.id },
        create: {
          txId: txRecord.id,
          txHash,
          operationId: record.id,
          type: "PAYMENT",
          fromAddress: payment.from,
          toAddress: payment.to,
          assetCode,
          assetIssuer,
          amount: (payment as any).amount ?? "0",
          createdAt: new Date(record.created_at),
        },
        update: {},
      });
    });
  }

  async indexAccount(address: string): Promise<void> {
    const account = await this.horizon.loadAccount(address);

    for (const balance of account.balances) {
      if (balance.asset_type === "native") continue;
      const b = balance as Horizon.HorizonApi.BalanceLine<"credit_alphanum4" | "credit_alphanum12">;

      await this.prisma.trustline.upsert({
        where: {
          account_assetCode_issuer: {
            account: address,
            assetCode: b.asset_code,
            issuer: b.asset_issuer,
          },
        },
        create: {
          account: address,
          assetCode: b.asset_code,
          issuer: b.asset_issuer,
          limit: b.limit,
          balance: b.balance,
        },
        update: {
          limit: b.limit,
          balance: b.balance,
          updatedAt: new Date(),
        },
      });
    }
  }

  async trackAssets(): Promise<void> {
    for (const asset of TRACKED_ASSETS) {
      if (!asset.issuer) continue;
      await this.prisma.asset.upsert({
        where: { code_issuer: { code: asset.code, issuer: asset.issuer } },
        create: {
          code: asset.code,
          issuer: asset.issuer,
          type: "credit_alphanum4",
          name: asset.name,
          isAnchored: true,
        },
        update: { name: asset.name, isAnchored: true },
      });
    }
  }
}
