import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { validate, paginationSchema } from "../middleware/validate.js";
import { z } from "zod";

const querySchema = paginationSchema.extend({
  verified: z.coerce.boolean().optional(),
  country: z.string().optional(),
  search: z.string().optional(),
});

export function organizationsRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get("/", validate(querySchema), async (req, res) => {
    const { page, pageSize, verified, country, search } = req.query as any;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (verified !== undefined) where.isVerified = verified;
    if (country) where.country = country;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          _count: { select: { users: true, payrollBatches: true } },
        },
      }),
      prisma.organization.count({ where }),
    ]);

    res.json({ success: true, data, total, page, pageSize, hasMore: skip + pageSize < total });
  });

  router.get("/:slug", async (req, res) => {
    const org = await prisma.organization.findUnique({
      where: { slug: req.params.slug },
      include: {
        _count: { select: { users: true, payrollBatches: true, fundingAllocations: true } },
        payrollBatches: { take: 5, orderBy: { createdAt: "desc" } },
      },
    });
    if (!org) {
      res.status(404).json({ success: false, error: "Organization not found" });
      return;
    }
    res.json({ success: true, data: org });
  });

  return router;
}
