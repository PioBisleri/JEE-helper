const RAW_API_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL;

if (!RAW_API_URL && import.meta.env.PROD) {
  throw new Error(
    '[Nexus JEE] VITE_API_URL is not set. Configure it in your hosting provider (Vercel → Settings → Environment Variables) and redeploy.'
  );
}

const API_BASE = RAW_API_URL || 'http://localhost:8000';

let authToken: string | null = localStorage.getItem('nexus_auth_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('nexus_auth_token', token);
  } else {
    localStorage.removeItem('nexus_auth_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

export function isOnline(): boolean {
  return navigator.onLine;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${path}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(
      `[Nexus JEE] Network request failed.\n` +
      `  URL: ${url}\n` +
      `  Method: ${fetchOptions.method || 'GET'}\n` +
      `  Reason: ${reason}\n` +
      `  API_BASE: ${API_BASE}\n` +
      `  This usually means: (a) backend is down, (b) CORS preflight blocked, (c) browser offline, or (d) service worker serving stale JS.`
    );
    throw new Error(
      `Network request failed (${fetchOptions.method || 'GET'} ${path}): ${reason}. ` +
      `Check the browser console for the full URL and diagnostic info.`
    );
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorBody.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
