/* eslint-disable import/no-unresolved */
import { type NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts'

import { backendClient } from '@/utils/backendClient'
import { getServerAuthHeaders } from '@/utils/getServerAuthHeaders'
import { SERVICES_CONFIG } from '@/configs/services'

export async function POST(request: NextRequest) {
  const SEO_SERVICE_URL = SERVICES_CONFIG.seo.url

  try {
    const body = await request.json()
    const authHeaders = await getServerAuthHeaders()

    // Proxy to SEO service
    const data = await backendClient('/v1/ai-visibility/validate', {
      method: 'POST',
      data: body,
      baseUrl: SEO_SERVICE_URL,
      headers: authHeaders
    })

    const response = createSuccessResponse(data, 'Validation completed successfully')
    return NextResponse.json(response, { status: response.statusCode })
  } catch (error: any) {
    console.error('Error in AI Visibility API proxy:', error)

    const response = createErrorResponse(
      error.message || 'Internal Server Error',
      error.code || ErrorCode.INTERNAL_SERVER_ERROR,
      error.status || 500
    )
    return NextResponse.json(response, { status: response.statusCode })
  }
}
