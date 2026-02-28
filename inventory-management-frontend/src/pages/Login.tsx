import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminProfile } from '../hooks/useAdminProfile';
import './Login.css';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const { data: adminProfile } = useAdminProfile();
  const navigate = useNavigate();

  // Redirect only after auth state and profile are in context (avoids "Standard User" flash)
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !adminProfile) return;
    const isSuperuser = adminProfile.user?.is_superuser === true;
    const hasRole = (roleName: string) => {
      if (isSuperuser) return true;
      if (!adminProfile.roles) return false;
      return adminProfile.roles.some(
        (r: { name?: string; role_code?: string }) => r.name === roleName || r.role_code === roleName
      );
    };
    if (hasRole('CC') && !isSuperuser) {
      navigate('/content-creator/dashboard', { replace: true });
    } else if (hasRole('SP') && !isSuperuser) {
      navigate('/products', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user?.id, adminProfile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      // Do not navigate here — useEffect above runs after state/profile are ready and does role-based redirect
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Already authenticated: show redirecting until profile is ready, then useEffect will redirect
  if (isAuthenticated && user?.id && !adminProfile) {
    return (
      <div className="login-container">
        <div className="login-card">
          <p className="login-subtitle">Redirecting...</p>
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

