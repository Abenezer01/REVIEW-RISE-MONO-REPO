/* eslint-disable import/no-unresolved */
import { type NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts'

import { backendClient } from '@/utils/backendClient'

import { SERVICES_CONFIG } from '@/configs/services'

// Define validation schema
const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  const AUTH_SERVICE_URL = SERVICES_CONFIG.auth.url

  try {
    const body = await request.json()

    // Validate input
    const validationResult = loginSchema.safeParse(body)

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
    let data;

    const apiResponse = await backendClient('/v1/auth/login', {
      method: 'POST',
      data: validationResult.data,
      baseUrl: AUTH_SERVICE_URL
    })

    if (apiResponse && apiResponse.data) {
      data = apiResponse.data
    } else {
      data = apiResponse
    }

    const response = createSuccessResponse(
      {
        user: data?.user,
        accessToken: data?.accessToken,
        refreshToken: data?.refreshToken,
      },
      'Login successful'
    )

    return NextResponse.json(response, { status: response.statusCode })
  } catch (error: any) {
    // Handle specific error cases if needed, otherwise fallback to generic error
    const response = createErrorResponse(
      error.message || 'Internal Server Error',
      error.code || ErrorCode.INTERNAL_SERVER_ERROR,
      error.status || 500
    )

    
return NextResponse.json(response, { status: response.statusCode })
  }
}
