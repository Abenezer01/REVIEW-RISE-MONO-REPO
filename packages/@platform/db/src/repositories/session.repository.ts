import { Prisma, Session } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * Session Repository
 * 
 * Handles all database operations related to sessions.
 */
export class SessionRepository extends BaseRepository<
    Session,
    typeof prisma.session,
    Prisma.SessionWhereInput,
    Prisma.SessionOrderByWithRelationInput,
    Prisma.SessionCreateInput,
    Prisma.SessionUpdateInput
> {
    constructor() {
        super(prisma.session, 'Session');
    }

    /**
     * Create a new session for a user
     */
    async createSession(data: { sessionToken: string; userId: string; expires: Date }) {
        return this.delegate.create({
            data,
        });
    }

    /**
     * Find session by token
     */
    async findSession(sessionToken: string) {
        return this.delegate.findUnique({
            where: { sessionToken },
            include: {
                user: {
                    include: {
                        userRoles: {
                            include: {
                                role: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Delete session by ID
     */
    async deleteSession(id: string) {
        return this.delegate.delete({
            where: { id },
        });
    }
}

// Export singleton instance
export const sessionRepository = new SessionRepository();
