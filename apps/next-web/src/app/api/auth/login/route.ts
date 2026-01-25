/* eslint-disable import/no-unresolved */
import { type NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse, ErrorCode, LoginRequestSchema } from '@platform/contracts'
import { backendClient } from '@/utils/backendClient'
import { SERVICES_CONFIG } from '@/configs/services'

export async function POST(request: NextRequest) {
  const AUTH_SERVICE_URL = SERVICES_CONFIG.auth.url
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const body = await request.json()

    // Validate input using shared schema
    const validationResult = LoginRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', ErrorCode.VALIDATION_ERROR, 400, validationResult.error.flatten().fieldErrors, requestId),
        { status: 400 }
      )
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

    return NextResponse.json(createSuccessResponse({
      user: data?.user,
      accessToken: data?.accessToken,
      refreshToken: data?.refreshToken,
    }, 'Login successful', 200, { requestId }))

  } catch (error: any) {
    return NextResponse.json(
      createErrorResponse(error.message || 'Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, error.status || 500, undefined, requestId),
      { status: error.status || 500 }
    )
  }
}
