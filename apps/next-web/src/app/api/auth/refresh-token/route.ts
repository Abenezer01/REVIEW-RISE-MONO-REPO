import { type NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { backendClient } from '@/utils/backendClient'

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export async function POST(request: NextRequest) {
  const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL

  if (!AUTH_SERVICE_URL) {
    return NextResponse.json(
      { message: 'Server configuration error: AUTH_SERVICE_URL not set' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()

    // Validate input
    const validationResult = refreshTokenSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    // Proxy to auth service
    const apiResponse = await backendClient('/v1/auth/refresh-token', {
      method: 'POST',
      data: validationResult.data,
      baseUrl: AUTH_SERVICE_URL
    })

    const data = apiResponse?.data ?? apiResponse

    return NextResponse.json({
      accessToken: data?.accessToken,
      message: 'Token refreshed successfully'
    })
  } catch (error: any) {
    // Propagate the error status from the backend
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: error.status || 500 }
    )
  }
}
