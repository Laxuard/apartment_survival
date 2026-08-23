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
});

// Request Interceptor: Attach Auth Token if JWT is used in addition to cookies
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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

    if (status === 401) {
      console.warn('Session expired or unauthorized request (401)');
    }

    return Promise.reject(new Error(message));
  }
);
