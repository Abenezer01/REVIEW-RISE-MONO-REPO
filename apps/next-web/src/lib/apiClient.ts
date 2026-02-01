import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios'

import type { ApiMeta, ApiResponse } from '@platform/contracts'
import { systemMessageEvents, SYSTEM_MESSAGE_EVENT } from '@platform/utils'

import { useAuthStore } from '@/store/authStore'

// Normalize base to avoid duplicated `/api` when combining with public endpoints
const normalizeBase = (val: string | undefined) => {
  const raw = (val ?? '').trim();

  if (!raw) return '';
  let url = raw.replace(/\/+$/, '');

  url = url.replace(/\/api(?:\/v\d+)?$/, '');

  return url;
};

const apiClient = axios.create({
  baseURL: normalizeBase(process.env.NEXT_PUBLIC_API_URL),
  headers: { 'Content-Type': 'application/json' }
})

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Attach token from store if available
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to automatically unwrap standardized ApiResponse
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse;

    // Emit system message if present
    if (data && data.messageCode) {
      systemMessageEvents.emit(SYSTEM_MESSAGE_EVENT, {
        code: data.messageCode,
        options: { variant: 'TOAST' }
      });
    }

    // Check if it matches our standard ApiResponse structure (from @platform/contracts)
    // We check for 'success' or 'status' (legacy) and 'data'
    if (data && typeof data === 'object' && ('success' in data || ('status' in data as any)) && 'data' in data) {
      // If it has pagination metadata in meta, we return the data and meta together
      if (data.meta && (data.meta.total !== undefined || data.meta.page !== undefined)) {
        return {
          ...response,
          data: {
            data: data.data,
            meta: data.meta
          }
        };
      }

      // Otherwise return only the inner data payload
      return {
        ...response,
        data: data.data
      };
    }

    return response
  },
  (error) => {
    const data = error.response?.data as ApiResponse;

    // Emit system message for errors
    if (data && data.messageCode) {
      systemMessageEvents.emit(SYSTEM_MESSAGE_EVENT, {
        code: data.messageCode,
        options: { variant: 'TOAST' }
      });
    } else if (error.code === 'ERR_NETWORK') {
      systemMessageEvents.emit(SYSTEM_MESSAGE_EVENT, {
        code: 'NETWORK_ERROR',
        options: { variant: 'TOAST' }
      });
    }

    // Handle global errors (e.g., 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // Could trigger logout or refresh token logic here
    }

    return Promise.reject(error)
  }
)

export default apiClient

/**
 * Type helper for paginated responses when unwrapped by the interceptor
 */
export interface UnwrappedPaginatedResponse<T> {
  data: T[];
  meta: ApiMeta & {
    page: number;
    limit: number;
    total: number;
    lastPage?: number;
  };
}

// Type helper for unwrapped responses in AxiosInstance
declare module 'axios' {
  export interface AxiosInstance {
    request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
    get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    delete<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    head<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    options<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    put<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    patch<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  }
}
