/* eslint-disable import/no-unresolved */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

import { SERVICES_CONFIG } from '@/configs/services';

// On server side, this returns the internal URL (localhost:3002 or env var)
const SERVICE_URL = SERVICES_CONFIG.ai.url;

async function proxy(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
    const { route } = await params;
    const path = route.join('/');
    const query = req.nextUrl.search;
    const url = `${SERVICE_URL}/${path}${query}`; // e.g. http://localhost:3002/studio/ideas

    try {
        const headers = new Headers();

        // Copy Content-Type
        const contentType = req.headers.get('content-type');

        if (contentType) headers.set('content-type', contentType);

        // Inject Authorization from Cookie
        const accessToken = req.cookies.get('accessToken')?.value;

        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        } else {
            // Fallback to existing header if present
            const authHeader = req.headers.get('authorization');

            if (authHeader) headers.set('Authorization', authHeader);
        }

        const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

        const response = await fetch(url, {
            method: req.method,
            headers,
            body,
        });

        // Handle 204 No Content
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

        // If it's already standardized, pass it through
        if (data && typeof data === 'object' && ('success' in data) && ('data' in data || 'error' in data)) {
            return NextResponse.json(data, { status: response.status });
        }

        // Otherwise wrap it
        if (response.ok) {
            const wrapped = createSuccessResponse(data, 'Success', response.status);
            return NextResponse.json(wrapped, { status: response.status });
        } else {
            const wrapped = createErrorResponse(
                data.message || data.error || 'Proxy Error',
                data.code || ErrorCode.INTERNAL_SERVER_ERROR,
                response.status,
                data.details || data
            );
            return NextResponse.json(wrapped, { status: response.status });
        }

    } catch (error) {
        console.error('AI Proxy error:', error);
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
