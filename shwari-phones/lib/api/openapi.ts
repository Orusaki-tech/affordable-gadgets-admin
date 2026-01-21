import { OpenAPI } from '@shwari/api-client';
import { brandConfig } from '@/lib/config/brand';

const normalizedBaseUrl = brandConfig.apiBaseUrl.replace(/\/+$/, '');

export const apiBaseUrl = normalizedBaseUrl;
export const inventoryBaseUrl = `${normalizedBaseUrl}/api/inventory`;

OpenAPI.BASE = normalizedBaseUrl;
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.CREDENTIALS = 'include';
OpenAPI.HEADERS = async () => {
  const headers: Record<string, string> = {
    'X-Brand-Code': brandConfig.code,
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
  }

  return headers;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};
