// Cliente API para comunicação com o backend NestJS
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.ibucadmprv.com.br';

class ApiClient {
  private baseUrl: string;
  private onError: ((error: Error) => void) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public setErrorHandler(handler: (error: Error) => void) {
    this.onError = handler;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { responseType?: 'json' | 'blob' } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = sessionStorage.getItem('auth_token');

    const isFormData = options.body instanceof FormData;

    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    if (!isFormData && options.body && typeof options.body === 'string') {
      // Para JSON definimos Content-Type explicitamente
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const { responseType = 'json', ...fetchOptions } = options;

    const config: RequestInit = {
      ...fetchOptions,
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);

      if (this.onError) {
        this.onError(error);
      }

      throw error;
    }

    if (responseType === 'blob') {
      return response.blob() as unknown as T;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return undefined as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestInit & { responseType?: 'json' | 'blob' }): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.post<T>(endpoint, formData);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
