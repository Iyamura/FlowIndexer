import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { validate, paginationSchema } from "../middleware/validate.js";
import { z } from "zod";

const querySchema = paginationSchema.extend({
  search: z.string().optional(),
  organizationId: z.string().optional(),
});

export function usersRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get("/", validate(querySchema), async (req, res) => {
    const { page, pageSize, search, organizationId } = req.query as any;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (search) {
      where.OR = [
        { stellarAddress: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          stellarAddress: true,
          displayName: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          organization: { select: { name: true, slug: true } },
          trustScores: { take: 1, orderBy: { computedAt: "desc" }, select: { score: true } },
          _count: { select: { trustsGiven: true, trustsReceived: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data, total, page, pageSize, hasMore: skip + pageSize < total });
  });

  router.get("/:address", async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { stellarAddress: req.params.address },
      include: {
        organization: true,
        trustScores: { take: 5, orderBy: { computedAt: "desc" } },
        _count: {
          select: {
            trustsGiven: true,
            trustsReceived: true,
            fundingStreams: true,
            receivedStreams: true,
          },
        },
      },
    });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    res.json({ success: true, data: user });
  });

  return router;
}
