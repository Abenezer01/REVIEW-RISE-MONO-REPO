
import { NextResponse } from 'next/server';

import { locationRepository } from '@platform/db';
import { z } from 'zod';
import {
    createSuccessResponse,
    createErrorResponse,
    createValidationErrorResponse,
    UpdateLocationRequest,
    LocationDto
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
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const location = await locationRepository.findWithBusiness(params.id);

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
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
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
        const location = await locationRepository.update(params.id, data);

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
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await locationRepository.delete(params.id);

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
