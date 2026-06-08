import { PaginatedResult } from "./types.js";

export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return {
    data,
    total: items.length,
    page,
    pageSize,
    hasMore: start + pageSize < items.length,
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatAmount(amount: string | number, decimals = 7): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatUSD(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function isStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function retry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delay = 1000
): Promise<T> {
  return fn().catch((err) => {
    if (attempts <= 1) throw err;
    return sleep(delay).then(() => retry(fn, attempts - 1, delay * 2));
  });
}

export function buildDateRange(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from, to };
}
