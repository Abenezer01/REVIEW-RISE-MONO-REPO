/* eslint-disable import/no-unresolved */

import { type NextRequest, NextResponse } from 'next/server'

import { backendClient } from '@/utils/backendClient'

export async function POST(request: NextRequest) {
  // Default to localhost:3012/api if not defined
  const SEO_SERVICE_URL = process.env.SEO_SERVICE_URL

  try {
    const body = await request.json()

    // Proxy to SEO service
    const data = await backendClient('/v1/ai-visibility/analyze', {
      method: 'POST',
      data: body,
      baseUrl: SEO_SERVICE_URL
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in AI Visibility API proxy:', error)

    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: error.status || 500 }
    )
  }
}
