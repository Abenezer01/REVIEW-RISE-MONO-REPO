/* eslint-disable import/no-unresolved */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

import { SERVICES_CONFIG } from '@/configs/services';

const SERVICE_URL = SERVICES_CONFIG.brand.url;

async function proxy(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const path = route.join('/');
  const query = req.nextUrl.search;
  const url = `${SERVICE_URL}/reports-center/${path}${query}`;

  try {
    const headers = new Headers();
    const contentType = req.headers.get('content-type');

    if (contentType) headers.set('content-type', contentType);

    const accessToken = req.cookies.get('accessToken')?.value;

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    } else {
      const authHeader = req.headers.get('authorization');

      if (authHeader) headers.set('Authorization', authHeader);
    }

    const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (data && typeof data === 'object' && ('success' in data) && ('data' in data || 'error' in data)) {
      return NextResponse.json(data, { status: response.status });
    }

    if (response.ok) {
      const wrapped = createSuccessResponse(data, 'Success', response.status);

      return NextResponse.json(wrapped, { status: response.status });
    }

    const wrapped = createErrorResponse(
      data.message || data.error || 'Proxy Error',
      data.code || ErrorCode.INTERNAL_SERVER_ERROR,
      response.status,
      data.details || data
    );

    return NextResponse.json(wrapped, { status: response.status });
  } catch (error) {
    console.error('Reports Center proxy error:', error);

    const errorResponse = createErrorResponse(
      'Proxy error',
      ErrorCode.INTERNAL_SERVER_ERROR,
      500,
      String(error)
    );

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
