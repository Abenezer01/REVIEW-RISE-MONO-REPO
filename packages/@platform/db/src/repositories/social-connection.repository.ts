import { Prisma, SocialConnection } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';
import { encrypt, decrypt } from '@platform/contracts';

interface TokenData {
    accessToken: string;
    refreshToken?: string;
    tokenExpiry?: Date;
}

export class SocialConnectionRepository extends BaseRepository<
    SocialConnection,
    typeof prisma.socialConnection,
    Prisma.SocialConnectionWhereInput,
    Prisma.SocialConnectionOrderByWithRelationInput,
    Prisma.SocialConnectionCreateInput,
    Prisma.SocialConnectionUpdateInput
> {
    constructor() {
        super(prisma.socialConnection, 'SocialConnection');
    }

    /**
     * Find all connections for a business
     */
    async findByBusinessId(businessId: string) {
        const connections = await this.delegate.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
        });

        return this.decryptConnections(connections);
    }

    /**
     * Find all connections for a location
     */
    async findByLocationId(locationId: string) {
        const connections = await this.delegate.findMany({
            where: { locationId },
            orderBy: { createdAt: 'desc' },
        });

        return this.decryptConnections(connections);
    }

    /**
     * Find connections by platform
     */
    async findByPlatform(businessId: string, platform: string) {
        const connections = await this.delegate.findMany({
            where: { businessId, platform },
            orderBy: { createdAt: 'desc' },
        });

        return this.decryptConnections(connections);
    }

    /**
     * Find a specific connection by business, location, platform, and pageId
     */
    async findByUnique(
        businessId: string,
        locationId: string | null,
        platform: string,
        pageId: string | null
    ) {
        const connection = await this.delegate.findFirst({
            where: {
                businessId,
                locationId,
                platform,
                pageId,
            },
        });

        return connection ? this.decryptConnection(connection) : null;
    }

    /**
     * Find connections with tokens expiring within the specified hours
     */
    async findExpiringTokens(hoursThreshold: number = 24) {
        const expiryThreshold = new Date();
        expiryThreshold.setHours(expiryThreshold.getHours() + hoursThreshold);

        const connections = await this.delegate.findMany({
            where: {
                tokenExpiry: {
                    lte: expiryThreshold,
                    gte: new Date(), // Not already expired
                },
                status: 'active',
                refreshToken: {
                    not: null,
                },
            },
        });

        return this.decryptConnections(connections);
    }

    /**
     * Create a new connection with encrypted tokens
     */
    async createWithEncryption(data: Omit<Prisma.SocialConnectionCreateInput, 'business' | 'location'> & {
        businessId: string;
        locationId?: string;
    }) {
        const { businessId, locationId, accessToken, refreshToken, ...rest } = data;

        const encryptedData: Prisma.SocialConnectionCreateInput = {
            ...rest,
            accessToken: encrypt(accessToken),
            refreshToken: refreshToken ? encrypt(refreshToken) : undefined,
            business: {
                connect: { id: businessId },
            },
            ...(locationId && {
                location: {
                    connect: { id: locationId },
                },
            }),
        };

        const connection = await this.create(encryptedData);
        return this.decryptConnection(connection);
    }

    /**
     * Update tokens with encryption
     */
    async updateTokens(id: string, tokens: TokenData) {
        const updateData: Prisma.SocialConnectionUpdateInput = {
            accessToken: encrypt(tokens.accessToken),
            ...(tokens.refreshToken && { refreshToken: encrypt(tokens.refreshToken) }),
            ...(tokens.tokenExpiry && { tokenExpiry: tokens.tokenExpiry }),
            status: 'active',
            errorMessage: null,
            updatedAt: new Date(),
        };

        const connection = await this.update(id, updateData);
        return this.decryptConnection(connection);
    }

    /**
     * Update connection status
     */
    async updateStatus(id: string, status: string, errorMessage?: string) {
        const connection = await this.update(id, {
            status,
            errorMessage: errorMessage || null,
            updatedAt: new Date(),
        });

        return this.decryptConnection(connection);
    }

    /**
     * Update last sync timestamp
     */
    async updateLastSync(id: string) {
        const connection = await this.update(id, {
            lastSyncAt: new Date(),
            updatedAt: new Date(),
        });

        return this.decryptConnection(connection);
    }

    /**
     * Decrypt a single connection's tokens
     */
    private decryptConnection(connection: SocialConnection): SocialConnection {
        try {
            return {
                ...connection,
                accessToken: decrypt(connection.accessToken),
                refreshToken: connection.refreshToken ? decrypt(connection.refreshToken) : null,
            };
        } catch (error) {
            console.error('Error decrypting connection tokens:', error);
            // Return connection with encrypted tokens if decryption fails
            return connection;
        }
    }

    /**
     * Decrypt multiple connections' tokens
     */
    private decryptConnections(connections: SocialConnection[]): SocialConnection[] {
        return connections.map(conn => this.decryptConnection(conn));
    }

    /**
     * Get connection with encrypted tokens (for external API calls)
     */
    async findByIdWithDecryption(id: string): Promise<SocialConnection | null> {
        const connection = await this.findById(id);
        return connection ? this.decryptConnection(connection) : null;
    }
}

export const socialConnectionRepository = new SocialConnectionRepository();
