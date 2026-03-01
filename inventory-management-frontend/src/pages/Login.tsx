import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminProfile } from '../hooks/useAdminProfile';
import './Login.css';

type ProfileForRedirect = { user?: { is_superuser?: boolean }; roles?: Array<{ name?: string; role_code?: string }> };

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const { data: adminProfile } = useAdminProfile();
  const navigate = useNavigate();

  const redirectByRole = useCallback((profile: ProfileForRedirect) => {
    const isSuperuser =
      profile.user?.is_superuser === true || (profile as any)?.is_superuser === true;
    const hasRole = (roleName: string) => {
      if (isSuperuser) return true;
      if (!profile.roles) return false;
      return profile.roles.some(
        (r: { name?: string; role_code?: string }) => r.name === roleName || r.role_code === roleName
      );
    };
    const state = { adminProfile: profile };
    if (hasRole('CC') && !isSuperuser) {
      navigate('/content-creator/dashboard', { state, replace: true });
    } else if (hasRole('SP') && !isSuperuser) {
      navigate('/products', { state, replace: true });
    } else {
      navigate('/dashboard', { state, replace: true });
    }
  }, [navigate]);

  // Redirect when already authenticated (e.g. user revisited /login with valid token)
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !adminProfile) return;
    redirectByRole(adminProfile);
  }, [isAuthenticated, user?.id, adminProfile, redirectByRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Do not redirect here. login() fetches profile and updates state/cache; redirect only
      // from useEffect when adminProfile is available, so the dashboard never mounts with stale role.
      await login(username, password);
    } catch (err: any) {
      const raw = err?.message ?? err?.body ?? '';
      const safeMessage =
        typeof raw === 'string' && (raw.trim().startsWith('<') || /<!doctype/i.test(raw))
          ? 'Server returned an error. Check that the API URL is correct and the backend allows your host (e.g. ngrok).'
          : (raw || 'Login failed. Please check your credentials.');
      setError(safeMessage);
      setLoading(false);
    }
  };

  // Already authenticated: stay on this screen until profile is in state/cache, then useEffect redirects.
  // This ensures the dashboard never mounts before role is populated (avoids "Standard User" / "ACCESS RESTRICTED").
  if (isAuthenticated && user?.id) {
    return (
      <div className="login-container">
        <div className="login-card">
          <p className="login-subtitle">{adminProfile ? 'Redirecting...' : 'Logging in...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Admin Login</h2>
        <p className="login-subtitle">Inventory Management System</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              type="text"
              placeholder="Enter username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

