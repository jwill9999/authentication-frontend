import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// ── Mock heavy page components ────────────────────────────────────────────────
vi.mock('./pages/Login', () => ({ default: () => <div>Login Page</div> }));
vi.mock('./pages/Register', () => ({
  default: () => <div>Register Page</div>,
}));
vi.mock('./pages/Dashboard', () => ({
  default: () => <div>Dashboard Page</div>,
}));
vi.mock('./pages/GoogleCallback', () => ({
  default: () => <div>Google Callback</div>,
}));
vi.mock('./components/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ── Mock AuthProvider (avoids real refresh calls on mount) ────────────────────
vi.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useAuth: () => ({
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
    logoutAll: vi.fn(),
    register: vi.fn(),
    googleLogin: vi.fn(),
    isLoading: false,
  }),
}));

// ── Helper: render App with a specific initial URL ────────────────────────────
function renderAt(path: string) {
  // jsdom's location can be set before rendering
  window.history.pushState({}, '', path);
  return render(<App />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('App routing', () => {
  it('renders Login page on /login', () => {
    renderAt('/login');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders Register page on /register', () => {
    renderAt('/register');
    expect(screen.getByText('Register Page')).toBeInTheDocument();
  });

  it('renders GoogleCallback on /auth/google/callback', () => {
    renderAt('/auth/google/callback');
    expect(screen.getByText('Google Callback')).toBeInTheDocument();
  });

  it('renders Dashboard inside ProtectedRoute on /dashboard', () => {
    renderAt('/dashboard');
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('redirects / to /login', () => {
    renderAt('/');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
