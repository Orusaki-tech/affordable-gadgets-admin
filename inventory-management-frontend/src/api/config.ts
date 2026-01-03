import { OpenAPI } from './index';

// Configure base URL from environment variable or auto-detect from current hostname
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (process.env.REACT_APP_API_BASE_URL) {
    console.log(`🔧 Using API URL from environment: ${process.env.REACT_APP_API_BASE_URL}`);
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Auto-detect based on current hostname
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // If accessing via network IP, use that IP for backend
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const apiUrl = `http://${hostname}:8000/api/inventory`;
      console.log(`🌐 Auto-detected API URL: ${apiUrl} (from hostname: ${hostname})`);
      return apiUrl;
    }
  }
  
  // Default to localhost
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

