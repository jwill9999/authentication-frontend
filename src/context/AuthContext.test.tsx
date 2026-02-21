import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import * as api from '../services/api';

// ─── Mock the entire api module ───────────────────────────────────────────────
vi.mock('../services/api', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    logoutAll: vi.fn(),
    googleLogin: vi.fn(),
  },
  refreshAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

const mockedRefresh = vi.mocked(api.refreshAccessToken);
const mockedLogin = vi.mocked(api.authAPI.login);
const mockedLogout = vi.mocked(api.authAPI.logout);
const mockedLogoutAll = vi.mocked(api.authAPI.logoutAll);
const mockedGetAccessToken = vi.mocked(api.getAccessToken);

// ─── Helper component ─────────────────────────────────────────────────────────
const TestConsumer = () => {
  const { user, token, loading, login, logout, logoutAll } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="token">{token ?? 'null'}</span>
      <span data-testid="user">{user?.email ?? 'null'}</span>
      <button onClick={() => login('a@b.com', 'pass')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => logoutAll()}>LogoutAll</button>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  // Default: refresh returns null (no active session)
  mockedRefresh.mockResolvedValue(null);
});

// ─── Session restore on mount ─────────────────────────────────────────────────
describe('session restore on mount', () => {
  it('shows loading then ready when no session exists', async () => {
    renderWithProvider();
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('ready'),
    );
  });

  it('restores token from httpOnly cookie via POST /auth/refresh', async () => {
    mockedRefresh.mockResolvedValueOnce('restored-token');
    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('token')).toHaveTextContent('restored-token'),
    );
  });

  it('restores user from localStorage when refresh succeeds', async () => {
    mockedRefresh.mockResolvedValueOnce('tok');
    localStorage.setItem('user', JSON.stringify({ email: 'stored@test.com' }));
    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('stored@test.com'),
    );
  });

  it('ignores malformed localStorage user entry', async () => {
    mockedRefresh.mockResolvedValueOnce('tok');
    localStorage.setItem('user', 'not-valid-json{');
    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('token')).toHaveTextContent('tok'),
    );
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  it('leaves token null when refresh fails', async () => {
    mockedRefresh.mockResolvedValueOnce(null);
    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('ready'),
    );
    expect(screen.getByTestId('token')).toHaveTextContent('null');
  });
});

// ─── login ────────────────────────────────────────────────────────────────────
describe('login', () => {
  it('sets token state from getAccessToken after successful login', async () => {
    mockedLogin.mockResolvedValueOnce({
      success: true,
      token: 'login-tok',
      user: { email: 'user@test.com' },
    });
    mockedGetAccessToken.mockReturnValueOnce('login-tok');

    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('ready'),
    );

    await userEvent.click(screen.getByText('Login'));

    await waitFor(() =>
      expect(screen.getByTestId('token')).toHaveTextContent('login-tok'),
    );
    expect(screen.getByTestId('user')).toHaveTextContent('user@test.com');
  });

  it('writes user (not token) to localStorage', async () => {
    mockedLogin.mockResolvedValueOnce({
      success: true,
      user: { email: 'user@test.com' },
    });
    mockedGetAccessToken.mockReturnValueOnce('tok');

    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('ready'),
    );

    await userEvent.click(screen.getByText('Login'));
    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('user@test.com'),
    );

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toContain('user@test.com');
  });

  it('returns error result when login throws', async () => {
    mockedLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    let result: { success: boolean; error?: string } | undefined;
    const CapturingConsumer = () => {
      const { login } = useAuth();
      return (
        <button
          onClick={async () => {
            result = await login('a@b.com', 'wrong');
          }}
        >
          Login
        </button>
      );
    };

    render(
      <AuthProvider>
        <CapturingConsumer />
      </AuthProvider>,
    );
    await waitFor(() => screen.getByText('Login'));

    await userEvent.click(screen.getByText('Login'));
    await waitFor(() => expect(result).toBeDefined());
    expect(result?.success).toBe(false);
    expect(result?.error).toBe('Invalid credentials');
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────
describe('logout', () => {
  it('calls authAPI.logout and clears state', async () => {
    mockedRefresh.mockResolvedValueOnce('tok');
    mockedLogout.mockResolvedValue(undefined);
    localStorage.setItem('user', JSON.stringify({ email: 'a@b.com' }));

    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('token')).toHaveTextContent('tok'),
    );

    await userEvent.click(screen.getByText('Logout'));

    await waitFor(() =>
      expect(screen.getByTestId('token')).toHaveTextContent('null'),
    );
    expect(mockedLogout).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('user')).toBeNull();
  });
});

// ─── logoutAll ────────────────────────────────────────────────────────────────
describe('logoutAll', () => {
  it('calls authAPI.logoutAll and clears state', async () => {
    mockedRefresh.mockResolvedValueOnce('tok');
    mockedLogoutAll.mockResolvedValue(undefined);
    localStorage.setItem('user', JSON.stringify({ email: 'a@b.com' }));

    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId('token')).toHaveTextContent('tok'),
    );

    await userEvent.click(screen.getByText('LogoutAll'));

    await waitFor(() =>
      expect(screen.getByTestId('token')).toHaveTextContent('null'),
    );
    expect(mockedLogoutAll).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('user')).toBeNull();
  });
});

// ─── register ─────────────────────────────────────────────────────────────────
describe('register', () => {
  it('returns success when registration succeeds', async () => {
    const mockedRegister = vi.mocked(api.authAPI.register);
    mockedRegister.mockResolvedValueOnce({ success: true });

    let result: { success: boolean } | undefined;
    const RegConsumer = () => {
      const { register } = useAuth();
      return (
        <button
          onClick={async () => {
            result = await register('a@b.com', 'pass', 'Alice');
          }}
        >
          Register
        </button>
      );
    };

    render(
      <AuthProvider>
        <RegConsumer />
      </AuthProvider>,
    );
    await waitFor(() => screen.getByText('Register'));
    await userEvent.click(screen.getByText('Register'));
    await waitFor(() => expect(result).toBeDefined());
    expect(result?.success).toBe(true);
  });
});

// ─── useAuth guard ────────────────────────────────────────────────────────────
describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    const NoProvider = () => {
      useAuth();
      return null;
    };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<NoProvider />)).toThrow(
      'useAuth must be used within an AuthProvider',
    );
    spy.mockRestore();
  });

  it('provides googleLogin which delegates to authAPI', async () => {
    const mockedGoogleLogin = vi.mocked(api.authAPI.googleLogin);
    const GoogleConsumer = () => {
      const { googleLogin } = useAuth();
      return <button onClick={googleLogin}>Google</button>;
    };
    render(
      <AuthProvider>
        <GoogleConsumer />
      </AuthProvider>,
    );
    await waitFor(() => screen.getByText('Google'));
    await act(async () => {
      await userEvent.click(screen.getByText('Google'));
    });
    expect(mockedGoogleLogin).toHaveBeenCalledTimes(1);
  });
});
