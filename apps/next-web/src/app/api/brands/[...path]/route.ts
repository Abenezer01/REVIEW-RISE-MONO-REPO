import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const SERVICE_URL = process.env.EXPRESS_BRAND_URL || 'http://localhost:3007/api/v1/brand-profiles';

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathString = path.join('/');
  const query = req.nextUrl.search;
  const url = `${SERVICE_URL}/${pathString}${query}`;

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
