import rateLimit from "express-rate-limit";
import { RATE_LIMITS } from "@flow-indexer/shared";

export const rateLimiter = rateLimit({
  windowMs: RATE_LIMITS.PUBLIC.windowMs,
  max: (req) => {
    if ((req as any).userId) return RATE_LIMITS.AUTHENTICATED.max;
    return RATE_LIMITS.PUBLIC.max;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests" },
  skip: (req) => req.path === "/health",
});
