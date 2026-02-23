import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  refreshAccessToken,
  refreshAccessTokenDetailed,
  setAccessToken,
  getAccessToken,
  authAPI,
  ApiHttpError,
  protectedAPI,
} from './api';

// ─── Mock fetch globally ──────────────────────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const okResponse = (body: unknown) => ({
  ok: true,
  status: 200,
  json: async () => body,
});

const errorResponse = (body: unknown, status = 401) => ({
  ok: false,
  status,
  json: async () => body,
});

beforeEach(() => {
  mockFetch.mockReset();
  setAccessToken(null);
});

// ─── refreshAccessToken ───────────────────────────────────────────────────────
describe('refreshAccessToken', () => {
  it('returns token and stores it in memory on success', async () => {
    mockFetch.mockResolvedValueOnce(
      okResponse({ success: true, token: 'new-token' }),
    );
    const token = await refreshAccessToken();
    expect(token).toBe('new-token');
    expect(getAccessToken()).toBe('new-token');
  });

  it('returns null when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse({ success: false }));
    expect(await refreshAccessToken()).toBeNull();
  });

  it('returns null when response has no token field', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({ success: true }));
    expect(await refreshAccessToken()).toBeNull();
  });

  it('returns null on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    expect(await refreshAccessToken()).toBeNull();
  });

  it('sends POST to /auth/refresh with credentials: include', async () => {
    mockFetch.mockResolvedValueOnce(
      okResponse({ success: true, token: 'tok' }),
    );
    await refreshAccessToken();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh'),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });

  it('deduplicates concurrent calls — only one fetch is made', async () => {
    let resolveRefresh!: (v: unknown) => void;
    const pending = new Promise((res) => {
      resolveRefresh = res;
    });
    mockFetch.mockReturnValueOnce(pending);

    const p1 = refreshAccessToken();
    const p2 = refreshAccessToken();

    resolveRefresh(okResponse({ success: true, token: 'shared' }));

    const [t1, t2] = await Promise.all([p1, p2]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(t1).toBe('shared');
    expect(t2).toBe('shared');
  });

  it('resets the queue after completion so next call is fresh', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse({ success: true, token: 'first' }))
      .mockResolvedValueOnce(okResponse({ success: true, token: 'second' }));

    await refreshAccessToken();
    const t2 = await refreshAccessToken();
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(t2).toBe('second');
  });

  it('returns detailed unauthorized outcome when refresh token is invalid/expired', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse({ success: false }, 401));
    await expect(refreshAccessTokenDetailed()).resolves.toMatchObject({
      token: null,
      outcome: 'unauthorized',
      statusCode: 401,
    });
  });

  it('returns detailed server_error outcome for non-auth server failures', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse({ success: false }, 500));
    await expect(refreshAccessTokenDetailed()).resolves.toMatchObject({
      token: null,
      outcome: 'server_error',
      statusCode: 500,
    });
  });

  it('returns detailed network_error outcome on fetch rejection', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    await expect(refreshAccessTokenDetailed()).resolves.toMatchObject({
      token: null,
      outcome: 'network_error',
    });
  });

  it('returns detailed invalid_response outcome when token is missing', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({ success: true }));
    await expect(refreshAccessTokenDetailed()).resolves.toMatchObject({
      token: null,
      outcome: 'invalid_response',
      statusCode: 200,
    });
  });
});

// ─── authAPI.login ────────────────────────────────────────────────────────────
describe('authAPI.login', () => {
  it('stores access token in memory on success', async () => {
    mockFetch.mockResolvedValueOnce(
      okResponse({ success: true, token: 'login-tok' }),
    );
    await authAPI.login('a@b.com', 'pass');
    expect(getAccessToken()).toBe('login-tok');
  });

  it('sends POST /auth/login with credentials: include', async () => {
    mockFetch.mockResolvedValueOnce(
      okResponse({ success: true, token: 'tok' }),
    );
    await authAPI.login('a@b.com', 'pass');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });

  it('throws the server error message on failure', async () => {
    mockFetch.mockResolvedValueOnce(
      errorResponse({ success: false, message: 'Invalid credentials' }, 401),
    );
    await expect(authAPI.login('a@b.com', 'wrong')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('throws fallback message when server gives no message', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse({}, 500));
    await expect(authAPI.login('a@b.com', 'pass')).rejects.toThrow(
      'Login failed',
    );
  });

  it('does NOT write the token to localStorage', async () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    mockFetch.mockResolvedValueOnce(
      okResponse({ success: true, token: 'tok' }),
    );
    await authAPI.login('a@b.com', 'pass');
    expect(spy).not.toHaveBeenCalledWith('token', expect.anything());
    spy.mockRestore();
  });
});

// ─── authAPI.register ─────────────────────────────────────────────────────────
describe('authAPI.register', () => {
  it('returns success response', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({ success: true }));
    const res = await authAPI.register('a@b.com', 'pass', 'Alice');
    expect(res.success).toBe(true);
  });

  it('sends POST /auth/register with credentials: include', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({ success: true }));
    await authAPI.register('a@b.com', 'pass', 'Alice');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });

  it('omits name from payload if blank', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({ success: true }));
    await authAPI.register('a@b.com', 'pass', '   ');
    const body = JSON.parse(
      (mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string,
    );
    expect(body).not.toHaveProperty('name');
  });

  it('throws the server error message on failure', async () => {
    mockFetch.mockResolvedValueOnce(
      errorResponse({ success: false, message: 'Email taken' }, 409),
    );
    await expect(authAPI.register('a@b.com', 'pass', 'A')).rejects.toThrow(
      'Email taken',
    );
  });
});

