import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ProfilesService, LoginService, LogoutService, TokenResponse, User } from '../api/index';
import { setAuthToken, clearAuthToken } from '../api/config';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Token validation timeout')), 5000)
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
        setUser({ 
          id: adminProfile.user.id, 
          username: adminProfile.user.username || adminProfile.user.email || '',
          email: adminProfile.user.email,
          is_staff: adminProfile.user.is_staff,
          is_superuser: adminProfile.user.is_superuser,
        });
      } else {
        throw new Error('Invalid admin profile');
      }
    } catch (error: any) {
      // Check if it's an authentication error (401/403) vs network error
      const isAuthError = error?.status === 401 || error?.status === 403;
      
      if (isAuthError) {
        // Only clear token on actual auth errors, not network issues
        console.error('Token validation failed - authentication error:', error);
        clearAuthToken();
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      } else {
        // For network errors, keep the token but log it
        console.warn('Token validation failed - network error:', error);
        // Don't clear token on network errors - user might have valid token
        // Set loading to false so user can continue
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    console.log('AuthContext mount - token exists:', !!token, 'hasValidated:', hasValidated);
    
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
    const loginData = {
      username_or_email: username,
      password: password,
    };
    
    try {
      const response: TokenResponse = await LoginService.loginCreate(loginData);
      
      // Check if user is admin - CustomerLogin doesn't have is_staff, we'll check via admin profile

    // Store token FIRST before updating state
    if (response.token) {
      setAuthToken(response.token);
      console.log('✅ Token stored in localStorage:', response.token.substring(0, 10) + '...');
      // Verify it was stored
      const stored = localStorage.getItem('auth_token');
      if (stored !== response.token) {
        console.error('❌ Token storage failed! Expected:', response.token.substring(0, 10), 'Got:', stored?.substring(0, 10));
      } else {
        console.log('✅ Token storage verified in localStorage');
      }
    } else {
      console.error('❌ No token in login response!');
      throw new Error('Login failed: No token received');
    }
    
    // Fetch admin profile to get is_superuser
    try {
      const adminProfile = await ProfilesService.profilesAdminRetrieve();
      // Update state - mark as validated since we just logged in successfully
      setHasValidated(true);
      setIsAuthenticated(true);
      setIsAdmin(true);
      if (response.user_id && response.email && adminProfile.user) {
        setUser({ 
          id: response.user_id, 
          email: response.email,
          username: response.email, // Use email as username fallback
          is_staff: adminProfile.user.is_staff || false,
          is_superuser: adminProfile.user.is_superuser || false,
        });
      } else if (response.user_id && response.email) {
        // Fallback if admin profile fetch fails
        setUser({ 
          id: response.user_id, 
          email: response.email,
          username: response.email,
          is_staff: false,
          is_superuser: false,
        });
      }
      console.log('✅ Login successful, user authenticated:', { user_id: response.user_id, email: response.email, is_superuser: adminProfile.user?.is_superuser });
    } catch (error) {
      // If admin profile fetch fails, still set basic user info
      setHasValidated(true);
      setIsAuthenticated(true);
      setIsAdmin(true);
      if (response.user_id && response.email) {
        setUser({ 
          id: response.user_id, 
          email: response.email,
          username: response.email,
          is_staff: false,
          is_superuser: false,
        });
      }
      console.log('✅ Login successful (admin profile fetch failed):', { user_id: response.user_id, email: response.email });
    }
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

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token server-side
      await LogoutService.logoutCreate();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear React Query cache to prevent stale data from previous user
      queryClient.clear();
      clearAuthToken();
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      setHasValidated(false); // Reset validation state so new login validates properly
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

