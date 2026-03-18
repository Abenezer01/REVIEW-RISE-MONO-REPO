import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse
} from '@platform/contracts';

import { locationRepository, prisma } from '@platform/db';
import { z } from 'zod';

type NapMasterRecord = {
  id: string;
  businessId: string;
  locationId: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const toRecord = (row: NapMasterRecord) => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString()
});

const updateSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional()
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const location = await locationRepository.findWithBusiness(id);

    if (!location) {
      return NextResponse.json(
        createErrorResponse('Location not found', 'NOT_FOUND', 404),
        { status: 404 }
      );
    }

    const rows = await prisma.$queryRawUnsafe<NapMasterRecord[]>(
      `SELECT * FROM "NapMasterRecord" WHERE "locationId" = $1::uuid LIMIT 1`,
      id
    );

    if (rows.length > 0) {
      return NextResponse.json(createSuccessResponse(toRecord(rows[0]), 'NAP master record'));
    }

    const fallbackName = location.name || location.business?.name || null;
    const fallbackAddress = location.address || null;
    const fallbackPhone = location.business?.phone || null;

    const inserted = await prisma.$queryRawUnsafe<NapMasterRecord[]>(
      `INSERT INTO "NapMasterRecord" ("businessId", "locationId", "name", "address", "phone")
       VALUES ($1::uuid, $2::uuid, $3, $4, $5)
       RETURNING *`,
      location.businessId,
      id,
      fallbackName,
      fallbackAddress,
      fallbackPhone
    );

    return NextResponse.json(
      createSuccessResponse(toRecord(inserted[0]), 'NAP master record created')
    );
  } catch (error) {
    console.error('Error fetching NAP master record:', error);

    return NextResponse.json(
      createErrorResponse('Failed to fetch NAP master record', 'INTERNAL_SERVER_ERROR', 500, error),
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
    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        createValidationErrorResponse(validation.error.flatten().fieldErrors as any),
        { status: 400 }
      );
    }

    const location = await locationRepository.findWithBusiness(id);

    if (!location) {
      return NextResponse.json(
        createErrorResponse('Location not found', 'NOT_FOUND', 404),
        { status: 404 }
      );
    }

    const payload = validation.data;

    const rows = await prisma.$queryRawUnsafe<NapMasterRecord[]>(
      `SELECT * FROM "NapMasterRecord" WHERE "locationId" = $1::uuid LIMIT 1`,
      id
    );

    const updated = rows.length
      ? await prisma.$queryRawUnsafe<NapMasterRecord[]>(
        `UPDATE "NapMasterRecord"
         SET "name" = COALESCE($2, "name"),
             "address" = COALESCE($3, "address"),
             "phone" = COALESCE($4, "phone"),
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE "locationId" = $1::uuid
         RETURNING *`,
        id,
        payload.name ?? null,
        payload.address ?? null,
        payload.phone ?? null
      )
      : await prisma.$queryRawUnsafe<NapMasterRecord[]>(
        `INSERT INTO "NapMasterRecord" ("businessId", "locationId", "name", "address", "phone")
         VALUES ($1::uuid, $2::uuid, $3, $4, $5)
         RETURNING *`,
        location.businessId,
        id,
        payload.name ?? location.name ?? location.business?.name ?? null,
        payload.address ?? location.address ?? null,
        payload.phone ?? location.business?.phone ?? null
      );

    return NextResponse.json(
      createSuccessResponse(toRecord(updated[0]), 'NAP master record updated')
    );
  } catch (error) {
    console.error('Error updating NAP master record:', error);

    return NextResponse.json(
      createErrorResponse('Failed to update NAP master record', 'INTERNAL_SERVER_ERROR', 500, error),
      { status: 500 }
    );
  }
}