// ─── authAPI.logout ───────────────────────────────────────────────────────────
describe('authAPI.logout', () => {
  it('calls POST /auth/logout with credentials: include', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({}));
    await authAPI.logout();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/logout'),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });

  it('clears the in-memory access token', async () => {
    setAccessToken('existing');
    mockFetch.mockResolvedValueOnce(okResponse({}));
    await authAPI.logout();
    expect(getAccessToken()).toBeNull();
  });

  it('sends Authorization header when token present', async () => {
    setAccessToken('bearer-token');
    mockFetch.mockResolvedValueOnce(okResponse({}));
    await authAPI.logout();
    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer bearer-token',
    );
  });

  it('does not throw on network error and still clears token', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    setAccessToken('existing');
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(authAPI.logout()).resolves.toBeUndefined();
    expect(getAccessToken()).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to revoke server session during logout',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});

// ─── authAPI.logoutAll ────────────────────────────────────────────────────────
describe('authAPI.logoutAll', () => {
  it('calls POST /auth/logout-all with credentials: include', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({}));
    await authAPI.logoutAll();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/logout-all'),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });

  it('clears the in-memory access token', async () => {
    setAccessToken('existing');
    mockFetch.mockResolvedValueOnce(okResponse({}));
    await authAPI.logoutAll();
    expect(getAccessToken()).toBeNull();
  });

  it('does not throw on network error and still clears token', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    setAccessToken('existing');
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(authAPI.logoutAll()).resolves.toBeUndefined();
    expect(getAccessToken()).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to revoke server sessions during logout-all',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});

// ─── protectedAPI.getProfile ──────────────────────────────────────────────────
describe('protectedAPI.getProfile', () => {
  it('returns profile data on success', async () => {
    setAccessToken('tok');
    mockFetch.mockResolvedValueOnce(okResponse({ id: '1', email: 'a@b.com' }));
    expect(await protectedAPI.getProfile()).toEqual({
      id: '1',
      email: 'a@b.com',
    });
  });

  it('sends Authorization header containing the access token', async () => {
    setAccessToken('my-token');
    mockFetch.mockResolvedValueOnce(okResponse({}));
    await protectedAPI.getProfile();
    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = opts.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer my-token');
  });

  it('sends credentials: include', async () => {
    setAccessToken('tok');
    mockFetch.mockResolvedValueOnce(okResponse({}));
    await protectedAPI.getProfile();
    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(opts.credentials).toBe('include');
  });

  it('auto-refreshes on 401 and retries the request', async () => {
    setAccessToken('expired');
    mockFetch
      .mockResolvedValueOnce(errorResponse({}, 401)) // original → 401
      .mockResolvedValueOnce(okResponse({ success: true, token: 'new-tok' })) // refresh
      .mockResolvedValueOnce(okResponse({ id: '42' })); // retry

    const data = await protectedAPI.getProfile();
    expect(data).toEqual({ id: '42' });
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('cancels original 401 response body before retrying after refresh', async () => {
    setAccessToken('expired');

    const cancelBody = vi.fn().mockResolvedValue(undefined);
    const unauthorizedResponse = {
      ok: false,
      status: 401,
      json: async () => ({}),
      body: {
        cancel: cancelBody,
      },
    };

    mockFetch
      .mockResolvedValueOnce(unauthorizedResponse) // original → 401
      .mockResolvedValueOnce(okResponse({ success: true, token: 'new-tok' })) // refresh
      .mockResolvedValueOnce(okResponse({ id: '42' })); // retry

    const data = await protectedAPI.getProfile();

    expect(data).toEqual({ id: '42' });
    expect(cancelBody).toHaveBeenCalledTimes(1);
    const cancelOrder = cancelBody.mock.invocationCallOrder[0];
    const retryFetchOrder = mockFetch.mock.invocationCallOrder[2];

    expect(cancelOrder).toBeDefined();
    expect(retryFetchOrder).toBeDefined();

    if (cancelOrder === undefined || retryFetchOrder === undefined) {
      throw new Error('Expected call-order entries for cancel and retry calls');
    }

    expect(cancelOrder).toBeLessThan(retryFetchOrder);
  });

  it('throws when refresh also fails (max 1 retry)', async () => {
    setAccessToken('expired');
    mockFetch
      .mockResolvedValueOnce(errorResponse({}, 401)) // original → 401
      .mockResolvedValueOnce(errorResponse({}, 401)); // refresh → 401 (fails)
    const error = await protectedAPI.getProfile().catch((err) => err);
    expect(error).toBeInstanceOf(ApiHttpError);
    expect(error).toMatchObject({
      message: 'Failed to fetch profile',
      status: 401,
    });
  });

  it('throws when initial response is a non-401 error and preserves status', async () => {
    setAccessToken('tok');
    mockFetch.mockResolvedValueOnce(errorResponse({}, 500));
    const error = await protectedAPI.getProfile().catch((err) => err);
    expect(error).toBeInstanceOf(ApiHttpError);
    expect(error).toMatchObject({
      message: 'Failed to fetch profile',
      status: 500,
    });
  });
});

// ─── protectedAPI.getData ─────────────────────────────────────────────────────
describe('protectedAPI.getData', () => {
  it('returns data on success', async () => {
    setAccessToken('tok');
    mockFetch.mockResolvedValueOnce(okResponse({ items: [1, 2] }));
    expect(await protectedAPI.getData()).toEqual({ items: [1, 2] });
  });

  it('throws on failure and preserves status', async () => {
    setAccessToken('tok');
    mockFetch.mockResolvedValueOnce(errorResponse({}, 403));
    const error = await protectedAPI.getData().catch((err) => err);
    expect(error).toBeInstanceOf(ApiHttpError);
    expect(error).toMatchObject({
      message: 'Failed to fetch data',
      status: 403,
    });
  });
});
