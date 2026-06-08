import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { validate, paginationSchema } from "../middleware/validate.js";

const querySchema = paginationSchema.extend({
  address: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export function transactionsRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get("/", validate(querySchema), async (req, res) => {
    const { page, pageSize, address, from, to } = req.query as any;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (address) where.sourceAccount = address;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: { payments: { take: 5 } },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({ success: true, data, total, page, pageSize, hasMore: skip + pageSize < total });
  });

  router.get("/:hash", async (req, res) => {
    const tx = await prisma.transaction.findUnique({
      where: { txHash: req.params.hash },
      include: { payments: true },
    });
    if (!tx) {
      res.status(404).json({ success: false, error: "Transaction not found" });
      return;
    }
    res.json({ success: true, data: tx });
  });

  return router;
}
