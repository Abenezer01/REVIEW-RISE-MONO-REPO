/* eslint-disable import/no-unresolved */
import { type NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts'

import { backendClient } from '@/utils/backendClient'
import { SERVICES_CONFIG } from '@/configs/services'

const schema = z.object({
  email: z.email('Invalid email address')
})

export async function POST(request: NextRequest) {
  const AUTH_SERVICE_URL = SERVICES_CONFIG.auth.url

  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      const response = createErrorResponse(
        'Validation failed',
        ErrorCode.VALIDATION_ERROR,
        400,
        parsed.error.flatten().fieldErrors
      )

      return NextResponse.json(response, { status: response.statusCode })
    }

    await backendClient('/v1/auth/resend-verification', {
      method: 'POST',
      data: parsed.data,
      baseUrl: AUTH_SERVICE_URL
    })

    const response = createSuccessResponse({}, 'Verification email sent')

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

