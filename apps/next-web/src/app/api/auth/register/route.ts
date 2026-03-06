/* eslint-disable import/no-unresolved */
import { type NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts'

import { backendClient } from '@/utils/backendClient'
import { SERVICES_CONFIG } from '@/configs/services'

const registerSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  const AUTH_SERVICE_URL = SERVICES_CONFIG.auth.url

  try {
    const body = await request.json()
    const validationResult = registerSchema.safeParse(body)

    if (!validationResult.success) {
      const response = createErrorResponse(
        'Validation failed',
        ErrorCode.VALIDATION_ERROR,
        400,
        validationResult.error.flatten().fieldErrors
      )

      return NextResponse.json(response, { status: response.statusCode })
    }

    let data

    const apiResponse = await backendClient('/v1/auth/register', {
      method: 'POST',
      data: validationResult.data,
      baseUrl: AUTH_SERVICE_URL
    })

    if (apiResponse && (apiResponse as any).data) {
      data = (apiResponse as any).data
    } else {
      data = apiResponse
    }

    const response = createSuccessResponse(
      {
        userId: data?.userId
      },
      'Registration successful',
      201
    )

    return NextResponse.json(response, { status: response.statusCode })
  } catch (error: any) {
    const response = createErrorResponse(
      error.message || 'Internal Server Error',
      error.code || ErrorCode.INTERNAL_SERVER_ERROR,
      error.status || 500
    )

    return NextResponse.json(response, { status: response.statusCode })
  }
}
