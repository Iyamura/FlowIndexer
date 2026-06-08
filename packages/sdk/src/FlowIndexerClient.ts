import {
  PaginatedResult,
  EcosystemMetric,
  VolumeMetric,
  TrustMetric,
  CountryStat,
  TrustGraph,
  TrustScore,
  FundingStream,
  PayrollBatch,
} from "@flow-indexer/shared";

export interface FlowIndexerClientOptions {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

export class FlowIndexerClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeout: number;

  constructor(options: FlowIndexerClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "http://localhost:4000/api";
    this.apiKey = options.apiKey;
    this.timeout = options.timeout ?? 10_000;
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { "x-api-key": this.apiKey } : {}),
          ...options?.headers,
        },
      });

      if (!res.ok) {
        throw new Error(`FlowIndexer API error: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Unknown API error");
      return json.data as T;
    } finally {
      clearTimeout(timer);
    }
  }

  private buildQuery(params?: Record<string, unknown>): string {
    if (!params) return "";
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join("&");
    return qs ? `?${qs}` : "";
  }

  // ─── Stats & Analytics ─────────────────────────────────────────────────────

  async getEcosystemMetrics(): Promise<EcosystemMetric> {
    return this.fetch("/stats/ecosystem");
  }

  async getDailyVolume(days = 30): Promise<VolumeMetric[]> {
    return this.fetch(`/stats/volume/daily?days=${days}`);
  }

  async getMonthlyVolume(months = 12): Promise<VolumeMetric[]> {
    return this.fetch(`/stats/volume/monthly?months=${months}`);
  }

  async getCountryStats(): Promise<CountryStat[]> {
    return this.fetch("/stats/countries");
  }

  async getFundingMetrics(): Promise<{
    totalAllocated: string;
    totalReleased: string;
    activeStreams: number;
    completedStreams: number;
  }> {
    return this.fetch("/stats/funding");
  }

  // ─── Transactions ──────────────────────────────────────────────────────────

  async getTransactions(params?: ListParams & { address?: string; from?: string; to?: string }) {
    return this.fetch<PaginatedResult<any>>(`/transactions${this.buildQuery(params)}`);
  }

  async getTransaction(hash: string) {
    return this.fetch<any>(`/transactions/${hash}`);
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  async getPayments(params?: ListParams & { address?: string; assetCode?: string; country?: string }) {
    return this.fetch<PaginatedResult<any>>(`/payments${this.buildQuery(params)}`);
  }

  async getPayment(operationId: string) {
    return this.fetch<any>(`/payments/${operationId}`);
  }

  // ─── Trust ────────────────────────────────────────────────────────────────

  async getTrustRelationships(params?: ListParams & { userId?: string; status?: string }) {
    return this.fetch<PaginatedResult<any>>(`/trust${this.buildQuery(params)}`);
  }

  async getTrustGraph(userId?: string): Promise<TrustGraph> {
    return this.fetch(`/trust/graph${userId ? `?userId=${userId}` : ""}`);
  }

  async getTrustScores(userId: string): Promise<TrustScore[]> {
    return this.fetch(`/trust/scores/${userId}`);
  }

  // ─── Funding ──────────────────────────────────────────────────────────────

  async getFundingStreams(params?: ListParams & { status?: string }): Promise<PaginatedResult<FundingStream>> {
    return this.fetch(`/funding${this.buildQuery(params)}`);
  }

  async getFundingStream(id: string): Promise<FundingStream> {
    return this.fetch(`/funding/${id}`);
  }

  // ─── Organizations ────────────────────────────────────────────────────────

  async getOrganizations(params?: ListParams & { search?: string; verified?: boolean }) {
    return this.fetch<PaginatedResult<any>>(`/organizations${this.buildQuery(params)}`);
  }

  async getOrganization(slug: string) {
    return this.fetch<any>(`/organizations/${slug}`);
  }

  // ─── Users ────────────────────────────────────────────────────────────────

  async getUsers(params?: ListParams & { search?: string; organizationId?: string }) {
    return this.fetch<PaginatedResult<any>>(`/users${this.buildQuery(params)}`);
  }

  async getUser(stellarAddress: string) {
    return this.fetch<any>(`/users/${stellarAddress}`);
  }

  // ─── Analytics convenience ────────────────────────────────────────────────

  async getAnalytics() {
    const [ecosystem, dailyVolume, monthlyVolume, fundingMetrics] = await Promise.all([
      this.getEcosystemMetrics(),
      this.getDailyVolume(),
      this.getMonthlyVolume(),
      this.getFundingMetrics(),
    ]);
    return { ecosystem, dailyVolume, monthlyVolume, fundingMetrics };
  }
}
