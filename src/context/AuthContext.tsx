import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authAPI } from '../services/api';
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
  logout: () => void;
  googleLogin: () => void;
  setToken: (newToken: string | null) => void;
  setUser: (newUser: User | null) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

const isUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const maybeUser = value as Partial<User>;
  return typeof maybeUser.email === 'string';
};

export const AuthProvider = ({
  children,
}: AuthProviderProps): React.JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      // Initialization from localStorage on mount is intentional
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(storedToken);

      try {
        const parsedStoredUser: unknown = JSON.parse(storedUser);
        if (isUser(parsedStoredUser)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setUser(parsedStoredUser);
        }
      } catch {
        localStorage.removeItem('user');
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthActionResult> => {
    try {
      const response = await authAPI.login(email, password);

      if (response.success && response.token) {
        const userFromResponse: User = response.user ?? { email };

        setToken(response.token);
        setUser(userFromResponse);

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userFromResponse));

        return { success: true };
      }

      return {
        success: false,
        error:
          response.error || response.message || 'Invalid response from server',
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<AuthActionResult> => {
    try {
      const response = await authAPI.register(email, password, name);

      if (!response.success) {
        return {
          success: false,
          error: response.error || response.message || 'Registration failed',
        };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const googleLogin = (): void => {
    authAPI.googleLogin();
  };

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      googleLogin,
      loading,
      setToken,
      setUser,
    }),
    [googleLogin, loading, login, logout, register, token, user],
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
