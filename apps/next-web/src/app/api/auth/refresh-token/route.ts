import { type NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { createSuccessResponse, createErrorResponse } from '@platform/contracts'

import { backendClient } from '@/utils/backendClient'

import { SERVICES_CONFIG } from '@/configs/services'

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export async function POST(request: NextRequest) {
  const AUTH_SERVICE_URL = SERVICES_CONFIG.auth.url

  try {
    const body = await request.json()

    // Validate input
    const validationResult = refreshTokenSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', 'VALIDATION_ERROR', 400, validationResult.error.flatten().fieldErrors),
        { status: 400 }
      )
    }

    // Proxy to auth service
    const data = await backendClient('/v1/auth/refresh-token', {
      method: 'POST',
      data: validationResult.data,
      baseUrl: AUTH_SERVICE_URL
    })

    return NextResponse.json(createSuccessResponse({
      accessToken: data?.accessToken,
    }, 'Token refreshed successfully'))
  } catch (error: any) {
    // Propagate the error status from the backend
    return NextResponse.json(
      createErrorResponse(error.message || 'Internal Server Error', error.code, error.status || 500),
      { status: error.status || 500 }
    )
  }
}
