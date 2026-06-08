import { PrismaClient } from "@prisma/client";
import { BaseIndexer } from "../base/BaseIndexer.js";

export class RemitBridgeIndexer extends BaseIndexer {
  constructor(prisma: PrismaClient) {
    super(prisma, {
      name: "remitbridge-indexer",
      pollIntervalMs: 15_000,
      batchSize: 50,
    });
  }

  protected async tick(): Promise<void> {
    await this.processPendingBatches();
    await this.updateSettlementStatuses();
    await this.syncBeneficiaryStatuses();
  }

  async createPayrollBatch(data: {
    organizationSlug: string;
    batchRef: string;
    totalAmount: string;
    asset: string;
    recipients: Array<{
      stellarAddress: string;
      amount: string;
      country: string;
      userId?: string;
    }>;
    scheduledAt?: Date;
  }): Promise<string> {
    const org = await this.prisma.organization.findUnique({
      where: { slug: data.organizationSlug },
    });
    if (!org) throw new Error(`Organization not found: ${data.organizationSlug}`);

    const batch = await this.prisma.payrollBatch.create({
      data: {
        organizationId: org.id,
        batchRef: data.batchRef,
        totalAmount: data.totalAmount,
        asset: data.asset,
        recipientCount: data.recipients.length,
        status: "PENDING",
        scheduledAt: data.scheduledAt,
        beneficiaries: {
          create: data.recipients.map((r) => ({
            stellarAddress: r.stellarAddress,
            amount: r.amount,
            asset: data.asset,
            country: r.country,
            userId: r.userId,
            status: "PENDING" as const,
          })),
        },
      },
    });

    this.logger.info({ batchId: batch.id, batchRef: batch.batchRef }, "Payroll batch created");
    return batch.id;
  }

  async recordSettlement(data: {
    batchId: string;
    anchorId: string;
    txHash: string;
    amount: string;
    asset: string;
    targetCurrency?: string;
    fxRate?: number;
    fee?: string;
  }): Promise<void> {
    await this.prisma.settlement.create({
      data: {
        batchId: data.batchId,
        anchorId: data.anchorId,
        txHash: data.txHash,
        amount: data.amount,
        asset: data.asset,
        targetCurrency: data.targetCurrency,
        fxRate: data.fxRate,
        fee: data.fee,
        status: "PENDING",
      },
    });
  }

  async updateBeneficiaryStatus(
    beneficiaryId: string,
    status: "PROCESSING" | "SETTLED" | "FAILED",
    txHash?: string
  ): Promise<void> {
    await this.prisma.beneficiary.update({
      where: { id: beneficiaryId },
      data: {
        status,
        txHash,
        settledAt: status === "SETTLED" ? new Date() : undefined,
      },
    });
  }

  async getCountryMetrics(): Promise<Array<{ country: string; volume: number; count: number }>> {
    const result = await this.prisma.beneficiary.groupBy({
      by: ["country"],
      where: { status: "SETTLED" },
      _sum: { amount: true },
      _count: true,
    });

    return result.map((r) => ({
      country: r.country,
      volume: Number(r._sum.amount ?? 0),
      count: r._count,
    }));
  }

  private async processPendingBatches(): Promise<void> {
    const pending = await this.prisma.payrollBatch.findMany({
      where: {
        status: "PENDING",
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
      },
      take: this.config.batchSize,
    });

    for (const batch of pending) {
      await this.prisma.payrollBatch.update({
        where: { id: batch.id },
        data: { status: "PROCESSING" },
      });
      this.logger.info({ batchId: batch.id }, "Processing payroll batch");
    }
  }

  private async updateSettlementStatuses(): Promise<void> {
    const pendingSettlements = await this.prisma.settlement.findMany({
      where: { status: "PROCESSING" },
      take: 20,
    });

    for (const s of pendingSettlements) {
      // In production this would check the Stellar ledger for tx confirmation
      await this.prisma.settlement.update({
        where: { id: s.id },
        data: { status: "SETTLED", settledAt: new Date() },
      });
    }
  }

  private async syncBeneficiaryStatuses(): Promise<void> {
    const result = await this.prisma.$queryRaw<{ batchId: string }[]>`
      SELECT DISTINCT pb.id as "batchId"
      FROM payroll_batches pb
      WHERE pb.status = 'PROCESSING'
        AND NOT EXISTS (
          SELECT 1 FROM beneficiaries b
          WHERE b.batch_id = pb.id AND b.status IN ('PENDING', 'PROCESSING')
        )
    `;

    for (const { batchId } of result) {
      await this.prisma.payrollBatch.update({
        where: { id: batchId },
        data: { status: "COMPLETED", processedAt: new Date() },
      });
    }
  }
}
