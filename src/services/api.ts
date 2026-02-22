import type {
  ApiMessageFields,
  AuthResponse,
  RefreshResponse,
} from '../types/auth';

const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type JsonObject = Record<string, unknown>;
type RefreshOutcome =
  | 'success'
  | 'unauthorized'
  | 'server_error'
  | 'network_error'
  | 'invalid_response';

export interface RefreshAccessTokenResult {
  token: string | null;
  outcome: RefreshOutcome;
  statusCode?: number;
}

// ─── In-memory access token (never written to localStorage) ──────────────────
let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

// ─── Refresh queue — deduplicate concurrent 401s ──────────────────────────────
let refreshPromise: Promise<RefreshAccessTokenResult> | null = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    const data: unknown = await response.json();
    if (typeof data === 'object' && data !== null) return data as T;
    return null;
  } catch {
    return null;
  }
};

const getApiErrorMessage = (
  data: ApiMessageFields | null,
  fallbackMessage: string,
): string => {
  // Convention: `message` is canonical; `error` is legacy fallback.
  return data?.message ?? data?.error ?? fallbackMessage;
};

// ─── Core refresh logic ───────────────────────────────────────────────────────
export const refreshAccessTokenDetailed =
  (): Promise<RefreshAccessTokenResult> => {
    // Deduplicate: reuse in-flight promise if one already exists
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async (): Promise<RefreshAccessTokenResult> => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // send httpOnly refresh cookie
        });

        const data = await parseJsonSafely<RefreshResponse>(response);

        if (!response.ok) {
          return {
            token: null,
            outcome:
              response.status === 401 || response.status === 403
                ? 'unauthorized'
                : 'server_error',
            statusCode: response.status,
          };
        }

        if (!data?.token) {
          return {
            token: null,
            outcome: 'invalid_response',
            statusCode: response.status,
          };
        }

        accessToken = data.token;
        return {
          token: data.token,
          outcome: 'success',
          statusCode: response.status,
        };
      } catch {
        return {
          token: null,
          outcome: 'network_error',
        };
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

export const refreshAccessToken = (): Promise<string | null> => {
  return refreshAccessTokenDetailed().then((result) => result.token);
};

// ─── Fetch wrapper with auto-refresh + single retry on 401 ───────────────────
interface FetchOptions extends RequestInit {
  _retry?: boolean;
}

const fetchWithAuth = async (
  url: string,
  options: FetchOptions = {},
): Promise<Response> => {
  const headers = new Headers(options.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  // On 401, attempt one refresh then retry the original request
  if (response.status === 401 && !options._retry) {
    const refreshResult = await refreshAccessTokenDetailed();
    if (refreshResult.outcome !== 'success' || !refreshResult.token) {
      return response;
    }

    const retryHeaders = new Headers(options.headers);
    retryHeaders.set('Authorization', `Bearer ${refreshResult.token}`);

    return fetch(url, {
      ...options,
      _retry: true,
      credentials: 'include',
      headers: retryHeaders,
    } as FetchOptions);
  }

  return response;
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include', // receive httpOnly refresh cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseJsonSafely<AuthResponse>(response);

    if (!response.ok || !data?.success) {
      throw new Error(getApiErrorMessage(data, 'Login failed'));
    }

    // Store access token in memory only — never in localStorage
    if (data.token) accessToken = data.token;

    return data;
  },

  register: async (
    email: string,
    password: string,
    name: string,
  ): Promise<AuthResponse> => {
    const payload = {
      email,
      password,
      ...(name?.trim() ? { name: name.trim() } : {}),
    };

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await parseJsonSafely<AuthResponse>(response);

    if (!response.ok || !data?.success) {
      throw new Error(getApiErrorMessage(data, 'Registration failed'));
    }

    // Some backends issue a token on register too — store it if present
    if (data.token) accessToken = data.token;

    return data;
  },

  googleLogin: (): void => {
    globalThis.location.href = `${API_URL}/auth/google`;
  },

  logout: async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // must send cookie so server can revoke session
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      });
    } catch (error) {
      console.error('Failed to revoke server session during logout', error);
    } finally {
      accessToken = null;
    }
  },

  logoutAll: async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/auth/logout-all`, {
        method: 'POST',
        credentials: 'include',
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      });
    } catch (error) {
      console.error(
        'Failed to revoke server sessions during logout-all',
        error,
      );
    } finally {
      accessToken = null;
    }
  },
};

// ─── Protected API ────────────────────────────────────────────────────────────
export const protectedAPI = {
  getProfile: async (): Promise<JsonObject> => {
    const response = await fetchWithAuth(`${API_URL}/api/profile`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    const data = await parseJsonSafely<JsonObject>(response);
    return data ?? {};
  },

  getData: async (): Promise<JsonObject> => {
    const response = await fetchWithAuth(`${API_URL}/api/data`);
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await parseJsonSafely<JsonObject>(response);
    return data ?? {};
  },
};
