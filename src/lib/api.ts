import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fabphotopic.com';
export const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginationData {
  current_page: number;
  total_pages: number;
  total_items?: number;   // generic fallback
  total_users?: number;   // users API specific
  per_page: number;
}

// Create axios instance
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized - token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              token: refreshToken,
            });

            const { token } = response.data.data;
            localStorage.setItem('auth_token', token);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createApiInstance();

// Generic API request wrapper
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api(config);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Server responded with error status
      return error.response.data;
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection.',
        },
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error.message || 'An unknown error occurred.',
        },
      };
    }
  }
};

// Utility functions for common HTTP methods
export const get = <T = any>(url: string, params?: any): Promise<ApiResponse<T>> =>
  apiRequest<T>({ method: 'GET', url, params });

export const post = <T = any>(url: string, data?: any): Promise<ApiResponse<T>> =>
  apiRequest<T>({ method: 'POST', url, data });

export const put = <T = any>(url: string, data?: any): Promise<ApiResponse<T>> =>
  apiRequest<T>({ method: 'PUT', url, data });

export const del = <T = any>(url: string): Promise<ApiResponse<T>> =>
  apiRequest<T>({ method: 'DELETE', url });

export default api;
