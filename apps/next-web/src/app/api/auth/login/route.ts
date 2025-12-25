/* eslint-disable import/no-unresolved */
import { type NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { backendClient } from '@/utils/backendClient'

// Define validation schema
const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
    const validationResult = loginSchema.safeParse(body)

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

    const response = NextResponse.json({
      user: data?.user,
      accessToken: data?.accessToken,
      refreshToken: data?.refreshToken,
      message: 'Login successful'
    })

    return response
  } catch (error: any) {
    // Handle specific error cases if needed, otherwise fallback to generic error
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: error.status || 500 }
    )
  }
}
