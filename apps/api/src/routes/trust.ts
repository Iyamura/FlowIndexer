import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { validate, paginationSchema } from "../middleware/validate.js";
import { TrustFlowIndexer } from "@flow-indexer/indexers";

const querySchema = paginationSchema.extend({
  userId: z.string().optional(),
  status: z.enum(["ACTIVE", "REVOKED", "EXPIRED", "PENDING"]).optional(),
});

export function trustRouter(prisma: PrismaClient): Router {
  const router = Router();
  const trustIndexer = new TrustFlowIndexer(prisma);

  router.get("/", validate(querySchema), async (req, res) => {
    const { page, pageSize, userId, status } = req.query as any;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (userId) where.OR = [{ trustorId: userId }, { trusteeId: userId }];
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.trustRelationship.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          trustor: { select: { id: true, stellarAddress: true, displayName: true } },
          trustee: { select: { id: true, stellarAddress: true, displayName: true } },
        },
      }),
      prisma.trustRelationship.count({ where }),
    ]);

    res.json({ success: true, data, total, page, pageSize, hasMore: skip + pageSize < total });
  });

  router.get("/graph", async (req, res) => {
    const { userId } = req.query as any;
    const depth = Math.min(Number(req.query.depth ?? 2), 3);

    const relationships = await prisma.trustRelationship.findMany({
      where: userId
        ? { OR: [{ trustorId: userId }, { trusteeId: userId }], status: "ACTIVE" }
        : { status: "ACTIVE" },
      take: 200,
      include: {
        trustor: { select: { id: true, stellarAddress: true, displayName: true } },
        trustee: { select: { id: true, stellarAddress: true, displayName: true } },
      },
    });

    const nodeMap = new Map<string, any>();
    const edges = relationships.map((r) => {
      nodeMap.set(r.trustor.id, {
        id: r.trustor.id,
        address: r.trustor.stellarAddress,
        displayName: r.trustor.displayName,
        type: "user",
      });
      nodeMap.set(r.trustee.id, {
        id: r.trustee.id,
        address: r.trustee.stellarAddress,
        displayName: r.trustee.displayName,
        type: "user",
      });
      return {
        source: r.trustorId,
        target: r.trusteeId,
        weight: r.weight,
        trustType: r.trustType,
        status: r.status,
      };
    });

    res.json({ success: true, data: { nodes: Array.from(nodeMap.values()), edges } });
  });

  router.get("/scores/:userId", async (req, res) => {
    const scores = await prisma.trustScore.findMany({
      where: { userId: req.params.userId },
      orderBy: { computedAt: "desc" },
      take: 10,
    });
    res.json({ success: true, data: scores });
  });

  router.post("/compute/:userId", async (req, res) => {
    try {
      await trustIndexer.computeTrustScore(req.params.userId);
      res.json({ success: true, message: "Trust score computed" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
