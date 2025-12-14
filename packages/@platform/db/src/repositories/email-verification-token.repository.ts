import { Prisma, EmailVerificationToken } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * EmailVerificationToken Repository
 * 
 * Handles all database operations related to email verification tokens.
 */
export class EmailVerificationTokenRepository extends BaseRepository<
    EmailVerificationToken,
    typeof prisma.emailVerificationToken,
    Prisma.EmailVerificationTokenWhereInput,
    Prisma.EmailVerificationTokenOrderByWithRelationInput,
    Prisma.EmailVerificationTokenCreateInput,
    Prisma.EmailVerificationTokenUpdateInput
> {
    constructor() {
        super(prisma.emailVerificationToken, 'EmailVerificationToken');
    }

    /**
     * Create a new email verification token
     */
    async createToken(data: Prisma.EmailVerificationTokenCreateInput) {
        return this.delegate.create({
            data,
        });
    }

    /**
     * Find token by token string
     */
    async findByToken(token: string) {
        return this.delegate.findUnique({
            where: { token },
        });
    }

    /**
     * Delete all tokens for a specific email
     */
    async deleteByEmail(email: string) {
        return this.delegate.deleteMany({
            where: { email },
        });
    }

    /**
     * Delete token by ID
     */
    async deleteToken(id: string) {
        return this.delegate.delete({
            where: { id },
        });
    }
}

// Export singleton instance
export const emailVerificationTokenRepository = new EmailVerificationTokenRepository();
