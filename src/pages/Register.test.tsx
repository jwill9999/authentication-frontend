import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';

// ── AuthContext mock ──────────────────────────────────────────────────────────
const mockRegister = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    login: vi.fn(),
    googleLogin: vi.fn(),
    user: null,
    token: null,
    logout: vi.fn(),
    logoutAll: vi.fn(),
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
  };
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Register />
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the registration form', () => {
    renderRegister();
    expect(
      screen.getByRole('heading', { name: /create account/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /register/i }),
    ).toBeInTheDocument();
  });

  it('shows email required error when submitting without email', async () => {
    renderRegister();
    await userEvent.click(screen.getByRole('button', { name: /^register$/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('shows invalid email error for malformed email', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText(/email/i), 'bad-email');
    // fireEvent.submit bypasses jsdom HTML5 type="email" constraint validation
    fireEvent.submit(screen.getByLabelText(/email/i).closest('form')!);
    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
  });

  it('shows password required error when submitting without password', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    fireEvent.submit(screen.getByLabelText(/email/i).closest('form')!);
    expect(
      await screen.findByText(/password is required/i),
    ).toBeInTheDocument();
  });

  it('shows password complexity error for a weak password', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'weakpass');
    // fireEvent.submit to ensure form submits regardless of HTML5 constraints
    fireEvent.submit(screen.getByLabelText(/email/i).closest('form')!);
    // The static hint also says "at least 8 characters" — match the error-specific prefix
    expect(
      await screen.findByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
  });

  it('navigates to /login?registered=1 on successful registration', async () => {
    mockRegister.mockResolvedValue({ success: true });
    renderRegister();
    await userEvent.type(screen.getByLabelText(/name/i), 'Alice');
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password1');
    await userEvent.click(screen.getByRole('button', { name: /^register$/i }));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/login?registered=1', {
        replace: true,
      }),
    );
  });

  it('calls register with name, email, and password', async () => {
    mockRegister.mockResolvedValue({ success: true });
    renderRegister();
    await userEvent.type(screen.getByLabelText(/name/i), 'Bob');
    await userEvent.type(screen.getByLabelText(/email/i), 'bob@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Secure99');
    await userEvent.click(screen.getByRole('button', { name: /^register$/i }));
    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith(
        'bob@example.com',
        'Secure99',
        'Bob',
      ),
    );
  });

  it('shows API error message on failed registration', async () => {
    mockRegister.mockResolvedValue({
      success: false,
      error: 'Email already in use',
    });
    renderRegister();
    await userEvent.type(screen.getByLabelText(/email/i), 'taken@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password1');
    await userEvent.click(screen.getByRole('button', { name: /^register$/i }));
    expect(
      await screen.findByText(/email already in use/i),
    ).toBeInTheDocument();
  });

  it('shows fallback error when register result has no error message', async () => {
    mockRegister.mockResolvedValue({ success: false });
    renderRegister();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password1');
    await userEvent.click(screen.getByRole('button', { name: /^register$/i }));
    expect(await screen.findByText(/registration failed/i)).toBeInTheDocument();
  });

  it('shows unexpected error message when register throws', async () => {
    mockRegister.mockRejectedValue(new Error('Network error'));
    renderRegister();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password1');
    await userEvent.click(screen.getByRole('button', { name: /^register$/i }));
    expect(
      await screen.findByText(/unexpected error occurred/i),
    ).toBeInTheDocument();
  });

  it('disables button and shows loading text while submitting', async () => {
    mockRegister.mockReturnValue(new Promise(() => {}));
    renderRegister();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password1');
    await userEvent.click(screen.getByRole('button', { name: /^register$/i }));
    expect(
      await screen.findByRole('button', { name: /registering/i }),
    ).toBeDisabled();
  });

  it('renders a link back to the login page', () => {
    renderRegister();
    const link = screen.getByRole('link', { name: /login/i });
    expect(link).toHaveAttribute('href', '/login');
  });
});
