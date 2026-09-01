import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

/**
 * Spring Boot ProblemDetails structure
 */
interface ProblemDetailResponse {
  title?: string;
  detail?: string;
  message?: string;
  status?: number;
  errors?: Record<string, string>;
  invalid_params?: Record<string, string>;
}

/**
 * Base Axios Client configured for Spring Boot Backend.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'API-Version': '1.0',
  },
  timeout: 10000,
  withCredentials: true, // Enables JSESSIONID cookie persistence
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

/**
 * Helper to retrieve cookie value by name
 */
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : undefined;
}

// Request Interceptor: Attach X-XSRF-TOKEN for state-changing operations
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const xsrfToken = getCookie('XSRF-TOKEN');
      if (xsrfToken && config.headers) {
        config.headers['X-XSRF-TOKEN'] = xsrfToken;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Standardized Spring Boot ProblemDetails Formatter
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetailResponse>) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const message =
      data?.detail ||
      data?.message ||
      data?.title ||
      error.message ||
      'An unexpected network error occurred';

    const errObj = new Error(message) as Error & {
      status?: number;
      response?: AxiosError['response'];
      errors?: Record<string, string>;
    };
    errObj.status = status;
    errObj.response = error.response;
    errObj.errors = data?.invalid_params || data?.errors;

    if (status === 401) {
      console.warn('Session expired or unauthorized request (401)');
    }

    return Promise.reject(errObj);
  }
);

