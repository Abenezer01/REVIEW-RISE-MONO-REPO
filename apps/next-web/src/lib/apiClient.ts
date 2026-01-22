import axios from 'axios'
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

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle global errors (e.g., 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // Redirect to login or clear auth state
    }

    return Promise.reject(error)
  }
)

export default apiClient
