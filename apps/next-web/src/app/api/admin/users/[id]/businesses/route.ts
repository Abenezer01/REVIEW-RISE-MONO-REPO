
import { NextResponse } from 'next/server';

import { createSuccessResponse, createErrorResponse } from '@platform/contracts';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { businessRepository } = await import('@platform/db');

        // Verify that the requested user ID matches the logged-in user or admin
        // For now, we assume simple route protection is handled by middleware

        const businesses = await businessRepository.findByUser(id);

        const businessDtos = businesses.map(b => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            status: b.status
        }));

        return NextResponse.json(createSuccessResponse(businessDtos));
    } catch (error) {
        console.error('Error fetching user businesses:', error);
        
return NextResponse.json(
            createErrorResponse('Failed to fetch user businesses', 'INTERNAL_SERVER_ERROR', 500),
            { status: 500 }
        );
    }
}
