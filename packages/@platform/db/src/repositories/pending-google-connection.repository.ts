import { Prisma, PendingGoogleConnection } from '@prisma/client';
import { prisma } from '../client';

export class PendingGoogleConnectionRepository {
    async create(data: Prisma.PendingGoogleConnectionCreateInput): Promise<PendingGoogleConnection> {
        return prisma.pendingGoogleConnection.create({ data });
    }

    async findById(id: string): Promise<PendingGoogleConnection | null> {
        return prisma.pendingGoogleConnection.findUnique({ where: { id } });
    }

    async findByNonce(nonce: string): Promise<PendingGoogleConnection | null> {
        return prisma.pendingGoogleConnection.findUnique({ where: { nonce } });
    }

    async deleteById(id: string): Promise<void> {
        await prisma.pendingGoogleConnection.delete({ where: { id } }).catch(() => {
            // Ignore if already deleted
        });
    }

    /**
     * Cleanup expired pending connections (run periodically or on connect attempts).
     */
    async deleteExpired(): Promise<number> {
        const result = await prisma.pendingGoogleConnection.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
        return result.count;
    }

    async isExpired(pending: PendingGoogleConnection): Promise<boolean> {
        return pending.expiresAt < new Date();
    }
}

export const pendingGoogleConnectionRepository = new PendingGoogleConnectionRepository();
