import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { SERVICES_CONFIG } from '@/configs/services';

const SERVICE_URL = SERVICES_CONFIG.brand.url;

async function proxy(req: NextRequest, { params }: { params: Promise<{ brandPath?: string[] }> }) {
  const { brandPath: path = [] } = await params;
  const query = req.nextUrl.search;

  // Smart Routing Logic:
  // Distinguishes between "Brand Features" (recommendations, dashboards, etc.)
  // and "Brand Profile Actions" (CRUD, onboard, etc.)

  let targetPath = '';

  // Sub-resources mapping to /brands/:id/...
  const BRANDS_FEATURES = [
    'recommendations',
    'dashboards',
    'competitors',
    'reports',
    'dna',
    'content',
    'reviews',
    'visibility-plan',
    'scores'
  ];

  if (path.length === 0) {
    targetPath = 'brand-profiles';
  } else if (path[0] === 'onboard') {
    targetPath = 'brand-profiles/onboard';
  } else {
    const subResource = path[1];

    if (subResource && BRANDS_FEATURES.includes(subResource)) {
      // It's a feature -> /brands/:id/resource
      targetPath = `brands/${path.join('/')}`;
    } else {
      // It's a profile action or simple GET -> /brand-profiles/:id...
      targetPath = `brand-profiles/${path.join('/')}`;
    }
  }

  const url = `${SERVICE_URL}/${targetPath}${query}`;

  try {
    const headers = new Headers();

    // Copy necessary headers
    const contentType = req.headers.get('content-type');

    if (contentType) headers.set('content-type', contentType);

    const auth = req.headers.get('authorization');

    if (auth) headers.set('authorization', auth);

    const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    // Handle 204 No Content or empty responses
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

    return NextResponse.json({ error: 'Proxy error', details: String(error) }, { status: 500 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
