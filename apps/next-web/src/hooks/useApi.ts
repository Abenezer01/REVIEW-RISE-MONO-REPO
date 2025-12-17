import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

import apiClient from '@/lib/apiClient';

// Generic fetcher
const fetcher = async <T>({ url, params }: { url: string; params?: any }): Promise<T> => {
    const response = await apiClient.get<T>(url, { params })

    return response.data
}

export const useApiGet = <T = any>(
    key: string[],
    url: string,
    params?: any,
    options?: Omit<UseQueryOptions<T, unknown, T, string[]>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<T, unknown, T, string[]>({
        queryKey: key,
        queryFn: () => fetcher<T>({ url, params }),
        ...options,
    })
}

export const useApiPost = <T = any, V = any>(
    url: string,
    options?: Omit<UseMutationOptions<T, unknown, V>, 'mutationFn'>
) => {
    // const queryClient = useQueryClient()

    return useMutation<T, unknown, V>({
        mutationFn: async (data: V) => {
            const response = await apiClient.post<T>(url, data)

            return response.data
        },
        onSuccess: () => {
            // Invalidate queries if needed
            // queryClient.invalidateQueries({ queryKey: [...] })
        },
        ...options,
    })
}

export const useApiPut = <T = any, V = any>(
    url: string,
    options?: Omit<UseMutationOptions<T, unknown, V>, 'mutationFn'>
) => {
    return useMutation<T, unknown, V>({
        mutationFn: async (data: V) => {
            const response = await apiClient.put<T>(url, data)

            return response.data
        },
        ...options,
    })
}

export const useApiDelete = <T = any>(
    url: string,
    options?: Omit<UseMutationOptions<T, unknown, void>, 'mutationFn'>
) => {
    return useMutation<T, unknown, void>({
        mutationFn: async () => {
            const response = await apiClient.delete<T>(url)

            return response.data
        },
        ...options,
    })
}
