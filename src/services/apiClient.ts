const API_BASE = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL || 'http://localhost:8000';

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

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

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
