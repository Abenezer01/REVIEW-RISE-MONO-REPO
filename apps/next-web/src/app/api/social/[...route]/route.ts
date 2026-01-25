import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createErrorResponse, ErrorCode } from '@platform/contracts';
import { SERVICES_CONFIG } from '@/configs/services';

const SERVICE_URL = SERVICES_CONFIG.social.url;

async function proxy(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
    const { route } = await params;
    const path = route.join('/');
    const query = req.nextUrl.search;
    const url = `${SERVICE_URL}/${path}${query}`;
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

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
        console.error('Social Proxy error:', error);
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
