import { API_CONFIG } from './config.js';
import type { ApiResponse, ApiErrorResponse, RequestConfig } from './types.js';
import { NetworkError, TimeoutError, AbortError, parseApiError } from './errors.js';

let correlationCounter = 0;

function generateCorrelationId(): string {
  correlationCounter += 1;
  return `req-${Date.now().toString(36)}-${correlationCounter.toString(36)}`;
}

function generateRequestId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

function buildUrl(base: string, path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${base}${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.pathname + url.search;
}

export interface Interceptor {
  onRequest?: (init: RequestInit, path: string) => RequestInit | Promise<RequestInit>;
  onResponse?: <T>(response: ApiResponse<T>, path: string) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onError?: (error: Error, path: string) => Error | Promise<Error>;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultTimeout: number;
  private readonly retryCount: number;
  private readonly retryDelay: number;
  private readonly retryStatuses: number[];
  private readonly interceptors: Interceptor[] = [];
  private activeControllers = new Map<string, AbortController>();

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.defaultTimeout = API_CONFIG.defaultTimeout;
    this.retryCount = API_CONFIG.retryCount;
    this.retryDelay = API_CONFIG.retryDelay;
    this.retryStatuses = [...API_CONFIG.retryStatuses];
  }

  addInterceptor(interceptor: Interceptor): void {
    this.interceptors.push(interceptor);
  }

  abortRequest(requestId: string): void {
    const controller = this.activeControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(requestId);
    }
  }

  abortAll(): void {
    for (const [id, controller] of this.activeControllers) {
      controller.abort();
      this.activeControllers.delete(id);
    }
  }

  private async runRequestInterceptors(init: RequestInit, path: string): Promise<RequestInit> {
    let modified = init;
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        modified = await interceptor.onRequest(modified, path);
      }
    }
    return modified;
  }

  private async runResponseInterceptors<T>(response: ApiResponse<T>, path: string): Promise<ApiResponse<T>> {
    let modified = response;
    for (const interceptor of this.interceptors) {
      if (interceptor.onResponse) {
        modified = await interceptor.onResponse(modified, path);
      }
    }
    return modified;
  }

  private async runErrorInterceptors(error: Error, path: string): Promise<Error> {
    let modified = error;
    for (const interceptor of this.interceptors) {
      if (interceptor.onError) {
        modified = await interceptor.onError(modified, path);
      }
    }
    return modified;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const correlationId = generateCorrelationId();
    const requestId = generateRequestId();
    const controller = new AbortController();
    this.activeControllers.set(requestId, controller);

    const timeoutMs = config?.timeout ?? this.defaultTimeout;
    const timeoutId = setTimeout(() => { controller.abort(); }, timeoutMs);

    try {
      const url = buildUrl(this.baseUrl, path, config?.params);

      let init: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Correlation-ID': correlationId,
          'X-Request-ID': requestId,
        },
        signal: config?.signal ?? controller.signal,
      };

      if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
        init.body = JSON.stringify(body);
      }

      if (config?.headers) {
        init.headers = { ...init.headers as Record<string, string>, ...config.headers };
      }

      init = await this.runRequestInterceptors(init, path);

      const startTime = Date.now();
      let lastError: Error | null = null;
      let attempts = 0;
      const maxAttempts = this.retryCount + 1;

      while (attempts < maxAttempts) {
        attempts += 1;
        lastError = null;

        try {
          const res = await fetch(url, { ...init });

          if (res.status === 204) {
            return {
              success: true,
              data: undefined as unknown as T,
              correlationId: res.headers.get('X-Correlation-ID') ?? correlationId,
              timestamp: new Date().toISOString(),
            };
          }

          const json = await res.json() as ApiResponse<T> | ApiErrorResponse;

          if (!res.ok) {
            const apiErrorResponse = json as ApiErrorResponse;
            const errorBody = apiErrorResponse.error;
            const apiError = parseApiError(
              res.status,
              errorBody,
              json.correlationId || correlationId,
            );

            const shouldRetry = this.retryStatuses.includes(res.status) && attempts < maxAttempts;
            if (shouldRetry) {
              await sleep(this.retryDelay * attempts);
              continue;
            }

            throw apiError;
          }

          const response = await this.runResponseInterceptors(json as ApiResponse<T>, path);
          return response;
        } catch (err) {
          if (err instanceof Error) {
            if (err.name === 'AbortError') {
              const isTimeout = Date.now() - startTime >= timeoutMs;
              throw isTimeout ? new TimeoutError(timeoutMs) : new AbortError();
            }
            lastError = err;
          } else {
            lastError = new Error(String(err));
          }

          if (attempts < maxAttempts && !(lastError instanceof NetworkError)) {
            await sleep(this.retryDelay * attempts);
          }
        }
      }

      const finalError = lastError ?? new NetworkError('Request failed after retries');
      throw await this.runErrorInterceptors(finalError, path);
    } finally {
      clearTimeout(timeoutId);
      this.activeControllers.delete(requestId);
    }
  }

  get<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, config);
  }

  post<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, config);
  }

  put<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, config);
  }

  patch<T>(path: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, body, config);
  }

  delete<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, config);
  }
}

export const apiClient = new ApiClient();
