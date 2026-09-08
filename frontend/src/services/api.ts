const RAW_API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || '';
const API_BASE = RAW_API_URL ? `${RAW_API_URL}/api/v1` : '/api/v1';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export class ApiClient {
  private static getToken(): string | null {
    return localStorage.getItem('schoolmate_token');
  }

  private static getTenantCode(): string {
    return localStorage.getItem('schoolmate_tenant_code') || 'OAKRIDGE';
  }

  static setToken(token: string) {
    localStorage.setItem('schoolmate_token', token);
  }

  static setTenantCode(code: string) {
    localStorage.setItem('schoolmate_tenant_code', code.toUpperCase());
  }

  static clearAuth() {
    localStorage.removeItem('schoolmate_token');
    localStorage.removeItem('schoolmate_user');
  }

  static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const tenantCode = this.getTenantCode();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-tenant-code': tenantCode,
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Clear token and notify subscribers
        this.clearAuth();
        window.dispatchEvent(new Event('auth:unauthorized'));
      }

      const contentType = response.headers.get('content-type') || '';
      const isHtml = contentType.includes('text/html');

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status} ${response.statusText}`;
        if (isHtml) {
          errorMsg = `API request to '${endpoint}' returned an HTML page (status ${response.status}). If deployed on Vercel, ensure VITE_API_URL points to the live backend server.`;
        } else {
          try {
            const errorJson = await response.json();
            errorMsg = errorJson.error || errorJson.message || errorMsg;
          } catch {}
        }
        throw new Error(errorMsg);
      }

      if (response.status === 204) {
        return {} as T;
      }

      if (isHtml) {
        throw new Error(
          `Unexpected HTML response from '${endpoint}'. Please ensure VITE_API_URL is properly configured.`
        );
      }

      return await response.json();
    } catch (err: any) {
      // Re-throw with helpful diagnostics if network connection failed
      if (err.name === 'TypeError' && err.message?.includes('fetch')) {
        throw new Error(
          `Unable to connect to SchoolMate backend (${API_BASE}). If on Render free tier, the server may be waking up from sleep. Please retry in a few seconds.`
        );
      }
      throw err;
    }
  }

  static get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T = any>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static put<T = any>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
