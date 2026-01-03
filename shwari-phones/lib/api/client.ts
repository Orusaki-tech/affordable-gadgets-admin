/**
 * API Client Configuration
 * Automatically includes X-Brand-Code header in all requests
 */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { brandConfig } from '@/lib/config/brand';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: `${brandConfig.apiBaseUrl}/api/v1/public`,
  headers: {
    'Content-Type': 'application/json',
    'X-Brand-Code': brandConfig.code,
  },
  withCredentials: true, // For session support
});

// Request interceptor to ensure brand header is always present
apiClient.interceptors.request.use(
  (config) => {
    // Ensure brand code is always in headers
    if (config.headers) {
      config.headers['X-Brand-Code'] = brandConfig.code;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Build error info object with all available data
    const errorInfo: Record<string, any> = {};
    
    // Basic error properties
    if (error?.message) errorInfo.message = error.message;
    if (error?.code) errorInfo.code = error.code;
    if (error?.name) errorInfo.name = error.name;
    
    // Response properties
    if (error?.response) {
      errorInfo.status = error.response.status;
      errorInfo.statusText = error.response.statusText;
      errorInfo.data = error.response.data;
      errorInfo.headers = error.response.headers;
    }
    
    // Request config properties
    if (error?.config) {
      errorInfo.url = error.config.url;
      errorInfo.method = error.config.method;
      errorInfo.baseURL = error.config.baseURL;
      errorInfo.params = error.config.params;
    }
    
    // Log error if we have any information
    if (Object.keys(errorInfo).length > 0) {
      console.error('API Error:', errorInfo);
    } else {
      // Fallback: log the raw error
      console.error('API Error (raw):', error);
    }
    
    // Handle common errors with specific messages
    if (error?.response?.status === 400) {
      console.error('Bad Request (400):', error.response.data);
      console.error('Request URL:', error.config?.url);
      console.error('Request params:', error.config?.params);
      console.error('Brand code sent:', brandConfig.code);
    } else if (error?.response?.status === 401) {
      console.error('Unauthorized access - check authentication');
    } else if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error')) {
      console.error('❌ Cannot connect to API server.');
      console.error(`   Backend URL: ${brandConfig.apiBaseUrl}`);
      console.error('   Please ensure the Django backend is running:');
      console.error('   1. Navigate to the project root directory');
      console.error('   2. Activate virtual environment: source venv/bin/activate');
      console.error('   3. Run: python manage.py runserver');
      console.error('   4. Verify backend is accessible at:', brandConfig.apiBaseUrl);
    } else if (!error?.response) {
      console.error('Network error - no response from server');
      console.error('This usually means the backend server is not running.');
      console.error(`Expected backend URL: ${brandConfig.apiBaseUrl}`);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

