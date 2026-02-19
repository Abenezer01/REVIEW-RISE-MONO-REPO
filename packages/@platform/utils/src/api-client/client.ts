import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getRequestContext } from './context';

export const createApiClient = (config?: AxiosRequestConfig): AxiosInstance => {
    const client = axios.create({
        headers: {
            'Content-Type': 'application/json',
        },
        ...config,
    });

    client.interceptors.request.use((config) => {
        const token = getRequestContext('authToken');
        if (token) {
            config.headers['Authorization'] = token;
        }
        return config;
    });

    return client;
};

// Default singleton instance
export const apiClient = createApiClient();
