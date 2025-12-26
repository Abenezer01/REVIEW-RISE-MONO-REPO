import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

import seoApiClient from '@/lib/seoApiClient';

// Generic fetcher for SEO API
const fetcher = async <T>({ url, params }: { url: string; params?: any }): Promise<T> => {
    const response = await seoApiClient.get<T>(url, { params })

    return response.data
}

export const useSeoApiGet = <T = any>(
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

export const useSeoApiPost = <T = any, V = any>(
    url: string,
    options?: Omit<UseMutationOptions<T, unknown, V>, 'mutationFn'>
) => {
    return useMutation<T, unknown, V>({
        mutationFn: async (data: V) => {
            const response = await seoApiClient.post<T>(url, data)

            return response.data
        },
        ...options,
    })
}

export const useSeoApiPut = <T = any, V = any>(
    url: string,
    options?: Omit<UseMutationOptions<T, unknown, V>, 'mutationFn'>
) => {
    return useMutation<T, unknown, V>({
        mutationFn: async (data: V) => {
            const response = await seoApiClient.put<T>(url, data)

            return response.data
        },
        ...options,
    })
}

export const useSeoApiDelete = <T = any>(
    baseUrl: string,
    options?: Omit<UseMutationOptions<T, unknown, string>, 'mutationFn'>
) => {
    return useMutation<T, unknown, string>({
        mutationFn: async (id: string) => {
            const url = baseUrl.includes(':id') ? baseUrl.replace(':id', id) : `${baseUrl}/${id}`
            const response = await seoApiClient.delete<T>(url)

            return response.data
        },
        ...options,
    })
}
