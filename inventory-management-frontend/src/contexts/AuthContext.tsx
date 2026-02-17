import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ProfilesService, User } from '../api/index';
import { setAuthToken, clearAuthToken, getAuthLoginUrl, getAuthLogoutUrl } from '../api/config';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'auth_user';
const AUTH_IS_ADMIN_KEY = 'auth_is_admin';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasValidated, setHasValidated] = useState(false);

  // Check if user is already logged in on mount (only once)
  const validateToken = useCallback(async () => {
    try {
      setLoading(true);
      setHasValidated(true);
      
      // Add timeout to prevent hanging (15s to allow Render cold starts)
      const timeoutMs = 15000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Token validation timeout')), timeoutMs)
      );
      
      // Try to fetch admin profile - if succeeds, user is admin
      const adminProfile = await Promise.race([
        ProfilesService.profilesAdminRetrieve(),
        timeoutPromise
      ]) as any;
      
      if (adminProfile.user && adminProfile.user.id && adminProfile.user.email) {
        console.log('Token validation successful:', { user_id: adminProfile.user.id, email: adminProfile.user.email });
        setIsAdmin(true);
        setIsAuthenticated(true);
        const nextUser = { 
          id: adminProfile.user.id, 
          username: adminProfile.user.username || adminProfile.user.email || '',
          email: adminProfile.user.email,
          is_staff: adminProfile.user.is_staff,
          is_superuser: adminProfile.user.is_superuser,
        };
        setUser(nextUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
        localStorage.setItem(AUTH_IS_ADMIN_KEY, 'true');
      } else {
        throw new Error('Invalid admin profile');
      }
    } catch (error: any) {
      // 401/403 = invalid token; timeout = server too slow; redirect/network = e.g. ERR_TOO_MANY_REDIRECTS — clear so user can re-login
      const isAuthError = error?.status === 401 || error?.status === 403;
      const msg = String(error?.message ?? '');
      const isTimeout = msg.includes('Token validation timeout') || msg.includes('timeout');
      const isNetworkOrRedirect =
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('Load failed') ||
        msg.includes('redirect');

      if (isAuthError || isTimeout || isNetworkOrRedirect) {
        console.warn('Token validation failed:', isTimeout ? 'timeout' : isNetworkOrRedirect ? 'network/redirect' : 'auth error', error);
        clearAuthToken();
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_IS_ADMIN_KEY);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      } else {
        // Other unexpected errors: keep token, allow user to retry
        console.warn('Token validation failed - other error:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    console.log('AuthContext mount - token exists:', !!token, 'hasValidated:', hasValidated);
    
    if (token) {
      // Optimistically restore cached auth state so full-page redirects don't look logged out.
      try {
        const cachedUser = localStorage.getItem(AUTH_USER_KEY);
        const cachedIsAdminRaw = localStorage.getItem(AUTH_IS_ADMIN_KEY);
        const cachedIsAdmin = cachedIsAdminRaw === 'true';
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }
        setIsAuthenticated(true);
        setIsAdmin(cachedIsAdminRaw ? cachedIsAdmin : true);
      } catch (error) {
        console.warn('Failed to restore cached auth state:', error);
      }
    }
    
    if (token && !hasValidated) {
      // Validate token by fetching admin profile
      console.log('Starting token validation...');
      validateToken();
    } else if (!token) {
      console.log('No token found, setting loading to false');
      setLoading(false);
    } else if (hasValidated) {
      // Already validated, don't validate again
      console.log('Token already validated, skipping validation');
      setLoading(false);
    }
  }, [hasValidated, validateToken]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'auth_token') {
        return;
      }

      if (!event.newValue) {
        console.log('Auth token removed in another tab, logging out locally');
        queryClient.clear();
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_IS_ADMIN_KEY);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
        setHasValidated(false);
        setLoading(false);
      } else {
        console.log('Auth token changed in another tab, re-validating');
        validateToken();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [queryClient, validateToken]);

  const login = async (username: string, password: string) => {
    try {
      const formData = new URLSearchParams();
      formData.set('username', username);
      formData.set('password', password);

      const authUrl = getAuthLoginUrl();
      const authResponse = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const contentType = authResponse.headers.get('content-type') || '';
      const authBody = contentType.includes('application/json')
        ? await authResponse.json()
        : await authResponse.text();

      if (!authResponse.ok) {
        const error: any = new Error('Login failed. Please check your credentials.');
        error.status = authResponse.status;
        error.body = authBody;
        throw error;
      }

      const token = authBody?.token;
      if (!token) {
        const error: any = new Error('Login failed: No token received');
        error.status = authResponse.status;
        error.body = authBody;
        throw error;
      }

      // Store token FIRST before updating state
      setAuthToken(token);
      console.log('✅ Token stored in localStorage:', token.substring(0, 10) + '...');
      // Verify it was stored
      const stored = localStorage.getItem('auth_token');
      if (stored !== token) {
        console.error('❌ Token storage failed! Expected:', token.substring(0, 10), 'Got:', stored?.substring(0, 10));
      } else {
        console.log('✅ Token storage verified in localStorage');
      }

      // Fetch admin profile to get user details
      const adminProfile = await ProfilesService.profilesAdminRetrieve();
      setHasValidated(true);
      setIsAuthenticated(true);
      setIsAdmin(true);
      if (adminProfile.user) {
        const nextUser = {
          id: adminProfile.user.id,
          email: adminProfile.user.email,
          username: adminProfile.user.username || adminProfile.user.email || username,
          is_staff: adminProfile.user.is_staff || false,
          is_superuser: adminProfile.user.is_superuser || false,
        };
        setUser(nextUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
        localStorage.setItem(AUTH_IS_ADMIN_KEY, 'true');
      } else {
        const nextUser = {
          username,
        };
        setUser(nextUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
        localStorage.setItem(AUTH_IS_ADMIN_KEY, 'true');
      }
      console.log('✅ Login successful, user authenticated:', {
        user_id: adminProfile.user?.id,
        email: adminProfile.user?.email,
        is_superuser: adminProfile.user?.is_superuser,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract detailed error message from API response body
      let errorMessage = error?.message || 'Login failed. Please check your credentials.';
      if (error?.body) {
        // Handle Django REST Framework error format
        if (error.body.non_field_errors && Array.isArray(error.body.non_field_errors) && error.body.non_field_errors.length > 0) {
          errorMessage = error.body.non_field_errors[0];
        } else if (typeof error.body === 'string') {
          errorMessage = error.body;
        } else if (error.body.detail) {
          errorMessage = error.body.detail;
        } else if (error.body.message) {
          errorMessage = error.body.message;
        }
      }
      
      // Create a new error with the extracted message
      const loginError = new Error(errorMessage);
      (loginError as any).status = error?.status;
      (loginError as any).body = error?.body;
      throw loginError;
    }
  };

  const logout = () => {
    const token = localStorage.getItem('auth_token');
    // Clear local state immediately so logout feels instant (don't wait for server)
    queryClient.clear();
    clearAuthToken();
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_IS_ADMIN_KEY);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    setHasValidated(false);

    // Notify server in background with short timeout; ignore errors (user is already logged out locally)
    if (token) {
      const logoutUrl = getAuthLogoutUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      fetch(logoutUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) {
            console.warn('Logout API returned', res.status);
          }
        })
        .catch(() => {
          // Ignore: network/timeout — user is already logged out locally
        })
        .finally(() => clearTimeout(timeoutId));
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

