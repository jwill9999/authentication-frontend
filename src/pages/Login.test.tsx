import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

// ── AuthContext mock ──────────────────────────────────────────────────────────
const mockLogin = vi.fn();
const mockGoogleLogin = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    googleLogin: mockGoogleLogin,
    user: null,
    token: null,
    logout: vi.fn(),
    logoutAll: vi.fn(),
    register: vi.fn(),
    isLoading: false,
  }),
}));

// ── Router mock ───────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    // useLocation is NOT mocked — MemoryRouter provides the real implementation
    // so ?registered=1 in initialEntries is visible to the component
  };
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderLogin(search = '') {
  // Override useLocation search string when needed via the route
  return render(
    <MemoryRouter initialEntries={[`/login${search}`]}>
      <Login />
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form', () => {
    renderLogin();
    expect(
      screen.getByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows registration success banner when ?registered=1 in URL', () => {
    renderLogin('?registered=1');
    expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
  });

  it('shows email required error when submitting with empty email', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /^login$/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('shows invalid email error for malformed email', async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email');
    // Use fireEvent.submit to bypass jsdom HTML5 type="email" constraint validation
    fireEvent.submit(
      screen.getByRole('button', { name: /^login$/i }).closest('form')!,
    );
    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
  });

  it('shows password required error when submitting with empty password', async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: /^login$/i }));
    expect(
      await screen.findByText(/password is required/i),
    ).toBeInTheDocument();
  });

  it('navigates to /dashboard on successful login', async () => {
    mockLogin.mockResolvedValue({ success: true });
    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /^login$/i }));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard'),
    );
  });

  it('shows API error message on failed login', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    });
    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /^login$/i }));
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('shows fallback error when login result has no error message', async () => {
    mockLogin.mockResolvedValue({ success: false });
    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /^login$/i }));
    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
  });

  it('shows unexpected error message when login throws', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));
    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /^login$/i }));
    expect(
      await screen.findByText(/unexpected error occurred/i),
    ).toBeInTheDocument();
  });

  it('disables button and shows loading text while submitting', async () => {
    // Login never resolves — keeps the form in loading state
    mockLogin.mockReturnValue(new Promise(() => {}));
    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /^login$/i }));
    expect(
      await screen.findByRole('button', { name: /logging in/i }),
    ).toBeDisabled();
  });

  it('calls googleLogin when clicking Continue with Google', async () => {
    renderLogin();
    await userEvent.click(
      screen.getByRole('button', { name: /continue with google/i }),
    );
    expect(mockGoogleLogin).toHaveBeenCalledTimes(1);
  });

  it('renders a link to the register page', () => {
    renderLogin();
    const link = screen.getByRole('link', { name: /create an account/i });
    expect(link).toHaveAttribute('href', '/register');
  });
});
