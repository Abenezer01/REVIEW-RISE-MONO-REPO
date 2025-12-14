import { Prisma, PasswordResetToken } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * PasswordResetToken Repository
 * 
 * Handles all database operations related to password reset tokens.
 */
export class PasswordResetTokenRepository extends BaseRepository<
    PasswordResetToken,
    typeof prisma.passwordResetToken,
    Prisma.PasswordResetTokenWhereInput,
    Prisma.PasswordResetTokenOrderByWithRelationInput,
    Prisma.PasswordResetTokenCreateInput,
    Prisma.PasswordResetTokenUpdateInput
> {
    constructor() {
        super(prisma.passwordResetToken, 'PasswordResetToken');
    }

    /**
     * Create a new password reset token
     */
    async createToken(data: Prisma.PasswordResetTokenCreateInput) {
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
     * Delete token by ID
     */
    async deleteToken(id: string) {
        return this.delegate.delete({
            where: { id },
        });
    }
}

// Export singleton instance
export const passwordResetTokenRepository = new PasswordResetTokenRepository();
