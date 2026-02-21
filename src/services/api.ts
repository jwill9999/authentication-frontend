import type { AuthResponse, RefreshResponse } from '../types/auth';

const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type JsonObject = Record<string, unknown>;

// ─── In-memory access token (never written to localStorage) ──────────────────
let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

// ─── Refresh queue — deduplicate concurrent 401s ──────────────────────────────
let refreshPromise: Promise<string | null> | null = null;

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
  data: AuthResponse | RefreshResponse | null,
  fallbackMessage: string,
): string => data?.message ?? data?.error ?? fallbackMessage;

// ─── Core refresh logic ───────────────────────────────────────────────────────
export const refreshAccessToken = (): Promise<string | null> => {
  // Deduplicate: reuse in-flight promise if one already exists
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // send httpOnly refresh cookie
      });

      const data = await parseJsonSafely<RefreshResponse>(response);

      if (!response.ok || !data?.token) {
        return null;
      }

      accessToken = data.token;
      return accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
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
    const newToken = await refreshAccessToken();
    if (!newToken) return response; // refresh failed — caller handles redirect

    const retryHeaders = new Headers(options.headers);
    retryHeaders.set('Authorization', `Bearer ${newToken}`);

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
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // must send cookie so server can revoke session
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });
    accessToken = null;
  },

  logoutAll: async (): Promise<void> => {
    await fetch(`${API_URL}/auth/logout-all`, {
      method: 'POST',
      credentials: 'include',
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });
    accessToken = null;
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
