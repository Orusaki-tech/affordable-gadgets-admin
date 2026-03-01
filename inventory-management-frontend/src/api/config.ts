import { OpenAPI } from './core/OpenAPI';

// Configure base URL from environment variable or auto-detect from current hostname
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (process.env.REACT_APP_API_BASE_URL) {
    console.log(`🔧 Using API URL from environment: ${process.env.REACT_APP_API_BASE_URL}`);
    console.log(`🔍 Environment check - NODE_ENV: ${process.env.NODE_ENV}, hostname: ${typeof window !== 'undefined' ? window.location.hostname : 'N/A'}`);
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Auto-detect based on current hostname (only for local development)
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // Only auto-detect for local network IPs (not production domains)
    // Production: Vercel, Netlify, ngrok, GCP (Cloud Run), etc. Set REACT_APP_API_BASE_URL to backend (e.g. ngrok or GCP URL).
    const isProductionDomain = hostname.includes('.vercel.app') ||
                                hostname.includes('.netlify.app') ||
                                hostname.includes('.ngrok-free.app') ||
                                hostname.includes('.ngrok.io') ||
                                hostname.includes('.run.app') ||
                                hostname.includes('.cloud.run') ||
                                hostname.includes('.herokuapp.com');
    
    if (!isProductionDomain && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const apiUrl = `http://${hostname}:8000/api/inventory`;
      console.log(`🌐 Auto-detected API URL: ${apiUrl} (from hostname: ${hostname})`);
      return apiUrl;
    }
    
    // Production domain: never use localhost. Use same origin (e.g. if /api is proxied) or require env.
    if (isProductionDomain && typeof window !== 'undefined') {
      console.warn('⚠️ REACT_APP_API_BASE_URL not set in production. Using same-origin /api/inventory. Set the env var (e.g. in Vercel) to your backend URL (ngrok or GCP).');
      return `${window.location.origin}/api/inventory`;
    }
  }

  // Default to localhost only when not in production (e.g. local dev)
  const defaultUrl = 'http://localhost:8000/api/inventory';
  console.log(`📍 Using default API URL: ${defaultUrl}`);
  return defaultUrl;
};

// Set base URL immediately - this will be called when module loads
// If window is not available yet, it will use default and update later
let initialBaseUrl = getApiBaseUrl();
OpenAPI.BASE = initialBaseUrl;
// Build shared headers for generated API client calls.
// Important: include ngrok bypass header for all requests when API host is ngrok.
const getOpenApiHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
  };
  const apiRoot = getApiRoot();
  const isNgrok = /^https?:\/\/[^/]*ngrok[^/]*\.(app|io|dev)(\/|$)/i.test(apiRoot);
  if (isNgrok) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
};
OpenAPI.HEADERS = async () => getOpenApiHeaders();
console.log(`✅ Initial API base URL set to: ${OpenAPI.BASE}`);

// Update base URL dynamically when window becomes available (if needed)
if (typeof window !== 'undefined') {
  // Use a small delay to ensure window.location is fully available
  const updateBaseUrl = () => {
    const newBaseUrl = getApiBaseUrl();
    if (OpenAPI.BASE !== newBaseUrl) {
      console.log(`🔄 Updating API base URL from ${OpenAPI.BASE} to ${newBaseUrl}`);
      OpenAPI.BASE = newBaseUrl;
    } else {
      console.log(`✅ API base URL confirmed: ${OpenAPI.BASE}`);
    }
    // Re-evaluate shared headers in case base URL changed (e.g. ngrok/non-ngrok).
    OpenAPI.HEADERS = async () => getOpenApiHeaders();
  };
  
  // Try immediately
  setTimeout(updateBaseUrl, 0);
  
  // Also try on DOM ready and load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateBaseUrl);
  }
  if (document.readyState !== 'complete') {
    window.addEventListener('load', updateBaseUrl);
  } else {
    updateBaseUrl();
  }
}

// Configure token authentication
// Return just the token value - request.ts will add "Token" prefix for DRF
OpenAPI.TOKEN = async () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log('Token retrieved from localStorage for API request:', token.substring(0, 10) + '...');
    return token;
  } else {
    console.warn('No token found in localStorage');
    return '';
  }
};

// Helper to update token (for login)
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
  // OpenAPI will automatically use this via the TOKEN getter above
};

// Helper to clear token (for logout)
export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Inventory API base URL (e.g. https://example.com/api/inventory). Use this for all API paths.
export const getInventoryBaseUrl = (): string => {
  const base = OpenAPI.BASE || getApiBaseUrl();
  return base.replace(/\/$/, '');
};

// Get the API server root (e.g. http://localhost:8000) from the current base. Use for media/static URLs.
export const getApiRoot = (): string => {
  const base = OpenAPI.BASE || getApiBaseUrl();
  const normalized = base.replace(/\/$/, '');
  const inventorySuffix = '/api/inventory';
  if (normalized.endsWith(inventorySuffix)) {
    return normalized.slice(0, -inventorySuffix.length) || normalized;
  }
  return normalized;
};

// Helper to build absolute auth URL from the current API base (for login API call)
export const getAuthLoginUrl = (): string => {
  const root = getApiRoot();
  return `${root}/api/auth/token/login/`;
};

// Helper to build absolute logout URL (under same base as API: /api/inventory/logout/)
export const getAuthLogoutUrl = (): string => {
  const base = OpenAPI.BASE || getApiBaseUrl();
  const normalized = base.replace(/\/$/, '');
  return `${normalized}/logout/`;
};
