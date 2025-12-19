
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { z } from 'zod';
import type {
    UpdateLocationRequest,
    LocationDto
} from '@platform/contracts';
import {
    createSuccessResponse,
    createErrorResponse,
    createValidationErrorResponse
} from '@platform/contracts';

const updateLocationSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    address: z.string().optional(),
    timezone: z.string().optional(),
    tags: z.array(z.string()).optional(),
    platformIds: z.any().optional(),
    businessId: z.string().optional(), // In case we want to move locations
    status: z.string().optional(),
});

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const { locationRepository } = await import('@platform/db');
        const location = await locationRepository.findWithBusiness(id);

        if (!location) {
            return NextResponse.json(
                createErrorResponse('Location not found', 'NOT_FOUND', 404),
                { status: 404 }
            );
        }

        return NextResponse.json(
            createSuccessResponse(location as unknown as LocationDto, 'Location details')
        );
    } catch (error) {
        console.error('Error fetching location:', error);

        return NextResponse.json(
            createErrorResponse('Failed to fetch location', 'INTERNAL_SERVER_ERROR', 500, error),
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const { locationRepository } = await import('@platform/db');
        const body = await request.json();
        const validation = updateLocationSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                createValidationErrorResponse(validation.error.flatten().fieldErrors as any),
                { status: 400 }
            );
        }

        const data: UpdateLocationRequest = validation.data;

        // Ensure we don't accidentally wipe platformIds if not provided, assuming repository handles partial updates correctly which it should.
        const location = await locationRepository.update(id, data);

        return NextResponse.json(
            createSuccessResponse(location as unknown as LocationDto, 'Location updated successfully')
        );
    } catch (error) {
        console.error('Error updating location:', error);

        return NextResponse.json(
            createErrorResponse('Failed to update location', 'INTERNAL_SERVER_ERROR', 500, error),
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        const { locationRepository } = await import('@platform/db');
        
        await locationRepository.delete(id);

        return NextResponse.json(
            createSuccessResponse(null, 'Location deleted successfully')
        );
    } catch (error) {
        console.error('Error deleting location:', error);

        return NextResponse.json(
            createErrorResponse('Failed to delete location', 'INTERNAL_SERVER_ERROR', 500, error),
            { status: 500 }
        );
    }
}
