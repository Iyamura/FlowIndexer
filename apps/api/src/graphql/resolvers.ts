import { PrismaClient } from "@prisma/client";
import { AnalyticsEngine } from "@flow-indexer/analytics";

export const resolvers = {
  Query: {
    stats: async (_: any, __: any, { prisma }: { prisma: PrismaClient }) => {
      return new AnalyticsEngine(prisma).getEcosystemMetrics();
    },

    transactions: async (_: any, args: any, { prisma }: { prisma: PrismaClient }) => {
      const { page = 1, pageSize = 20, address } = args;
      const skip = (page - 1) * pageSize;
      const where: any = {};
      if (address) where.sourceAccount = address;
      const [data, total] = await Promise.all([
        prisma.transaction.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" }, include: { payments: true } }),
        prisma.transaction.count({ where }),
      ]);
      return { data, total, page, pageSize, hasMore: skip + pageSize < total };
    },

    transaction: async (_: any, { hash }: { hash: string }, { prisma }: { prisma: PrismaClient }) => {
      return prisma.transaction.findUnique({ where: { txHash: hash }, include: { payments: true } });
    },

    payments: async (_: any, args: any, { prisma }: { prisma: PrismaClient }) => {
      const { page = 1, pageSize = 20, address, assetCode, country } = args;
      const skip = (page - 1) * pageSize;
      const where: any = {};
      if (address) where.OR = [{ fromAddress: address }, { toAddress: address }];
      if (assetCode) where.assetCode = assetCode;
      if (country) where.country = country;
      const [data, total] = await Promise.all([
        prisma.payment.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" } }),
        prisma.payment.count({ where }),
      ]);
      return { data, total, page, pageSize, hasMore: skip + pageSize < total };
    },

    payment: async (_: any, { operationId }: { operationId: string }, { prisma }: { prisma: PrismaClient }) => {
      return prisma.payment.findUnique({ where: { operationId } });
    },

    trustRelationships: async (_: any, args: any, { prisma }: { prisma: PrismaClient }) => {
      const { page = 1, pageSize = 20, userId, status } = args;
      const skip = (page - 1) * pageSize;
      const where: any = {};
      if (userId) where.OR = [{ trustorId: userId }, { trusteeId: userId }];
      if (status) where.status = status;
      const [data, total] = await Promise.all([
        prisma.trustRelationship.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" }, include: { trustor: true, trustee: true } }),
        prisma.trustRelationship.count({ where }),
      ]);
      return { data, total, page, pageSize, hasMore: skip + pageSize < total };
    },

    trustGraph: async (_: any, { userId }: { userId?: string }, { prisma }: { prisma: PrismaClient }) => {
      const where: any = { status: "ACTIVE" };
      if (userId) where.OR = [{ trustorId: userId }, { trusteeId: userId }];
      const rels = await prisma.trustRelationship.findMany({ where, take: 200, include: { trustor: true, trustee: true } });
      const nodeMap = new Map<string, any>();
      const edges = rels.map((r) => {
        nodeMap.set(r.trustor.id, { id: r.trustor.id, address: r.trustor.stellarAddress, displayName: r.trustor.displayName, type: "user" });
        nodeMap.set(r.trustee.id, { id: r.trustee.id, address: r.trustee.stellarAddress, displayName: r.trustee.displayName, type: "user" });
        return { source: r.trustorId, target: r.trusteeId, weight: r.weight, trustType: r.trustType, status: r.status };
      });
      return { nodes: Array.from(nodeMap.values()), edges };
    },

    trustScore: async (_: any, { userId }: { userId: string }, { prisma }: { prisma: PrismaClient }) => {
      return prisma.trustScore.findFirst({ where: { userId }, orderBy: { computedAt: "desc" } });
    },

    fundingStreams: async (_: any, args: any, { prisma }: { prisma: PrismaClient }) => {
      const { page = 1, pageSize = 20, status } = args;
      const skip = (page - 1) * pageSize;
      const where: any = {};
      if (status) where.status = status;
      const [data, total] = await Promise.all([
        prisma.fundingStream.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" }, include: { creator: true, recipient: true } }),
        prisma.fundingStream.count({ where }),
      ]);
      return { data, total, page, pageSize, hasMore: skip + pageSize < total };
    },

    fundingStream: async (_: any, { id }: { id: string }, { prisma }: { prisma: PrismaClient }) => {
      return prisma.fundingStream.findUnique({ where: { id }, include: { creator: true, recipient: true, allocations: true } });
    },

    organizations: async (_: any, args: any, { prisma }: { prisma: PrismaClient }) => {
      const { page = 1, pageSize = 20, search } = args;
      const skip = (page - 1) * pageSize;
      const where: any = {};
      if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }, { slug: { contains: search, mode: "insensitive" } }];
      const [data, total] = await Promise.all([
        prisma.organization.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" } }),
        prisma.organization.count({ where }),
      ]);
      return { data, total, page, pageSize, hasMore: skip + pageSize < total };
    },

    organization: async (_: any, { slug }: { slug: string }, { prisma }: { prisma: PrismaClient }) => {
      return prisma.organization.findUnique({ where: { slug } });
    },

    users: async (_: any, args: any, { prisma }: { prisma: PrismaClient }) => {
      const { page = 1, pageSize = 20, search } = args;
      const skip = (page - 1) * pageSize;
      const where: any = {};
      if (search) where.OR = [{ stellarAddress: { contains: search } }, { displayName: { contains: search, mode: "insensitive" } }];
      const [data, total] = await Promise.all([
        prisma.user.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" }, include: { organization: true } }),
        prisma.user.count({ where }),
      ]);
      return { data, total, page, pageSize, hasMore: skip + pageSize < total };
    },

    user: async (_: any, { address }: { address: string }, { prisma }: { prisma: PrismaClient }) => {
      return prisma.user.findUnique({ where: { stellarAddress: address }, include: { organization: true } });
    },

    dailyVolume: async (_: any, { days = 30 }: { days?: number }, { prisma }: { prisma: PrismaClient }) => {
      return new AnalyticsEngine(prisma).getDailyVolume(days);
    },

    monthlyVolume: async (_: any, { months = 12 }: { months?: number }, { prisma }: { prisma: PrismaClient }) => {
      return new AnalyticsEngine(prisma).getMonthlyVolume(months);
    },

    countryStats: async (_: any, __: any, { prisma }: { prisma: PrismaClient }) => {
      return new AnalyticsEngine(prisma).getCountryStats();
    },

    assetDistribution: async (_: any, __: any, { prisma }: { prisma: PrismaClient }) => {
      return new AnalyticsEngine(prisma).getAssetDistribution();
    },
  },
};
