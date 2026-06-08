// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface TimeRange {
  from: Date;
  to: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Stellar Types ────────────────────────────────────────────────────────────

export interface StellarPayment {
  id: string;
  txHash: string;
  operationId: string;
  type: "payment" | "path_payment" | "create_account" | "merge_account";
  from: string;
  to: string;
  assetCode: string;
  assetIssuer?: string;
  amount: string;
  memo?: string;
  createdAt: string;
}

export interface StellarTransaction {
  hash: string;
  ledger: number;
  sourceAccount: string;
  fee: number;
  operationCount: number;
  successful: boolean;
  memo?: string;
  createdAt: string;
}

export interface StellarAccount {
  id: string;
  sequence: string;
  balances: StellarBalance[];
  trustlines: StellarTrustline[];
}

export interface StellarBalance {
  assetCode: string;
  assetIssuer?: string;
  balance: string;
  limit?: string;
}

export interface StellarTrustline {
  account: string;
  assetCode: string;
  issuer: string;
  limit: string;
  balance: string;
}

// ─── Trust Types ──────────────────────────────────────────────────────────────

export type TrustType = "PERSONAL" | "PROFESSIONAL" | "ORGANIZATIONAL" | "DELEGATED";
export type TrustStatus = "ACTIVE" | "REVOKED" | "EXPIRED" | "PENDING";

export interface TrustRelationship {
  id: string;
  trustorId: string;
  trusteeId: string;
  trustType: TrustType;
  weight: number;
  status: TrustStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface TrustScore {
  userId: string;
  score: number;
  components: TrustScoreComponents;
  computedAt: string;
}

export interface TrustScoreComponents {
  networkScore: number;
  activityScore: number;
  ageScore: number;
  volumeScore: number;
  reputationScore: number;
}

export interface TrustGraphNode {
  id: string;
  address: string;
  displayName?: string;
  trustScore: number;
  type: "user" | "organization";
}

export interface TrustGraphEdge {
  source: string;
  target: string;
  weight: number;
  trustType: TrustType;
  status: TrustStatus;
}

export interface TrustGraph {
  nodes: TrustGraphNode[];
  edges: TrustGraphEdge[];
}

// ─── Funding Types ────────────────────────────────────────────────────────────

export type StreamStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
export type StreamType = "SALARY" | "GRANT" | "AID" | "MILESTONE" | "RECURRING";

export interface FundingStream {
  id: string;
  creatorId: string;
  recipientId: string;
  asset: string;
  totalAmount: string;
  releasedAmount: string;
  startTime: string;
  endTime?: string;
  status: StreamStatus;
  streamType: StreamType;
  createdAt: string;
}

export interface FundingAllocation {
  id: string;
  streamId: string;
  organizationId: string;
  amount: string;
  asset: string;
  milestone?: string;
  status: "PENDING" | "RELEASED" | "CANCELLED";
  releasedAt?: string;
}

// ─── Payroll Types ────────────────────────────────────────────────────────────

export type BatchStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface PayrollBatch {
  id: string;
  organizationId: string;
  batchRef: string;
  totalAmount: string;
  asset: string;
  recipientCount: number;
  status: BatchStatus;
  scheduledAt?: string;
  processedAt?: string;
  createdAt: string;
}

export interface Beneficiary {
  id: string;
  batchId: string;
  stellarAddress: string;
  amount: string;
  asset: string;
  country: string;
  status: "PENDING" | "PROCESSING" | "SETTLED" | "FAILED";
  txHash?: string;
  settledAt?: string;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface VolumeMetric {
  date: string;
  volume: string;
  txCount: number;
  assetCode?: string;
}

export interface TrustMetric {
  date: string;
  totalRelationships: number;
  activeRelationships: number;
  avgScore: number;
  newRelationships: number;
}

export interface EcosystemMetric {
  totalUsers: number;
  totalOrganizations: number;
  totalTransactions: number;
  totalVolume: string;
  totalTrustRelationships: number;
  activeFundingStreams: number;
  totalRecipients: number;
  countriesReached: number;
}

export interface CountryStat {
  country: string;
  volume: string;
  txCount: number;
  userCount: number;
}

// ─── WebSocket Event Types ────────────────────────────────────────────────────

export type WsEventType =
  | "payment.new"
  | "stream.created"
  | "stream.updated"
  | "stream.completed"
  | "trust.changed"
  | "payroll.processed"
  | "analytics.updated";

export interface WsEvent<T = unknown> {
  type: WsEventType;
  payload: T;
  timestamp: string;
}

// ─── Queue Job Types ──────────────────────────────────────────────────────────

export interface IndexLedgerJob {
  ledger: number;
  cursor?: string;
}

export interface ComputeTrustJob {
  userId: string;
  reason?: string;
}

export interface ProcessPayrollJob {
  batchId: string;
}

export interface AnalyticsSnapshotJob {
  snapshotType: string;
  period: string;
}
