/* eslint-disable import/no-unresolved */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createErrorResponse, ErrorCode } from '@platform/contracts';

import { SERVICES_CONFIG } from '@/configs/services';

const SERVICE_URL = SERVICES_CONFIG.brand.url;

async function proxy(req: NextRequest, { params }: { params: Promise<{ brandPath?: string[] }> }) {
  const { brandPath: path = [] } = await params;
  const query = req.nextUrl.search;
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  let targetPath = '';

  const BRANDS_FEATURES = [
    'recommendations',
    'dashboards',
    'competitors',
    'reports',
    'dna',
    'content',
    'reviews',
    'scheduling',
    'visibility-plan',
    'scores',
    'caption-drafts',
    'content-ideas',
    'image-prompts',
    'carousel-drafts',
    'script-drafts'
  ];

  if (path.length === 0) {
    targetPath = 'brand-profiles';
  } else if (path[0] === 'onboard') {
    targetPath = 'brand-profiles/onboard';
  } else {
    const subResource = path[1];

    if (subResource && BRANDS_FEATURES.includes(subResource)) {
      targetPath = `brands/${path.join('/')}`;
    } else {
      targetPath = `brand-profiles/${path.join('/')}`;
    }
  }

  const url = `${SERVICE_URL}/${targetPath}${query}`;

  try {
    const headers = new Headers();

    const contentType = req.headers.get('content-type');

    if (contentType) headers.set('content-type', contentType);

    const auth = req.headers.get('authorization');

    if (auth) headers.set('authorization', auth);

    headers.set('x-request-id', requestId);

    const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);

return NextResponse.json(
      createErrorResponse('Proxy error', ErrorCode.INTERNAL_SERVER_ERROR, 500, String(error), requestId),
      { status: 500 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
