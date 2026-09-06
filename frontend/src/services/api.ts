// SchoolMate API Client with Multi-Tenant Header Injection

const API_BASE = '/api/v1';

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

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Clear token and redirect to login if unauthorized
      this.clearAuth();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    if (!response.ok) {
      let errorMsg = `Error ${response.status}`;
      try {
        const errorJson = await response.json();
        errorMsg = errorJson.error || errorJson.message || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    return response.json();
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
