import { headers, cookies } from 'next/headers'

import axios, { type AxiosRequestConfig, isAxiosError } from 'axios'

interface BackendClientOptions extends AxiosRequestConfig {
  baseUrl?: string
}

export async function backendClient<T = any>(
  path: string,
  options: BackendClientOptions = {}
): Promise<T> {
  const { baseUrl, headers: customHeaders, ...rest } = options

  // Get headers from the incoming request (e.g. Authorization)
  const headersList = await headers()
  let authorization = headersList.get('authorization')

  // If no Authorization header, check for accessToken cookie
  if (!authorization) {
    const cookieStore = await cookies()

    const accessToken = cookieStore.get('accessToken')

    if (accessToken) {
      authorization = `Bearer ${accessToken.value}`
    }
  }

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

    return response.data
  } catch (error: any) {
    if (isAxiosError(error) && error.response) {
      // Propagate the error message from backend if available
      const message = error.response.data?.message || error.response.data?.error?.message || error.response.data?.error || error.message

      const apiError: any = new Error(message)

      apiError.status = error.response.status
      throw apiError
    }

    console.error('Backend client error:', error)
    throw error
  }
}
