import { PrismaClient } from "@prisma/client";
import {
  EcosystemMetric,
  VolumeMetric,
  TrustMetric,
  CountryStat,
  buildDateRange,
} from "@flow-indexer/shared";

export class AnalyticsEngine {
  constructor(private readonly prisma: PrismaClient) {}

  async getEcosystemMetrics(): Promise<EcosystemMetric> {
    const [
      totalUsers,
      totalOrganizations,
      totalTransactions,
      volumeResult,
      totalTrustRelationships,
      activeFundingStreams,
      totalRecipients,
      countriesReached,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.organization.count(),
      this.prisma.transaction.count(),
      this.prisma.payment.aggregate({ _sum: { amount: true } }),
      this.prisma.trustRelationship.count({ where: { status: "ACTIVE" } }),
      this.prisma.fundingStream.count({ where: { status: "ACTIVE" } }),
      this.prisma.beneficiary.count({ where: { status: "SETTLED" } }),
      this.prisma.beneficiary.findMany({
        where: { status: "SETTLED" },
        distinct: ["country"],
        select: { country: true },
      }),
    ]);

    return {
      totalUsers,
      totalOrganizations,
      totalTransactions,
      totalVolume: volumeResult._sum.amount?.toString() ?? "0",
      totalTrustRelationships,
      activeFundingStreams,
      totalRecipients,
      countriesReached: countriesReached.length,
    };
  }

  async getDailyVolume(days = 30): Promise<VolumeMetric[]> {
    const { from } = buildDateRange(days);

    const results = await this.prisma.$queryRaw<
      Array<{ date: Date; volume: string; tx_count: bigint }>
    >`
      SELECT
        DATE_TRUNC('day', created_at) AS date,
        SUM(amount)::text AS volume,
        COUNT(*) AS tx_count
      FROM payments
      WHERE created_at >= ${from}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ASC
    `;

    return results.map((r) => ({
      date: r.date.toISOString().split("T")[0],
      volume: r.volume,
      txCount: Number(r.tx_count),
    }));
  }

  async getMonthlyVolume(months = 12): Promise<VolumeMetric[]> {
    const from = new Date();
    from.setMonth(from.getMonth() - months);

    const results = await this.prisma.$queryRaw<
      Array<{ date: Date; volume: string; tx_count: bigint }>
    >`
      SELECT
        DATE_TRUNC('month', created_at) AS date,
        SUM(amount)::text AS volume,
        COUNT(*) AS tx_count
      FROM payments
      WHERE created_at >= ${from}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY date ASC
    `;

    return results.map((r) => ({
      date: r.date.toISOString().slice(0, 7),
      volume: r.volume,
      txCount: Number(r.tx_count),
    }));
  }

  async getTrustMetrics(days = 30): Promise<TrustMetric[]> {
    const { from } = buildDateRange(days);

    const results = await this.prisma.$queryRaw<
      Array<{
        date: Date;
        new_relationships: bigint;
        total_active: bigint;
      }>
    >`
      SELECT
        DATE_TRUNC('day', created_at) AS date,
        COUNT(*) AS new_relationships,
        SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)) AS total_active
      FROM trust_relationships
      WHERE created_at >= ${from} AND status = 'ACTIVE'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ASC
    `;

    const latestScore = await this.prisma.trustScore.aggregate({
      _avg: { score: true },
    });

    return results.map((r) => ({
      date: r.date.toISOString().split("T")[0],
      totalRelationships: Number(r.total_active),
      activeRelationships: Number(r.total_active),
      avgScore: latestScore._avg.score ?? 0,
      newRelationships: Number(r.new_relationships),
    }));
  }

  async getCountryStats(): Promise<CountryStat[]> {
    const results = await this.prisma.beneficiary.groupBy({
      by: ["country"],
      where: { status: "SETTLED" },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: "desc" } },
      take: 20,
    });

    return results.map((r) => ({
      country: r.country,
      volume: r._sum.amount?.toString() ?? "0",
      txCount: r._count,
      userCount: 0,
    }));
  }

  async getAssetDistribution(): Promise<Array<{ assetCode: string; volume: string; txCount: number }>> {
    const results = await this.prisma.payment.groupBy({
      by: ["assetCode"],
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: "desc" } },
    });

    return results.map((r) => ({
      assetCode: r.assetCode,
      volume: r._sum.amount?.toString() ?? "0",
      txCount: r._count,
    }));
  }

  async getTopRecipients(limit = 10): Promise<Array<{ address: string; received: string; txCount: number }>> {
    return this.prisma.payment.groupBy({
      by: ["toAddress"],
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: "desc" } },
      take: limit,
    }).then((r) =>
      r.map((row) => ({
        address: row.toAddress,
        received: row._sum.amount?.toString() ?? "0",
        txCount: row._count,
      }))
    );
  }

  async getFundingMetrics(): Promise<{
    totalAllocated: string;
    totalReleased: string;
    activeStreams: number;
    completedStreams: number;
    avgStreamSize: string;
  }> {
    const [allocated, streams] = await Promise.all([
      this.prisma.fundingStream.aggregate({
        _sum: { totalAmount: true, releasedAmount: true },
        _avg: { totalAmount: true },
      }),
      this.prisma.fundingStream.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    const active = streams.find((s) => s.status === "ACTIVE")?._count ?? 0;
    const completed = streams.find((s) => s.status === "COMPLETED")?._count ?? 0;

    return {
      totalAllocated: allocated._sum.totalAmount?.toString() ?? "0",
      totalReleased: allocated._sum.releasedAmount?.toString() ?? "0",
      activeStreams: active,
      completedStreams: completed,
      avgStreamSize: allocated._avg.totalAmount?.toString() ?? "0",
    };
  }

  async snapshotDaily(): Promise<void> {
    const [ecosystem, dailyVolume, trustMetrics] = await Promise.all([
      this.getEcosystemMetrics(),
      this.getDailyVolume(1),
      this.getTrustMetrics(1),
    ]);

    const today = new Date().toISOString().split("T")[0];

    await this.prisma.analyticsSnapshot.createMany({
      data: [
        {
          snapshotType: "DAILY_VOLUME",
          period: today,
          data: dailyVolume as any,
        },
        {
          snapshotType: "TRUST_METRICS",
          period: today,
          data: trustMetrics as any,
        },
        {
          snapshotType: "ECOSYSTEM_GROWTH",
          period: today,
          data: ecosystem as any,
        },
      ],
      skipDuplicates: false,
    });
  }
}
