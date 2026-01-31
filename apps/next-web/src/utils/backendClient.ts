import axios, { type AxiosRequestConfig, isAxiosError } from 'axios'

interface BackendClientOptions extends AxiosRequestConfig {
  baseUrl?: string
  authorization?: string // Add authorization to options
}

export async function backendClient<T = any>(
  path: string,
  options: BackendClientOptions = {}
): Promise<T> {
  const { baseUrl, headers: customHeaders, authorization, ...rest } = options

  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(authorization ? { Authorization: authorization } : {}),
    ...(customHeaders as Record<string, string>),
  }

  const url = baseUrl ? `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}` : path

  try {
    const response = await axios({
      url,
      headers: mergedHeaders,
      ...rest,
    })

    const data = response.data as any

    // Unwrap standardized ApiResponse (from @platform/contracts)
    if (data && typeof data === 'object' && ('success' in data || 'status' in data) && 'data' in data) {
      // Only unwrap if it's a success response
      if (data.success !== false) {
        // If it has pagination metadata, return both data and meta
        if (data.meta && (data.meta.total !== undefined || data.meta.page !== undefined)) {
          return {
            data: data.data,
            meta: data.meta
          } as unknown as T
        }

        return data.data as T
      }
    }

    return response.data as T
  } catch (error: any) {
    if (isAxiosError(error) && error.response) {
      // Propagate the error message from backend if available using @platform/contracts structure
      const data = error.response.data;
      const message = data?.error?.message || data?.message || error.message;

      const apiError: any = new Error(message)

      apiError.status = error.response.status
      apiError.data = data; // Keep original data for further inspection if needed

      throw apiError
    }

    console.error('Backend client error:', error)
    throw error
  }
}
