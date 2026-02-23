import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import * as AuthContextModule from '../context/AuthContext';
import * as apiModule from '../services/api';
import { ApiHttpError } from '../services/api';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    protectedAPI: { getProfile: vi.fn(), getData: vi.fn() },
  };
});

const mockUseAuth = vi.mocked(AuthContextModule.useAuth);
const mockGetProfile = vi.mocked(apiModule.protectedAPI.getProfile);

const makeAuth = (
  overrides: Partial<ReturnType<typeof AuthContextModule.useAuth>> = {},
): ReturnType<typeof AuthContextModule.useAuth> => ({
  user: { email: 'user@test.com' },
  token: 'valid-token',
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

const renderDashboard = (authOverrides = {}) => {
  const auth = makeAuth(authOverrides);
  mockUseAuth.mockReturnValue(auth);
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
  return auth;
};

beforeEach(() => vi.clearAllMocks());

describe('Dashboard', () => {
  it('displays the logged-in user email', async () => {
    mockGetProfile.mockResolvedValueOnce({});
    renderDashboard();
    expect(screen.getByText(/user@test\.com/)).toBeInTheDocument();
  });

  it('shows loading state while fetching profile', () => {
    // Never resolves during this test
    mockGetProfile.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('renders fetched profile data', async () => {
    mockGetProfile.mockResolvedValueOnce({ id: '1', role: 'admin' });
    renderDashboard();
    await waitFor(() =>
      expect(screen.getByText(/Profile Information/)).toBeInTheDocument(),
    );
    expect(screen.getByText(/"role": "admin"/)).toBeInTheDocument();
  });

  it('shows error message when profile fetch fails', async () => {
    mockGetProfile.mockRejectedValueOnce(new Error('Server error'));
    renderDashboard();
    await waitFor(() =>
      expect(
        screen.getByText(/Error loading profile: Server error/),
      ).toBeInTheDocument(),
    );
  });

  it('displays truncated JWT token', async () => {
    mockGetProfile.mockResolvedValueOnce({});
    // Use exactly 20-char token so substring(0,20) returns the whole string
    renderDashboard({ token: 'abcdefghijklmnopqrst' });
    await waitFor(() =>
      expect(screen.getByText(/JWT Token:/)).toBeInTheDocument(),
    );
    // Text is split across <strong> and text nodes — query the parent <p>
    const label = screen.getByText(/JWT Token:/);
    expect(label.closest('p')).toHaveTextContent('abcdefghijklmnopqrst...');
  });

  it('Logout button calls logout and redirects to /login', async () => {
    mockGetProfile.mockResolvedValueOnce({});
    const auth = renderDashboard();

    await waitFor(() => screen.getByText('Logout'));
    await userEvent.click(screen.getByText('Logout'));

    expect(auth.logout).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.getByText('Login Page')).toBeInTheDocument(),
    );
  });

  it('Logout All Devices button calls logoutAll and redirects to /login', async () => {
    mockGetProfile.mockResolvedValueOnce({});
    const auth = renderDashboard();

    await waitFor(() => screen.getByText('Logout All Devices'));
    await userEvent.click(screen.getByText('Logout All Devices'));

    expect(auth.logoutAll).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.getByText('Login Page')).toBeInTheDocument(),
    );
  });

  it('shows error and stays on dashboard when logoutAll fails', async () => {
    mockGetProfile.mockResolvedValueOnce({});
    const auth = renderDashboard({
      logoutAll: vi.fn().mockRejectedValueOnce(new Error('Logout all failed')),
    });

    await waitFor(() => screen.getByText('Logout All Devices'));
    await userEvent.click(screen.getByText('Logout All Devices'));

    expect(auth.logoutAll).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(
        screen.getByText(/Error loading profile: Logout all failed/),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('calls logout and navigates to /login on 401 profile error', async () => {
    mockGetProfile.mockRejectedValueOnce(new ApiHttpError('Unauthorized', 401));
    const auth = renderDashboard();

    await waitFor(() =>
      expect(screen.getByText('Login Page')).toBeInTheDocument(),
    );
    expect(auth.logout).toHaveBeenCalledTimes(1);
  });
});
