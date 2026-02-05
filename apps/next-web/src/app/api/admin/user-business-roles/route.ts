
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createErrorResponse, ErrorCode } from '@platform/contracts';

// In development, this points to http://localhost:3012
// In production, it points to the internal service URL
const SERVICE_URL = process.env.EXPRESS_ADMIN_URL || 'http://localhost:3012';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.search;
  const url = `${SERVICE_URL}/user-business-roles${query}`;

  try {
    const accessToken = req.cookies.get('accessToken')?.value;
    const headers = new Headers();
    
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
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
    console.error('[AdminProxy] Error fetching user roles:', error);

    return NextResponse.json(
      createErrorResponse('Internal Server Error in Admin Proxy', ErrorCode.INTERNAL_SERVER_ERROR, 500, String(error)),
      { status: 500 }
    );
  }
}
