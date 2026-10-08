import { supabase } from '@/lib/supabase/client';
import { CONFIG } from '@/constants/config';

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  isNetworkError: boolean;

  constructor(message: string, status: number = 0, code?: string, details?: unknown, isNetworkError: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.isNetworkError = isNetworkError;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  _isRetry?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private onUnauthorizedCallback: (() => void) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  public setOnUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let url = `${this.baseUrl}${cleanEndpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `${url.includes('?') ? '&' : '?'}${queryString}`;
      }
    }

    return url;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        return null;
      }
      return data.session.access_token;
    } catch {
      return null;
    }
  }

  private async refreshSession(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) {
        return null;
      }
      return data.session.access_token;
    } catch {
      return null;
    }
  }

  public async request<T>(endpoint: string, options: RequestOptions & { body?: unknown } = {}): Promise<T> {
    const { params, skipAuth, _isRetry, body, headers: customHeaders, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(customHeaders as Record<string, string>),
    };

    if (!skipAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...fetchOptions,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr: unknown) {
      const message =
        networkErr instanceof Error ? networkErr.message : 'Network unavailable. Please check your connection.';
      throw new ApiError(
        'Network connection failed. Please check your internet connectivity.',
        0,
        'NETWORK_ERROR',
        networkErr,
        true
      );
    }

    // Centralized 401 Unauthorized handling with single refresh retry (prevents infinite loop)
    if (response.status === 401 && !_isRetry && !skipAuth) {
      const newToken = await this.refreshSession();
      if (newToken) {
        return this.request<T>(endpoint, {
          ...options,
          _isRetry: true,
        });
      } else {
        if (this.onUnauthorizedCallback) {
          this.onUnauthorizedCallback();
        }
        throw new ApiError('Your session has expired. Please sign in again.', 401, 'UNAUTHORIZED');
      }
    }

    if (response.status === 401) {
      if (this.onUnauthorizedCallback) {
        this.onUnauthorizedCallback();
      }
      throw new ApiError('Unauthorized. Please sign in.', 401, 'UNAUTHORIZED');
    }

    if (response.status === 403) {
      throw new ApiError('Access forbidden. You do not have permission for this resource.', 403, 'FORBIDDEN');
    }

    if (response.status === 404) {
      throw new ApiError('Resource not found.', 404, 'NOT_FOUND');
    }

    if (response.status === 429) {
      throw new ApiError('Too many requests. Please slow down and try again.', 429, 'RATE_LIMITED');
    }

    if (response.status >= 500) {
      let serverMsg = 'Internal server error. Please try again later.';
      try {
        const errJson = await response.json();
        if (errJson.error || errJson.message) {
          serverMsg = errJson.error || errJson.message;
        }
      } catch {
        // use default message
      }
      throw new ApiError(serverMsg, response.status, 'SERVER_ERROR');
    }

    // Success response parsing
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(CONFIG.API_BASE_URL);
