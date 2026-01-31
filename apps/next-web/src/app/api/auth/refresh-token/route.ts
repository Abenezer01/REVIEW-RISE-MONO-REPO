/* eslint-disable import/no-unresolved */
import { type NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts'

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
      const response = createErrorResponse(
        'Validation failed',
        ErrorCode.VALIDATION_ERROR,
        400,
        validationResult.error.flatten().fieldErrors
      )

      
return NextResponse.json(response, { status: response.statusCode })
    }

    // Proxy to auth service
    const apiResponse = await backendClient('/v1/auth/refresh-token', {
      method: 'POST',
      data: validationResult.data,
      baseUrl: AUTH_SERVICE_URL
    })

    const data = apiResponse?.data ?? apiResponse

    const response = createSuccessResponse({
      accessToken: data?.accessToken,
    }, 'Token refreshed successfully')

    return NextResponse.json(response, { status: response.statusCode })
  } catch (error: any) {
    // Propagate the error status from the backend
    const response = createErrorResponse(
      error.message || 'Internal Server Error',
      error.code || ErrorCode.INTERNAL_SERVER_ERROR,
      error.status || 500
    )

    
return NextResponse.json(response, { status: response.statusCode })
  }
}
