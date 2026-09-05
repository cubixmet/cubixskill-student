import { env } from '../config/env';
import { API_ENDPOINTS } from '../config/apiEndpoints';

const API_BASE_URL = env.apiBaseUrl.replace(/\/+$/, '');
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');

export interface ApiErrorResponse {
  message?: string;
  error?: { message?: string; code?: string };
  detail?: string;
  code?: string;
  data?: any;
}

export class ApiError extends Error {
  status: number;
  data: any;
  code?: string;

  constructor(message: string, status: number, data?: any, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

export function resolveMediaUrl(url?: string | any | null): string {
  if (!url) return '';
  let rawStr = '';
  if (typeof url === 'string') {
    rawStr = url;
  } else if (typeof url === 'object') {
    rawStr = url.url || url.relative_path || url.file_url || url.path || '';
  }
  if (!rawStr || typeof rawStr !== 'string') return '';
  let trimmed = rawStr.trim();
  if (!trimmed || trimmed.toLowerCase() === 'none' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
    return '';
  }

  if (trimmed.includes('testserver')) {
    trimmed = trimmed.replace(/^https?:\/\/testserver/i, '');
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${BACKEND_ORIGIN}${cleanPath}`;
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  const legacyKeys = [
    'cubixskill_access_token',
    'cubixskill_refresh_token',
    'access',
    'refresh',
    'access_token',
    'refresh_token',
    'authToken',
    'jwt',
  ];
  legacyKeys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

// Shared in-flight refresh promise deduplication
let inFlightRefreshPromise: Promise<boolean> | null = null;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (endpoint.includes('/undefined') || endpoint.includes('/null')) {
    console.warn(`[apiClient] Blocked request with invalid URL parameter: "${endpoint}"`);
    throw new ApiError('Invalid URL parameter', 400);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    'X-Portal': 'student',
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers,
  };

  let response = await fetch(url, config);

  // If 401, attempt token refresh once centrally with deduplication via HttpOnly refresh cookie
  const isAuthEndpoint =
    endpoint.includes(API_ENDPOINTS.auth.refreshToken) ||
    endpoint.includes(API_ENDPOINTS.auth.login) ||
    endpoint.includes(API_ENDPOINTS.auth.logout);

  if (response.status === 401 && !isAuthEndpoint) {
    try {
      if (!inFlightRefreshPromise) {
        inFlightRefreshPromise = (async () => {
          try {
            const refreshRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.refreshToken}`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json', 'X-Portal': 'student' },
            });
            return refreshRes.ok;
          } catch {
            return false;
          } finally {
            inFlightRefreshPromise = null;
          }
        })();
      }

      const refreshed = await inFlightRefreshPromise;
      if (refreshed) {
        response = await fetch(url, config);
      } else {
        clearTokens();
      }
    } catch {
      clearTokens();
    }
  }

  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      // Non-JSON error
    }

    const message =
      errorData?.error?.message ||
      errorData?.message ||
      errorData?.detail ||
      `Request failed with status ${response.status}`;
    const code = errorData?.error?.code || errorData?.code;

    throw new ApiError(message, response.status, errorData, code);
  }

  if (response.status === 204) return {} as T;

  try {
    const data = await response.json();
    return data;
  } catch {
    return {} as T;
  }
}

// In-flight GET request promise deduplication map
const inFlightGetRequests = new Map<string, Promise<any>>();

// Authenticated Central API Client
export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const query = searchParams.toString();
      if (query) {
        url += (url.includes('?') ? '&' : '?') + query;
      }
    }

    const dedupeKey = `GET:${url}`;

    if (inFlightGetRequests.has(dedupeKey)) {
      return inFlightGetRequests.get(dedupeKey) as Promise<T>;
    }

    const promise = request<T>(url, { method: 'GET' }).finally(() => {
      inFlightGetRequests.delete(dedupeKey);
    });

    inFlightGetRequests.set(dedupeKey, promise);
    return promise;
  },

  post: <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  postForm: <T>(endpoint: string, formData: FormData) => {
    return request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  },

  put: <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch: <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete: <T>(endpoint: string) => {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};

// Unauthenticated Public API Client (for public website endpoints, preventing 401 loops)
export const publicApiClient = {
  get: <T>(endpoint: string, params?: Record<string, any>): Promise<T | null> => {
    let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const query = searchParams.toString();
      if (query) {
        url += (url.includes('?') ? '&' : '?') + query;
      }
    }
    return fetch(url, { credentials: 'include', method: 'GET', headers: { 'Content-Type': 'application/json' } })
      .then((res) => {
        if (!res.ok) return null;
        return res.json() as Promise<T>;
      })
      .catch(() => null);
  },
};
