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
  refreshAccessTokenDetailed,
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
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateToken = useCallback((newToken: string | null) => {
    setAccessToken(newToken); // keep module-level variable in sync
    setToken(newToken);
  }, []);

  // ── On mount: silent refresh to restore session from httpOnly cookie ──────
  useEffect(() => {
    const restoreSession = async (): Promise<void> => {
      const newToken = await refreshAccessToken();

      if (newToken) {
        updateToken(newToken);

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
  }, [updateToken]);

  // ── Proactive refresh at 4m mark to avoid a latency-inducing 401 ─────────
  useEffect(() => {
    if (!token) return;

    const REFRESH_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes

    const timerId = setInterval(async () => {
      const refreshResult = await refreshAccessTokenDetailed();

      if (refreshResult.outcome === 'success' && refreshResult.token) {
        updateToken(refreshResult.token);
      } else if (refreshResult.outcome === 'unauthorized') {
        // Refresh failed — clear session and let ProtectedRoute redirect
        updateToken(null);
        setUser(null);
        localStorage.removeItem('user');
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(timerId);
  }, [token, updateToken]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      try {
        const response = await authAPI.login(email, password);

        if (response.success) {
          const inMemoryToken = getAccessToken(); // set inside authAPI.login
          if (inMemoryToken) updateToken(inMemoryToken);

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
    [updateToken],
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

        const inMemoryToken = getAccessToken(); // set inside authAPI.register
        if (inMemoryToken) {
          updateToken(inMemoryToken);

          const fallbackUser: User = {
            email,
            ...(name?.trim() ? { name: name.trim() } : {}),
          };
          const userFromResponse: User = response.user ?? fallbackUser;
          setUser(userFromResponse);

          // Store only non-sensitive public user info — no token in localStorage
          localStorage.setItem('user', JSON.stringify(userFromResponse));
        }

        return { success: true };
      } catch (error) {
        return { success: false, error: getErrorMessage(error) };
      }
    },
    [updateToken],
  );

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    await authAPI.logout(); // revokes server-side session + clears httpOnly cookie
    updateToken(null);
    setUser(null);
    localStorage.removeItem('user');
  }, [updateToken]);

  // ── Logout all devices ────────────────────────────────────────────────────
  const logoutAll = useCallback(async (): Promise<void> => {
    await authAPI.logoutAll();
    updateToken(null);
    setUser(null);
    localStorage.removeItem('user');
  }, [updateToken]);

  const googleLogin = useCallback((): void => {
    authAPI.googleLogin();
  }, []);

  const contextValue: AuthContextValue = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      logoutAll,
      googleLogin,
      loading,
      setToken: updateToken,
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
      updateToken,
      setUser,
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
