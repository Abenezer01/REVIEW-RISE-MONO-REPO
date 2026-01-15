/* eslint-disable import/no-unresolved */

import { type NextRequest, NextResponse } from 'next/server'

import { backendClient } from '@/utils/backendClient'
import { getServerAuthHeaders } from '@/utils/getServerAuthHeaders'

export async function POST(request: NextRequest) {
  // Default to localhost:3012/api if not defined
  const SEO_SERVICE_URL = process.env.NEXT_PUBLIC_SEO_HEALTH_API_URL || 'http://localhost:3011/api/v1'

  try {
    const body = await request.json()
    const authHeaders = await getServerAuthHeaders()

    // Proxy to SEO service
    const data = await backendClient('/v1/ai-visibility/analyze', {
      method: 'POST',
      data: body,
      baseUrl: SEO_SERVICE_URL,
      headers: authHeaders
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
