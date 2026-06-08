import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AnalyticsEngine } from "@flow-indexer/analytics";

export function statsRouter(prisma: PrismaClient): Router {
  const router = Router();
  const analytics = new AnalyticsEngine(prisma);

  router.get("/", async (_req, res) => {
    try {
      const [ecosystem, dailyVolume, trustMetrics, countryStats, assetDist] =
        await Promise.all([
          analytics.getEcosystemMetrics(),
          analytics.getDailyVolume(30),
          analytics.getTrustMetrics(30),
          analytics.getCountryStats(),
          analytics.getAssetDistribution(),
        ]);
      res.json({
        success: true,
        data: { ecosystem, dailyVolume, trustMetrics, countryStats, assetDist },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  router.get("/ecosystem", async (_req, res) => {
    try {
      const data = await analytics.getEcosystemMetrics();
      res.json({ success: true, data });
    } catch {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  router.get("/volume/daily", async (req, res) => {
    const days = Math.min(Number(req.query.days ?? 30), 365);
    try {
      const data = await analytics.getDailyVolume(days);
      res.json({ success: true, data });
    } catch {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  router.get("/volume/monthly", async (req, res) => {
    const months = Math.min(Number(req.query.months ?? 12), 24);
    try {
      const data = await analytics.getMonthlyVolume(months);
      res.json({ success: true, data });
    } catch {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  router.get("/funding", async (_req, res) => {
    try {
      const data = await analytics.getFundingMetrics();
      res.json({ success: true, data });
    } catch {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  return router;
}
