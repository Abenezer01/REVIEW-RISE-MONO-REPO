import axios, { type AxiosRequestConfig, isAxiosError } from 'axios'

interface BackendClientOptions extends AxiosRequestConfig {
  baseUrl?: string
  authorization?: string // Add authorization to options
}

/**
 * Standard API response structure from @platform/contracts
 */
interface ApiResponseEnvelope<T = any> {
  success: boolean
  statusCode: number
  message?: string
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    requestId: string
    timestamp: string
    page?: number
    limit?: number
    total?: number
    lastPage?: number
    [key: string]: any
  }
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

    const responseData = response.data as ApiResponseEnvelope<T>

    // If it's the standard envelope
    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      if (responseData.success) {
        // Handle pagination metadata if present
        if (responseData.meta && responseData.meta.total !== undefined && Array.isArray(responseData.data)) {
          return {
            data: responseData.data,
            pagination: {
              page: responseData.meta.page,
              limit: responseData.meta.limit,
              total: responseData.meta.total,
              totalPages: responseData.meta.lastPage || Math.ceil(responseData.meta.total / (responseData.meta.limit || 1)),
            },
          } as unknown as T
        }

        return responseData.data as T
      } else {
        // Standard API error

        const message = responseData.error?.message || responseData.message || 'API Error'
        const apiError: any = new Error(message)

        apiError.status = responseData.statusCode
        apiError.code = responseData.error?.code
        apiError.details = responseData.error?.details
        throw apiError
      }
    }

    // Fallback for non-enveloped responses
    return response.data
  } catch (error: any) {
    if (isAxiosError(error) && error.response) {
      const responseData = error.response.data as ApiResponseEnvelope

      // Try to extract message from standard error envelope

      const message = responseData?.error?.message || responseData?.message || error.message

      const apiError: any = new Error(message)

      apiError.status = error.response.status
      apiError.details = responseData?.error?.details || responseData?.error
      apiError.code = responseData?.error?.code
      throw apiError
    }

    // eslint-disable-next-line no-console
    if (process.env.NODE_ENV === 'development') {
      console.error('Backend client error:', error)
    }

    throw error
  }
}
