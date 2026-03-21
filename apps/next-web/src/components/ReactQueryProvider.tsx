'use client'
import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const ReactQueryProvider = ({ children }: { children: any }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            {children as any}
        </QueryClientProvider>
    )
}

export default ReactQueryProvider
