import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { validate, paginationSchema } from "../middleware/validate.js";

const querySchema = paginationSchema.extend({
  address: z.string().optional(),
  assetCode: z.string().optional(),
  country: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export function paymentsRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get("/", validate(querySchema), async (req, res) => {
    const { page, pageSize, address, assetCode, country, from, to } = req.query as any;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (address) where.OR = [{ fromAddress: address }, { toAddress: address }];
    if (assetCode) where.assetCode = assetCode;
    if (country) where.country = country;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({ success: true, data, total, page, pageSize, hasMore: skip + pageSize < total });
  });

  router.get("/:operationId", async (req, res) => {
    const payment = await prisma.payment.findUnique({
      where: { operationId: req.params.operationId },
      include: { transaction: true },
    });
    if (!payment) {
      res.status(404).json({ success: false, error: "Payment not found" });
      return;
    }
    res.json({ success: true, data: payment });
  });

  return router;
}
