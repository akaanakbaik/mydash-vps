const BASE_URL: string = '/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  correlationId: string;
  timestamp: string;
}

interface ApiError {
  success: false;
  error: { code: string; message: string; details: Record<string, unknown> | null };
  correlationId: string;
  timestamp: string;
}

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers,
      ...init,
    });

    const json = await res.json() as ApiResponse<T> | ApiError;

    if (!res.ok) {
      throw new Error(`HTTP ${String(res.status)}`);
    }

    return json as ApiResponse<T>;
  }

  get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path);
  }

  post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }

  put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  }

  patch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  }

  delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(BASE_URL);
