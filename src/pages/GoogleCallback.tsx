import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/auth';
import { protectedAPI, refreshAccessTokenDetailed } from '../services/api';

const isOAuthUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const maybeUser = value as Partial<User>;
  return typeof maybeUser.email === 'string';
};

const GoogleCallback = (): React.JSX.Element => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();

  useEffect(() => {
    const restoreGoogleSession = async (): Promise<void> => {
      const oauthError = searchParams.get('error');

      if (oauthError) {
        navigate('/login', {
          replace: true,
          state: { error: 'Google authentication failed' },
        });
        return;
      }

      const refreshResult = await refreshAccessTokenDetailed();

      if (refreshResult.outcome !== 'success' || !refreshResult.token) {
        navigate('/login', {
          replace: true,
          state: { error: 'Google authentication failed' },
        });
        return;
      }

      // Store access token in memory only — refresh cookie is set by the server.
      setToken(refreshResult.token);

      try {
        const profile = await protectedAPI.getProfile();
        if (isOAuthUser(profile)) {
          // Only non-sensitive public user info goes to localStorage.
          localStorage.setItem('user', JSON.stringify(profile));
          setUser(profile);
        } else {
          localStorage.removeItem('user');
        }
      } catch {
        // Profile hydration is best-effort; token is enough to complete auth flow.
        localStorage.removeItem('user');
      }

      navigate('/dashboard', { replace: true });
    };

    void restoreGoogleSession();
  }, [navigate, searchParams, setToken, setUser]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ fontSize: '18px', color: '#667eea' }}>
        Completing Google Sign In...
      </div>
      <div className="spinner"></div>
    </div>
  );
};

export default GoogleCallback;
