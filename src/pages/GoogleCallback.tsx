import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/auth';

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
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token) {
      localStorage.setItem('token', token);
      setToken(token);

      if (userParam) {
        try {
          const parsedUser: unknown = JSON.parse(decodeURIComponent(userParam));

          if (isOAuthUser(parsedUser)) {
            localStorage.setItem('user', JSON.stringify(parsedUser));
            setUser(parsedUser);
          }
        } catch {
          localStorage.removeItem('user');
        }
      }

      globalThis.location.href = '/dashboard';
    } else {
      navigate('/login', { state: { error: 'Google authentication failed' } });
    }
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
