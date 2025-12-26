import axios from 'axios'

// Configure Axios instance for SEO Health API
const seoApiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SEO_HEALTH_API_URL || 'http://localhost:3012/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add request interceptor
seoApiClient.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Add response interceptor
seoApiClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // Handle global errors
        if (error.response && error.response.status === 401) {
            // Redirect to login or clear auth state
        }

        return Promise.reject(error)
    }
)

export default seoApiClient
