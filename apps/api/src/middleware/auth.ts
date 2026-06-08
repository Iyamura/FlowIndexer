import { Request, Response, NextFunction } from "express";
import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function apiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const key = req.headers["x-api-key"] as string | undefined;

  // Public routes skip auth
  if (!key) {
    (req as any).isPublic = true;
    next();
    return;
  }

  const keyHash = hashKey(key);
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: { select: { id: true, stellarAddress: true } } },
  });

  if (!apiKey || !apiKey.isActive) {
    res.status(401).json({ success: false, error: "Invalid API key" });
    return;
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    res.status(401).json({ success: false, error: "API key expired" });
    return;
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  (req as any).apiKey = apiKey;
  (req as any).userId = apiKey.userId;
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!(req as any).userId) {
    res.status(401).json({ success: false, error: "Authentication required" });
    return;
  }
  next();
}
