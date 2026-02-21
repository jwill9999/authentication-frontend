import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(AuthContextModule.useAuth);

const makeAuth = (
  overrides: Partial<ReturnType<typeof AuthContextModule.useAuth>> = {},
): ReturnType<typeof AuthContextModule.useAuth> => ({
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
  ...overrides,
});

const renderRoute = (authOverrides = {}) => {
  mockUseAuth.mockReturnValue(makeAuth(authOverrides));
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

beforeEach(() => vi.clearAllMocks());

describe('ProtectedRoute', () => {
  it('shows a loading indicator while auth state is being resolved', () => {
    renderRoute({ loading: true });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /login when there is no token', () => {
    renderRoute({ loading: false, token: null, user: null });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /login when token is present but user is missing', () => {
    renderRoute({ loading: false, token: 'tok', user: null });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to /login when user is present but token is missing', () => {
    renderRoute({ loading: false, token: null, user: { email: 'a@b.com' } });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when both token and user are present', () => {
    renderRoute({
      loading: false,
      token: 'valid-token',
      user: { email: 'a@b.com' },
    });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
