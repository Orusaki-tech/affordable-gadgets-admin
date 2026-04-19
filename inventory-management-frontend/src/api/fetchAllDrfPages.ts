import { OpenAPI } from './core/OpenAPI';
import { getDefaultApiHeaders } from './config';

export type DrfPaginated<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
};

function resolveDrfNextUrl(nextUrl: string): string {
  if (nextUrl.startsWith('http://') || nextUrl.startsWith('https://')) {
    return nextUrl;
  }
  return new URL(nextUrl, `${OpenAPI.BASE}/`).toString();
}

/**
 * Follow DRF `next` links until all rows are loaded.
 * Use when the UI filters or searches client-side so results are not limited to page 1.
 */
export async function fetchAllDrfPages<T>(path: string): Promise<T[]> {
  const collected: T[] = [];
  const initial =
    path.startsWith('http://') || path.startsWith('https://')
      ? path
      : `${OpenAPI.BASE}${path.startsWith('/') ? path : `/${path}`}`;

  let url: string | null = initial;
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers = getDefaultApiHeaders(token, { 'Content-Type': 'application/json' });

  while (url) {
    const response: Response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    const body: unknown = await response.json();
    if (Array.isArray(body)) {
      collected.push(...body);
      break;
    }
    const paged = body as DrfPaginated<T>;
    collected.push(...(paged.results || []));
    url = paged.next ? resolveDrfNextUrl(paged.next) : null;
  }

  return collected;
}
