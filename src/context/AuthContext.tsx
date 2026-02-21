import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  authAPI,
  refreshAccessToken,
  setAccessToken,
  getAccessToken,
} from '../services/api';
import type { AuthActionResult, User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  googleLogin: () => void;
  setToken: (newToken: string | null) => void;
  setUser: (newUser: User | null) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

const isUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value === null) return false;
  return typeof (value as Partial<User>).email === 'string';
};

export const AuthProvider = ({
  children,
}: AuthProviderProps): React.JSX.Element => {
  // Access token lives only in memory (mirrored from api.ts module variable)
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((newToken: string | null) => {
    setAccessToken(newToken); // keep module-level variable in sync
    setTokenState(newToken);
  }, []);

  // ── On mount: silent refresh to restore session from httpOnly cookie ──────
  useEffect(() => {
    const restoreSession = async (): Promise<void> => {
      const newToken = await refreshAccessToken();

      if (newToken) {
        setTokenState(newToken);

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed: unknown = JSON.parse(storedUser);
            if (isUser(parsed)) setUser(parsed);
          } catch {
            localStorage.removeItem('user');
          }
        }
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

  // ── Proactive refresh at 4m mark to avoid a latency-inducing 401 ─────────
  useEffect(() => {
    if (!token) return;

    const REFRESH_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes

    const timerId = setInterval(async () => {
      const newToken = await refreshAccessToken();
      if (newToken) {
        setTokenState(newToken);
      } else {
        // Refresh failed — clear session and let ProtectedRoute redirect
        setToken(null);
        setUser(null);
        localStorage.removeItem('user');
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(timerId);
  }, [token, setToken]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      try {
        const response = await authAPI.login(email, password);

        if (response.success) {
          const inMemoryToken = getAccessToken(); // set inside authAPI.login
          if (inMemoryToken) setTokenState(inMemoryToken);

          const userFromResponse: User = response.user ?? { email };
          setUser(userFromResponse);

          // Store only non-sensitive public user info — no token in localStorage
          localStorage.setItem('user', JSON.stringify(userFromResponse));

          return { success: true };
        }

        return {
          success: false,
          error:
            response.error ??
            response.message ??
            'Invalid response from server',
        };
      } catch (error) {
        return { success: false, error: getErrorMessage(error) };
      }
    },
    [],
  );

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
    ): Promise<AuthActionResult> => {
      try {
        const response = await authAPI.register(email, password, name);

        if (!response.success) {
          return {
            success: false,
            error: response.error ?? response.message ?? 'Registration failed',
          };
        }

        return { success: true };
      } catch (error) {
        return { success: false, error: getErrorMessage(error) };
      }
    },
    [],
  );

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    await authAPI.logout(); // revokes server-side session + clears httpOnly cookie
    setToken(null);
    setUser(null);
    localStorage.removeItem('user');
  }, [setToken]);

  // ── Logout all devices ────────────────────────────────────────────────────
  const logoutAll = useCallback(async (): Promise<void> => {
    await authAPI.logoutAll();
    setToken(null);
    setUser(null);
    localStorage.removeItem('user');
  }, [setToken]);

  const googleLogin = useCallback((): void => {
    authAPI.googleLogin();
  }, []);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      logoutAll,
      googleLogin,
      loading,
      setToken,
      setUser,
    }),
    [
      user,
      token,
      login,
      register,
      logout,
      logoutAll,
      googleLogin,
      loading,
      setToken,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
