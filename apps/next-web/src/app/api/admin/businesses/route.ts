
import { NextResponse } from 'next/server';

import { businessRepository } from '@platform/db';
import type {
    BusinessDto
} from '@platform/contracts';
import {
    createPaginatedResponse,
    createErrorResponse
} from '@platform/contracts';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';

        // Repository search
        const items = await businessRepository.search(search, {
            take: limit,
            skip: (page - 1) * limit
        });

        // Get total for pagination (approximate or exact)
        const total = await businessRepository.count({
            name: {
                contains: search,
                mode: 'insensitive'
            },
            deletedAt: null
        });

        // Map to DTO
        const businessDtos: BusinessDto[] = items.map(item => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            email: item.email,
            status: item.status,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString()
        }));

        return NextResponse.json(
            createPaginatedResponse(
                businessDtos,
                { page, limit, total }
            )
        );
    } catch (error) {
        console.error('Error searching businesses:', error);
        
return NextResponse.json(
            createErrorResponse('Failed to search businesses', 'INTERNAL_SERVER_ERROR', 500, error),
            { status: 500 }
        );
    }
}
