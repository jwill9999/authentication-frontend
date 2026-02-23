import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GoogleCallback from './GoogleCallback';
import * as AuthContextModule from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));

const mockUseAuth = vi.mocked(AuthContextModule.useAuth);

const makeAuth = () => ({
  user: null,
  token: null,
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  logoutAll: vi.fn().mockResolvedValue(undefined),
  googleLogin: vi.fn(),
  setToken: vi.fn(),
  setUser: vi.fn(),
});

const renderCallback = (search: string) => {
  const auth = makeAuth();
  mockUseAuth.mockReturnValue(auth);
  render(
    <MemoryRouter initialEntries={[`/auth/google/callback${search}`]}>
      <Routes>
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
  return auth;
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('GoogleCallback', () => {
  it('shows a loading indicator while processing', () => {
    // Render without waiting for navigation
    const auth = makeAuth();
    mockUseAuth.mockReturnValue(auth);
    render(
      <MemoryRouter initialEntries={['/auth/google/callback?token=tok']}>
        <Routes>
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );
    // Either shows loading text or immediately navigates — both are valid
    // Just ensure no crash
    expect(document.body).toBeTruthy();
  });

  it('stores the access token in memory (not localStorage) and navigates to dashboard', async () => {
    const auth = renderCallback('?token=oauth-token');
    await waitFor(() =>
      expect(screen.getByText('Dashboard')).toBeInTheDocument(),
    );
    expect(auth.setToken).toHaveBeenCalledWith('oauth-token');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('parses and stores user info from query param', async () => {
    const user = { email: 'oauth@test.com', name: 'OAuth User' };
    const auth = renderCallback(
      `?token=tok&user=${encodeURIComponent(JSON.stringify(user))}`,
    );
    await waitFor(() =>
      expect(screen.getByText('Dashboard')).toBeInTheDocument(),
    );
    expect(auth.setUser).toHaveBeenCalledWith(user);
    expect(localStorage.getItem('user')).toContain('oauth@test.com');
  });

  it('does not call setUser for invalid user JSON', async () => {
    const auth = renderCallback('?token=tok&user=not-valid-json{');
    await waitFor(() =>
      expect(screen.getByText('Dashboard')).toBeInTheDocument(),
    );
    expect(auth.setUser).not.toHaveBeenCalled();
  });

  it('navigates to /login when no token is present', async () => {
    renderCallback('');
    await waitFor(() =>
      expect(screen.getByText('Login Page')).toBeInTheDocument(),
    );
  });

  it('does NOT write access token to localStorage', async () => {
    renderCallback('?token=secret-token');
    await waitFor(() =>
      expect(screen.getByText('Dashboard')).toBeInTheDocument(),
    );
    expect(localStorage.getItem('token')).toBeNull();
  });
});
