/* eslint-disable import/no-unresolved */
import { type NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { createSuccessResponse, createErrorResponse } from '@platform/contracts'

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
      return NextResponse.json(
        createErrorResponse('Validation failed', 'VALIDATION_ERROR', 400, validationResult.error.flatten().fieldErrors),
        { status: 400 }
      )
    }

    // Proxy to auth service
    const data = await backendClient('/v1/auth/login', {
      method: 'POST',
      data: validationResult.data,
      baseUrl: AUTH_SERVICE_URL
    })

    return NextResponse.json(createSuccessResponse({
      user: data?.user,
      accessToken: data?.accessToken,
      refreshToken: data?.refreshToken,
    }, 'Login successful'))
  } catch (error: any) {
    // Handle specific error cases if needed, otherwise fallback to generic error
    return NextResponse.json(
      createErrorResponse(error.message || 'Internal Server Error', error.code, error.status || 500),
      { status: error.status || 500 }
    )
  }
}
