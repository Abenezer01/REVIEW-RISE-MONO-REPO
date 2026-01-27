/* eslint-disable import/no-unresolved */
import { type NextRequest, NextResponse } from 'next/server'

import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts'

import { backendClient } from '@/utils/backendClient'
import { getServerAuthHeaders } from '@/utils/getServerAuthHeaders'
import { SERVICES_CONFIG } from '@/configs/services'

export async function POST(request: NextRequest) {
  const SEO_SERVICE_URL = SERVICES_CONFIG.seo.url
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const body = await request.json()
    const authHeaders = await getServerAuthHeaders()

    const data = await backendClient('/v1/ai-visibility/analyze', {
      method: 'POST',
      data: body,
      baseUrl: SEO_SERVICE_URL,
      headers: {
          ...authHeaders,
          'x-request-id': requestId
      }
    })

    // backendClient unwraps the response data, so we re-wrap it for consistent API output

    return NextResponse.json(createSuccessResponse(data, 'Analysis completed', 200, { requestId }))
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Error in AI Visibility API proxy:', error)

    return NextResponse.json(
      createErrorResponse(error.message || 'Internal Server Error', ErrorCode.INTERNAL_SERVER_ERROR, error.status || 500, undefined, requestId),
      { status: error.status || 500 }
    )
  }
}
