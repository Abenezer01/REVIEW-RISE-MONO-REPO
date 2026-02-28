import { prisma } from '@platform/db';

export class GbpCompetitorsService {
    async getCompetitors(locationId: string) {
        return prisma.$queryRawUnsafe<any[]>(
            `
      SELECT *
      FROM "location_competitors"
      WHERE "locationId" = $1::uuid
      ORDER BY "createdAt" DESC
      `,
            locationId
        );
    }

    async addCompetitor(locationId: string, competitorName: string, rating?: number, reviewCount?: number, photoCount?: number, estimatedVisibility?: number) {
        const result = await prisma.$queryRawUnsafe<any[]>(
            `
      INSERT INTO "location_competitors" (
        "id", "locationId", "competitorName", "rating", "reviewCount", "photoCount", "estimatedVisibility", "createdAt"
      )
      VALUES (
        gen_random_uuid(), $1::uuid, $2, $3, $4, $5, $6, NOW()
      )
      RETURNING *
      `,
            locationId, competitorName, rating ?? null, reviewCount ?? null, photoCount ?? null, estimatedVisibility ?? null
        );
        return result[0];
    }

    async updateCompetitor(competitorId: string, locationId: string, updates: { competitorName?: string; rating?: number; reviewCount?: number; photoCount?: number; estimatedVisibility?: number }) {
        const setClauses: string[] = [];
        const values: any[] = [competitorId, locationId];
        let idx = 3;

        if (updates.competitorName !== undefined) {
            setClauses.push(`"competitorName" = $${idx++}`);
            values.push(updates.competitorName);
        }
        if (updates.rating !== undefined) {
            setClauses.push(`"rating" = $${idx++}`);
            values.push(updates.rating);
        }
        if (updates.reviewCount !== undefined) {
            setClauses.push(`"reviewCount" = $${idx++}`);
            values.push(updates.reviewCount);
        }
        if (updates.photoCount !== undefined) {
            setClauses.push(`"photoCount" = $${idx++}`);
            values.push(updates.photoCount);
        }
        if (updates.estimatedVisibility !== undefined) {
            setClauses.push(`"estimatedVisibility" = $${idx++}`);
            values.push(updates.estimatedVisibility);
        }

        if (setClauses.length === 0) {
            throw new Error("No fields to update");
        }

        const result = await prisma.$queryRawUnsafe<any[]>(
            `
      UPDATE "location_competitors"
      SET ${setClauses.join(', ')}
      WHERE "id" = $1::uuid AND "locationId" = $2::uuid
      RETURNING *
      `,
            ...values
        );

        if (result.length === 0) {
            throw new Error("Competitor not found");
        }

        return result[0];
    }

    async removeCompetitor(competitorId: string, locationId: string) {
        const result = await prisma.$executeRawUnsafe(
            `
      DELETE FROM "location_competitors"
      WHERE "id" = $1::uuid AND "locationId" = $2::uuid
      `,
            competitorId, locationId
        );
        return result > 0;
    }
}

export const gbpCompetitorsService = new GbpCompetitorsService();
