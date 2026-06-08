import { PrismaClient } from "@prisma/client";
import { TrustScoreComponents } from "@flow-indexer/shared";
import { BaseIndexer } from "../base/BaseIndexer.js";

export class TrustFlowIndexer extends BaseIndexer {
  constructor(prisma: PrismaClient) {
    super(prisma, {
      name: "trustflow-indexer",
      pollIntervalMs: 10_000,
      batchSize: 50,
    });
  }

  protected async tick(): Promise<void> {
    await this.recomputeStaleScores();
    await this.detectGraphChanges();
  }

  async indexTrustRelationship(data: {
    trustorAddress: string;
    trusteeAddress: string;
    trustType: "PERSONAL" | "PROFESSIONAL" | "ORGANIZATIONAL" | "DELEGATED";
    weight?: number;
    expiresAt?: Date;
  }): Promise<void> {
    const [trustor, trustee] = await Promise.all([
      this.ensureUser(data.trustorAddress),
      this.ensureUser(data.trusteeAddress),
    ]);

    await this.prisma.trustRelationship.upsert({
      where: {
        trustorId_trusteeId_trustType: {
          trustorId: trustor.id,
          trusteeId: trustee.id,
          trustType: data.trustType,
        },
      },
      create: {
        trustorId: trustor.id,
        trusteeId: trustee.id,
        trustType: data.trustType,
        weight: data.weight ?? 1.0,
        status: "ACTIVE",
        expiresAt: data.expiresAt,
      },
      update: {
        weight: data.weight ?? 1.0,
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    });

    await this.computeTrustScore(trustee.id);
  }

  async computeTrustScore(userId: string): Promise<void> {
    const [inboundTrusts, outboundTrusts, user] = await Promise.all([
      this.prisma.trustRelationship.findMany({
        where: { trusteeId: userId, status: "ACTIVE" },
      }),
      this.prisma.trustRelationship.findMany({
        where: { trustorId: userId, status: "ACTIVE" },
      }),
      this.prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (!user) return;

    const networkScore = Math.min(100, inboundTrusts.length * 10);
    const activityScore = Math.min(100, outboundTrusts.length * 5);
    const ageScore = this.computeAgeScore(user.createdAt);
    const volumeScore = await this.computeVolumeScore(user.stellarAddress);
    const reputationScore = inboundTrusts.reduce((sum, t) => sum + t.weight, 0) /
      Math.max(1, inboundTrusts.length) * 100;

    const components: TrustScoreComponents = {
      networkScore,
      activityScore,
      ageScore,
      volumeScore,
      reputationScore,
    };

    const score =
      networkScore * 0.3 +
      activityScore * 0.2 +
      ageScore * 0.1 +
      volumeScore * 0.2 +
      reputationScore * 0.2;

    await this.prisma.trustScore.create({
      data: {
        userId,
        score: Math.min(100, score),
        components: components as any,
        algorithm: "v1",
      },
    });
  }

  private computeAgeScore(createdAt: Date): number {
    const ageMs = Date.now() - createdAt.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    return Math.min(100, ageDays / 3.65);
  }

  private async computeVolumeScore(address: string): Promise<number> {
    const result = await this.prisma.payment.aggregate({
      where: { fromAddress: address },
      _count: true,
    });
    return Math.min(100, result._count * 2);
  }

  private async recomputeStaleScores(): Promise<void> {
    const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const staleUsers = await this.prisma.user.findMany({
      where: {
        OR: [
          { trustScores: { none: {} } },
          { trustScores: { every: { computedAt: { lt: staleThreshold } } } },
        ],
      },
      take: this.config.batchSize,
      select: { id: true },
    });

    await Promise.all(staleUsers.map((u) => this.computeTrustScore(u.id)));
    if (staleUsers.length > 0) {
      this.logger.info({ count: staleUsers.length }, "Recomputed trust scores");
    }
  }

  private async detectGraphChanges(): Promise<void> {
    const expired = await this.prisma.trustRelationship.updateMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lte: new Date() },
      },
      data: { status: "EXPIRED" },
    });

    if (expired.count > 0) {
      this.logger.info({ count: expired.count }, "Marked expired trust relationships");
    }
  }

  private async ensureUser(address: string) {
    return this.prisma.user.upsert({
      where: { stellarAddress: address },
      create: { stellarAddress: address },
      update: {},
    });
  }
}
