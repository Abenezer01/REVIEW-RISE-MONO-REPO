
import { NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { businessRepository } from '@platform/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const requestId = crypto.randomUUID();
    try {
        const { id } = await params;

        const businesses = await businessRepository.findByUser(id);

        const businessDtos = businesses.map(b => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            status: b.status
        }));

        return NextResponse.json(createSuccessResponse(businessDtos, 'User businesses fetched', 200, { requestId }));
    } catch (error: any) {
        console.error('Error fetching user businesses:', error);
        
        return NextResponse.json(
            createErrorResponse(error.message || 'Failed to fetch user businesses', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId),
            { status: 500 }
        );
    }
}
