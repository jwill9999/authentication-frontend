import type { AuthResponse } from '../types/auth';

const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type JsonObject = Record<string, unknown>;

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    const data: unknown = await response.json();

    if (typeof data === 'object' && data !== null) {
      return data as T;
    }

    return null;
  } catch {
    return null;
  }
};

const getApiErrorMessage = (
  data: AuthResponse | null,
  fallbackMessage: string,
): string => {
  return data?.message || data?.error || fallbackMessage;
};

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseJsonSafely<AuthResponse>(response);

    if (!response.ok || !data?.success) {
      throw new Error(getApiErrorMessage(data, 'Login failed'));
    }

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJsonSafely<AuthResponse>(response);

    if (!response.ok || !data?.success) {
      throw new Error(getApiErrorMessage(data, 'Registration failed'));
    }

    return data;
  },

  googleLogin: (): void => {
    globalThis.location.href = `${API_URL}/auth/google`;
  },
};

export const protectedAPI = {
  getProfile: async (token: string): Promise<JsonObject> => {
    const response = await fetch(`${API_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const data = await parseJsonSafely<JsonObject>(response);
    return data ?? {};
  },

  getData: async (token: string): Promise<JsonObject> => {
    const response = await fetch(`${API_URL}/api/data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await parseJsonSafely<JsonObject>(response);
    return data ?? {};
  },
};
