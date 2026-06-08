import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { validate, paginationSchema } from "../middleware/validate.js";

const querySchema = paginationSchema.extend({
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
  creatorId: z.string().optional(),
  recipientId: z.string().optional(),
});

export function fundingRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get("/", validate(querySchema), async (req, res) => {
    const { page, pageSize, status, creatorId, recipientId } = req.query as any;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status) where.status = status;
    if (creatorId) where.creatorId = creatorId;
    if (recipientId) where.recipientId = recipientId;

    const [data, total] = await Promise.all([
      prisma.fundingStream.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          creator: { select: { id: true, stellarAddress: true, displayName: true } },
          recipient: { select: { id: true, stellarAddress: true, displayName: true } },
          allocations: true,
        },
      }),
      prisma.fundingStream.count({ where }),
    ]);

    res.json({ success: true, data, total, page, pageSize, hasMore: skip + pageSize < total });
  });

  router.get("/:id", async (req, res) => {
    const stream = await prisma.fundingStream.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { id: true, stellarAddress: true, displayName: true } },
        recipient: { select: { id: true, stellarAddress: true, displayName: true } },
        allocations: { include: { organization: { select: { name: true, slug: true } } } },
      },
    });
    if (!stream) {
      res.status(404).json({ success: false, error: "Funding stream not found" });
      return;
    }
    res.json({ success: true, data: stream });
  });

  router.get("/allocations", async (req, res) => {
    const { page = 1, pageSize = 20 } = req.query as any;
    const skip = (Number(page) - 1) * Number(pageSize);

    const [data, total] = await Promise.all([
      prisma.fundingAllocation.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(pageSize),
        include: {
          stream: { select: { id: true, asset: true, totalAmount: true } },
          organization: { select: { name: true, slug: true } },
        },
      }),
      prisma.fundingAllocation.count(),
    ]);

    res.json({ success: true, data, total, page: Number(page), pageSize: Number(pageSize) });
  });

  return router;
}
