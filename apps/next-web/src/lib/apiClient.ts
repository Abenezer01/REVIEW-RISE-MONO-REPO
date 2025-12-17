import axios from 'axios'

// Configure Axios instance
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed, or rely on cookies
        // const token = useAuthStore.getState().token;
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
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
