import { Prisma, PlatformIntegration } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

export class PlatformIntegrationRepository extends BaseRepository<
    PlatformIntegration,
    typeof prisma.platformIntegration,
    Prisma.PlatformIntegrationWhereInput,
    Prisma.PlatformIntegrationOrderByWithRelationInput,
    Prisma.PlatformIntegrationCreateInput,
    Prisma.PlatformIntegrationUpdateInput
> {
    constructor() {
        super(prisma.platformIntegration, 'PlatformIntegration');
    }

    async findByLocationId(locationId: string) {
        return this.delegate.findMany({
            where: { locationId },
        });
    }

    async findActiveByLocationId(locationId: string) {
        return this.delegate.findMany({
            where: { locationId, status: 'active' },
        });
    }

    async findByLocationIdAndPlatform(locationId: string, platform: string) {
        return this.delegate.findFirst({
            where: { locationId, platform },
        });
    }

    /**
     * Update encrypted tokens after a refresh.
     * accessToken and refreshToken should already be AES-256-GCM encrypted strings.
     */
    async updateTokens(
        id: string,
        accessToken: string,
        refreshToken?: string,
        expiresAt?: number | bigint
    ) {
        return this.update(id, {
            accessToken,
            ...(refreshToken && { refreshToken }),
            ...(expiresAt && { expiresAt: BigInt(expiresAt) }),
        });
    }

    async updateStatus(id: string, status: 'active' | 'error' | 'disconnected') {
        return this.update(id, { status });
    }

    async upsertGoogleIntegration(data: {
        locationId: string;
        accessToken: string;
        refreshToken: string;
        expiresAt: bigint;
        gbpAccountId: string;
        gbpLocationName: string;
        gbpLocationTitle: string;
    }): Promise<PlatformIntegration> {
        return prisma.platformIntegration.upsert({
            where: {
                locationId_platform: {
                    locationId: data.locationId,
                    platform: 'google',
                },
            },
            create: {
                location: { connect: { id: data.locationId } },
                platform: 'google',
                status: 'active',
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresAt: data.expiresAt,
                gbpAccountId: data.gbpAccountId,
                gbpLocationName: data.gbpLocationName,
                gbpLocationTitle: data.gbpLocationTitle,
                connectedAt: new Date(),
            },
            update: {
                status: 'active',
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresAt: data.expiresAt,
                gbpAccountId: data.gbpAccountId,
                gbpLocationName: data.gbpLocationName,
                gbpLocationTitle: data.gbpLocationTitle,
                connectedAt: new Date(),
            },
        });
    }
}

export const platformIntegrationRepository = new PlatformIntegrationRepository();
