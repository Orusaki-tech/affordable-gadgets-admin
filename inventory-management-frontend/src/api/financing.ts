import { getDefaultApiHeaders, getInventoryBaseUrl } from './config';

export type FinancingProvider = {
  id: number;
  name: string;
  slug?: string;
  logo?: string | null;
  logo_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type FinancingOffer = {
  id: number;
  provider: number;
  provider_name?: string;
  provider_slug?: string;
  provider_logo_url?: string | null;
  product: number;
  product_name?: string;
  deposit_amount: string;
  retail_amount: string;
  term_unit?: 'day' | 'week' | 'month' | null;
  term_count?: number | null;
  daily_payment: string | null;
  weekly_payment: string | null;
  monthly_payment: string | null;
  ram_gb?: number | null;
  rom_gb?: number | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type Paginated<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
};

function unwrapResults<T>(data: Paginated<T> | T[]): T[] {
  if (Array.isArray(data)) return data;
  return (data.results ?? []) as T[];
}

function getToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getInventoryBaseUrl();
  const token = getToken();
  const headers = new Headers({
    Accept: 'application/json',
    ...getDefaultApiHeaders(token),
    ...(init?.headers || {}),
  });

  // If we send a JSON string body, ensure the server sees it as JSON.
  // Without this, fetch() defaults to text/plain;charset=UTF-8 and DRF returns 415.
  if (init?.body != null && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    let body: any = null;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    const err = new Error(`Request failed (${res.status})`);
    (err as any).status = res.status;
    (err as any).body = body;
    throw err;
  }
  return res.json() as Promise<T>;
}

export const FinancingApi = {
  async listProviders(params?: { search?: string; ordering?: string }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.ordering) qs.set('ordering', params.ordering);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    const data = await requestJson<Paginated<FinancingProvider> | FinancingProvider[]>(
      `/financing-providers/${suffix}`
    );
    return unwrapResults<FinancingProvider>(data);
  },

  async createProvider(body: Partial<FinancingProvider> & { name: string; slug?: string; is_active?: boolean }) {
    return requestJson<FinancingProvider>('/financing-providers/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async updateProvider(id: number, body: Partial<FinancingProvider>) {
    return requestJson<FinancingProvider>(`/financing-providers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async deleteProvider(id: number) {
    const base = getInventoryBaseUrl();
    const token = getToken();
    const res = await fetch(`${base}/financing-providers/${id}/`, {
      method: 'DELETE',
      headers: getDefaultApiHeaders(token),
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Delete failed (${res.status})`);
    }
    return true;
  },

  async listOffers(params?: {
    search?: string;
    ordering?: string;
    provider?: number;
    product?: number;
    is_active?: boolean;
  }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.ordering) qs.set('ordering', params.ordering);
    if (typeof params?.provider === 'number') qs.set('provider', String(params.provider));
    if (typeof params?.product === 'number') qs.set('product', String(params.product));
    if (typeof params?.is_active === 'boolean') qs.set('is_active', params.is_active ? 'true' : 'false');
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return requestJson<Paginated<FinancingOffer> | FinancingOffer[]>(`/financing-offers/${suffix}`);
  },

  async createOffer(body: Omit<FinancingOffer, 'id' | 'provider_name' | 'provider_slug' | 'provider_logo_url' | 'product_name' | 'created_at' | 'updated_at'>) {
    return requestJson<FinancingOffer>('/financing-offers/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async updateOffer(id: number, body: Partial<FinancingOffer>) {
    return requestJson<FinancingOffer>(`/financing-offers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async deleteOffer(id: number) {
    const base = getInventoryBaseUrl();
    const token = getToken();
    const res = await fetch(`${base}/financing-offers/${id}/`, {
      method: 'DELETE',
      headers: getDefaultApiHeaders(token),
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Delete failed (${res.status})`);
    }
    return true;
  },
};

