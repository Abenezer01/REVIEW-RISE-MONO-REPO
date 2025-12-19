
import { NextResponse } from 'next/server';

import { z } from 'zod';
import type {
    CreateLocationRequest,
    LocationDto
} from '@platform/contracts';
import {
    createPaginatedResponse,
    createSuccessResponse,
    createErrorResponse,
    createValidationErrorResponse
} from '@platform/contracts';

// Input validation schemas
const createLocationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    businessId: z.string().uuid('Valid business ID is required'),
    address: z.string().optional(),
    timezone: z.string().optional(),
    tags: z.array(z.string()).optional(),
    platformIds: z.any().optional(),
    status: z.enum(['active', 'archived', 'deleted']).optional()
});

export async function GET(request: Request) {
    try {
        const { locationRepository } = await import('@platform/db');

        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || undefined;
        const businessId = searchParams.get('businessId') || undefined;
        const status = searchParams.get('status') || undefined;

        // Skip calculation
        const skip = (page - 1) * limit;

        // Repository call might need adjustment if signature is different from previous thought
        const { items, total } = await locationRepository.list(
            { search, status, businessId },
            { take: limit, skip }
        );

        // Map to DTO
        const locationDtos = items as unknown as LocationDto[];

        return NextResponse.json(
            createPaginatedResponse(
                locationDtos,
                { page, limit, total }
            )
        );
    } catch (error) {
        console.error('Error fetching locations:', error);

return NextResponse.json(
            createErrorResponse('Failed to fetch locations', 'INTERNAL_SERVER_ERROR', 500, error),
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { locationRepository } = await import('@platform/db');

        const body = await request.json();
        const validation = createLocationSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                createValidationErrorResponse(validation.error.flatten().fieldErrors as any),
                { status: 400 }
            );
        }

        const data: CreateLocationRequest = validation.data;

        const { businessId, ...locationData } = data;

        const location = await locationRepository.createForBusiness(
            businessId,
            locationData
        );

        return NextResponse.json(
            createSuccessResponse(location as unknown as LocationDto, 'Location created successfully', 201),
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating location:', error);

return NextResponse.json(
            createErrorResponse('Failed to create location', 'INTERNAL_SERVER_ERROR', 500, error),
            { status: 500 }
        );
    }
}
