import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ProfilesService, User } from '../api/index';
import { setAuthToken, clearAuthToken, getAuthLoginUrl, getAuthLogoutUrl, getApiRoot } from '../api/config';
import { queryKeys } from '../hooks/queryKeys';

type ProfileForSync = {
  id?: number;
  user?: { id?: number; username?: string; email?: string; is_staff?: boolean; is_superuser?: boolean };
  username?: string;
  email?: string;
  roles?: Array<{ name?: string; role_code?: string }>;
};

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<ProfileForSync | null>;
  logout: () => void;
  loading: boolean;
  /** Sync auth user from profile (e.g. when profile loads on dashboard so role/access is correct) */
  setUserFromProfile: (profile: ProfileForSync | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'auth_user';
const AUTH_IS_ADMIN_KEY = 'auth_is_admin';
const AUTH_PROFILE_KEY = 'auth_profile';

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
      
      // Add timeout to prevent hanging (15s to allow backend/ngrok response)
      const timeoutMs = 15000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Token validation timeout')), timeoutMs)
      );
      
      // Try to fetch admin profile - if succeeds, user is admin
      const adminProfile = await Promise.race([
        ProfilesService.profilesAdminRetrieve(),
        timeoutPromise
      ]) as any;

      // Backend returns nested user and/or top-level fields; support both shapes and camelCase from some clients
      const uid =
        adminProfile?.user?.id ??
        (adminProfile as any)?.user?.id ??
        adminProfile?.id ??
        (adminProfile as any)?.user_id;
      const email =
        adminProfile?.user?.email ??
        (adminProfile as any)?.user?.email ??
        adminProfile?.email ??
        '';
      const username =
        adminProfile?.user?.username ??
        (adminProfile as any)?.user?.username ??
        adminProfile?.username ??
        email ??
        '';
      const is_staff =
        adminProfile?.user?.is_staff ??
        (adminProfile as any)?.user?.is_staff ??
        adminProfile?.is_staff ??
        true;
      const is_superuser =
        adminProfile?.user?.is_superuser ??
        (adminProfile as any)?.user?.isSuperuser ??
        adminProfile?.is_superuser ??
        (adminProfile as any)?.isSuperuser ??
        false;

      // Accept profile if we have any identifier (uid or email/username) so we don't reject valid API shapes
      const hasIdentity = uid != null || email !== '' || username !== '';
      if (hasIdentity && adminProfile && typeof adminProfile === 'object') {
        console.log('Token validation successful:', { user_id: uid, email: email || '(from username)' });
        queryClient.setQueryData(queryKeys.adminProfile(), adminProfile);
        setIsAdmin(true);
        setIsAuthenticated(true);
        const nextUser = {
          id: uid ?? undefined,
          username: username || email || 'admin',
          email: email || username || '',
          is_staff,
          is_superuser,
        };
        setUser(nextUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
        localStorage.setItem(AUTH_IS_ADMIN_KEY, 'true');
        localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(adminProfile));
      } else {
        throw new Error('Invalid admin profile');
      }
    } catch (error: any) {
      // 401/403/404 = invalid token (destructive). timeout/network/invalid-profile = non-fatal on startup.
      const isAuthError = error?.status === 401 || error?.status === 403 || error?.status === 404;
      const msg = String(error?.message ?? '');
      const isInvalidProfile = msg.includes('Invalid admin profile');
      const isTimeout = msg.includes('Token validation timeout') || msg.includes('timeout');
      const isNetworkOrRedirect =
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('Load failed') ||
        msg.includes('redirect');

      if (isAuthError) {
        console.warn('Token validation failed: auth error', error);
        clearAuthToken();
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_IS_ADMIN_KEY);
        localStorage.removeItem(AUTH_PROFILE_KEY);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      } else if (isInvalidProfile || isTimeout || isNetworkOrRedirect) {
        console.warn('Token validation non-fatal:', isInvalidProfile ? 'invalid profile response' : isTimeout ? 'timeout' : 'network/redirect', error);
        // Keep current auth/session from cached login payload.
      } else {
        // Other unexpected errors: keep token, allow user to retry
        console.warn('Token validation failed - other error:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  const setUserFromProfile = useCallback((profile: ProfileForSync | null) => {
    if (!profile) return;
    const u = profile.user as { id?: number; username?: string; email?: string; is_staff?: boolean; is_superuser?: boolean; isSuperuser?: boolean } | undefined;
    const id = u?.id ?? (profile as any).user_id;
    const username = u?.username ?? profile.username ?? u?.email ?? profile.email ?? '';
    const email = u?.email ?? profile.email;
    const is_superuser = u?.is_superuser ?? (u as any)?.isSuperuser ?? (profile as any).is_superuser ?? false;
    const is_staff = u?.is_staff ?? (profile as any).is_staff ?? true;
    if (id == null && !username && !email) return;
    const nextUser = {
      id: id ?? (profile.id as number | undefined),
      username: username ?? '',
      email: email,
      is_staff,
      is_superuser,
    };
    setUser(nextUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    localStorage.setItem(AUTH_IS_ADMIN_KEY, 'true');
    localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    console.log('AuthContext mount - token exists:', !!token, 'hasValidated:', hasValidated);
    
    if (token) {
      // Restore cached auth/profile from last successful login first.
      let hasCachedUser = false;
      try {
        const cachedUser = localStorage.getItem(AUTH_USER_KEY);
        const cachedIsAdminRaw = localStorage.getItem(AUTH_IS_ADMIN_KEY);
        const cachedProfile = localStorage.getItem(AUTH_PROFILE_KEY);
        const cachedIsAdmin = cachedIsAdminRaw === 'true';
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          hasCachedUser = true;
        }
        if (cachedProfile) {
          queryClient.setQueryData(queryKeys.adminProfile(), JSON.parse(cachedProfile));
        }
        setIsAuthenticated(true);
        setIsAdmin(cachedIsAdminRaw ? cachedIsAdmin : true);
      } catch (error) {
        console.warn('Failed to restore cached auth state:', error);
      }

      if (hasCachedUser) {
        setHasValidated(true);
        setLoading(false);
        return;
      }

      if (!hasValidated) {
        console.log('Starting token validation...');
        validateToken();
      } else {
        console.log('Token already validated, skipping validation');
        setLoading(false);
      }
    } else if (!token) {
      console.log('No token found, setting loading to false');
      setLoading(false);
    }
  }, [hasValidated, validateToken, queryClient]);

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
        localStorage.removeItem(AUTH_PROFILE_KEY);
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

  const login = async (username: string, password: string): Promise<ProfileForSync | null> => {
    try {
      const formData = new URLSearchParams();
      formData.set('username', username);
      formData.set('password', password);

      const authUrl = getAuthLoginUrl();
      const apiRoot = getApiRoot();
      const loginHeaders: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      if (/ngrok/i.test(apiRoot)) {
        loginHeaders['ngrok-skip-browser-warning'] = 'true';
      }
      // Backend (ngrok/GCP) may be slow; allow up to 90s so login can complete.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      const authResponse = await fetch(authUrl, {
        method: 'POST',
        headers: loginHeaders,
        body: formData.toString(),
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      const contentType = authResponse.headers.get('content-type') || '';
      const authBody = contentType.includes('application/json')
        ? await authResponse.json()
        : await authResponse.text();

      if (!authResponse.ok) {
        const error: any = new Error('Login failed.');
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

      // Prefer profile returned in login response to avoid a second request/race on first redirect.
      // Fallback to profilesAdminRetrieve for backward compatibility with older backend responses.
      const adminProfile =
        (authBody as any)?.profile ??
        (authBody as any)?.admin_profile ??
        await ProfilesService.profilesAdminRetrieve() as any;
      const uid = adminProfile?.user?.id ?? adminProfile?.id;
      const email = adminProfile?.user?.email ?? adminProfile?.email;
      const profileUsername = adminProfile?.user?.username ?? adminProfile?.username ?? email ?? username;
      const is_staff = adminProfile?.user?.is_staff ?? adminProfile?.is_staff ?? true;
      const is_superuser = adminProfile?.user?.is_superuser ?? adminProfile?.is_superuser ?? false;

      queryClient.setQueryData(queryKeys.adminProfile(), adminProfile);
      setHasValidated(true);
      setIsAuthenticated(true);
      setIsAdmin(true);
      const nextUser = {
        id: uid ?? undefined,
        email: email ?? undefined,
        username: profileUsername || username,
        is_staff,
        is_superuser,
      };
      setUser(nextUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
      localStorage.setItem(AUTH_IS_ADMIN_KEY, 'true');
      localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(adminProfile));
      console.log('✅ Login successful, user authenticated:', { user_id: uid, email, is_superuser });

      return adminProfile as ProfileForSync;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract detailed error message from API response body
      let errorMessage = error?.message || 'Login failed. Please check your credentials.';
      if (error?.name === 'AbortError') {
        errorMessage = 'Login timed out. The server may be starting up; please try again in a moment.';
      } else if (error?.body) {
        // Handle Django REST Framework error format (non_field_errors, field errors, detail, message)
        const body = error.body;
        if (typeof body === 'string') {
          const trimmed = body.trim();
          if (trimmed.startsWith('<') || /<!doctype/i.test(trimmed)) {
            errorMessage = 'Server returned an HTML page instead of JSON (request was rejected or intercepted). Check: backend ALLOWED_HOSTS includes your API host (e.g. ngrok or Cloud Run URL); if using ngrok, the app sends the bypass header. For localhost, use development mode and ALLOWED_HOSTS including localhost.';
          } else {
            errorMessage = body;
          }
        } else if (body?.non_field_errors && Array.isArray(body.non_field_errors) && body.non_field_errors.length > 0) {
          errorMessage = body.non_field_errors[0];
        } else if (body?.username && Array.isArray(body.username) && body.username.length > 0) {
          errorMessage = body.username[0];
        } else if (body?.password && Array.isArray(body.password) && body.password.length > 0) {
          errorMessage = body.password[0];
        } else if (body?.detail) {
          errorMessage = typeof body.detail === 'string' ? body.detail : (Array.isArray(body.detail) ? body.detail[0] : String(body.detail));
        } else if (body?.message) {
          errorMessage = body.message;
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
    localStorage.removeItem(AUTH_PROFILE_KEY);
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
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, login, logout, loading, setUserFromProfile }}>
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

