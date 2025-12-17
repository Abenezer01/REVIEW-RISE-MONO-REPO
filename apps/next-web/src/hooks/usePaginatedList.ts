import { useState } from 'react'

import type { PaginatedResponse, GetRequestParams } from '@platform/contracts'

import { useApiGet } from './useApi'

export const usePaginatedList = <T = any>(
    key: string[],
    url: string,
    initialParams: Partial<GetRequestParams> = {},
    options: any = {}
) => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const params: GetRequestParams = {
        ...initialParams,
        pagination: {
            page,
            pageSize
        }
    }

    const query = useApiGet<PaginatedResponse<T>>(
        [...key, 'list', `page-${page}`, `size-${pageSize}`],
        url,
        params,
        { placeholderData: (prev: any) => prev, ...options }
    )

    const meta = query.data?.meta

    return {
        ...query,
        page,
        setPage,
        pageSize,
        setPageSize,

        // Map contract meta fields to convenience helpers
        hasMore: meta ? (meta.page || 1) < (meta.lastPage || 1) : false,
        total: meta?.total ?? 0,

        // Expose full meta if needed
        meta
    }
}
