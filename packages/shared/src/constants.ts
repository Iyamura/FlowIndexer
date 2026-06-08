export const STELLAR_NETWORKS = {
  testnet: {
    horizonUrl: "https://horizon-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
  },
  mainnet: {
    horizonUrl: "https://horizon.stellar.org",
    networkPassphrase: "Public Global Stellar Network ; September 2015",
  },
} as const;

export const ASSETS = {
  USDC: {
    code: "USDC",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    name: "USD Coin",
  },
  PYUSD: {
    code: "PYUSD",
    issuer: "GCZXBDNTMDLHGPFX7DFCWQ3YFJSVMBNQJOBMTZKSGGC23GRJZIQSKMN",
    name: "PayPal USD",
  },
  XLM: {
    code: "XLM",
    issuer: undefined,
    name: "Stellar Lumens",
  },
} as const;

export const QUEUE_NAMES = {
  STELLAR_INDEXER: "stellar-indexer",
  TRUST_INDEXER: "trust-indexer",
  REMIT_INDEXER: "remit-indexer",
  ANALYTICS: "analytics",
  NOTIFICATIONS: "notifications",
} as const;

export const CACHE_TTL = {
  STATS: 60,
  TRANSACTIONS: 30,
  TRUST_GRAPH: 120,
  ANALYTICS: 300,
  USER_PROFILE: 600,
} as const;

export const RATE_LIMITS = {
  PUBLIC: { windowMs: 60_000, max: 60 },
  AUTHENTICATED: { windowMs: 60_000, max: 300 },
  PREMIUM: { windowMs: 60_000, max: 1000 },
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
