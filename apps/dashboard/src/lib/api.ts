const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(process.env.NEXT_PUBLIC_API_KEY
        ? { "x-api-key": process.env.NEXT_PUBLIC_API_KEY }
        : {}),
      ...options?.headers,
    },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "Unknown error");
  return json.data;
}

export const api = {
  stats: {
    ecosystem: () => fetchApi<any>("/stats/ecosystem"),
    dailyVolume: (days = 30) => fetchApi<any[]>(`/stats/volume/daily?days=${days}`),
    monthlyVolume: (months = 12) => fetchApi<any[]>(`/stats/volume/monthly?months=${months}`),
    funding: () => fetchApi<any>("/stats/funding"),
  },
  transactions: {
    list: (params?: Record<string, string>) =>
      fetchApi<any>(`/transactions?${new URLSearchParams(params)}`),
    get: (hash: string) => fetchApi<any>(`/transactions/${hash}`),
  },
  payments: {
    list: (params?: Record<string, string>) =>
      fetchApi<any>(`/payments?${new URLSearchParams(params)}`),
    get: (id: string) => fetchApi<any>(`/payments/${id}`),
  },
  trust: {
    list: (params?: Record<string, string>) =>
      fetchApi<any>(`/trust?${new URLSearchParams(params)}`),
    graph: (userId?: string) =>
      fetchApi<any>(`/trust/graph${userId ? `?userId=${userId}` : ""}`),
    scores: (userId: string) => fetchApi<any[]>(`/trust/scores/${userId}`),
  },
  funding: {
    list: (params?: Record<string, string>) =>
      fetchApi<any>(`/funding?${new URLSearchParams(params)}`),
    get: (id: string) => fetchApi<any>(`/funding/${id}`),
  },
  organizations: {
    list: (params?: Record<string, string>) =>
      fetchApi<any>(`/organizations?${new URLSearchParams(params)}`),
    get: (slug: string) => fetchApi<any>(`/organizations/${slug}`),
  },
  users: {
    list: (params?: Record<string, string>) =>
      fetchApi<any>(`/users?${new URLSearchParams(params)}`),
    get: (address: string) => fetchApi<any>(`/users/${address}`),
  },
};
