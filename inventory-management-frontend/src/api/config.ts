import { OpenAPI } from '@shwari/api-client';

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
    // Production domains like vercel.app, netlify.app, etc. should use env variable
    const isProductionDomain = hostname.includes('.vercel.app') || 
                                hostname.includes('.netlify.app') || 
                                hostname.includes('.railway.app') ||
                                hostname.includes('.herokuapp.com') ||
                                hostname.includes('.onrender.com');
    
    if (!isProductionDomain && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const apiUrl = `http://${hostname}:8000/api/inventory`;
      console.log(`🌐 Auto-detected API URL: ${apiUrl} (from hostname: ${hostname})`);
      return apiUrl;
    }
    
    // For production domains without env variable, warn and use localhost (will fail, but at least we warn)
    if (isProductionDomain) {
      console.error('❌ REACT_APP_API_BASE_URL environment variable is not set!');
      console.error('   Please set REACT_APP_API_BASE_URL in your Vercel/Netlify project settings.');
      console.error('   Example: https://your-api-domain.railway.app/api/inventory');
    }
  }
  
  // Default to localhost (for local development only)
  const defaultUrl = 'http://localhost:8000/api/inventory';
  console.log(`📍 Using default API URL: ${defaultUrl}`);
  return defaultUrl;
};

// Set base URL immediately - this will be called when module loads
// If window is not available yet, it will use default and update later
let initialBaseUrl = getApiBaseUrl();
OpenAPI.BASE = initialBaseUrl;
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

// Helper to build absolute auth URL from the current API base
export const getAuthLoginUrl = () => {
  const base = OpenAPI.BASE || '';
  const normalized = base.replace(/\/$/, '');
  const inventorySuffix = '/api/inventory';
  const root = normalized.endsWith(inventorySuffix)
    ? normalized.slice(0, -inventorySuffix.length)
    : normalized;
  return `${root || ''}/api/auth/token/login/`;
};
