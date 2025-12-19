import { Prisma, AuditLog } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * AuditLog Repository
 * 
 * Handles all database operations related to audit logs.
 */
export class AuditLogRepository extends BaseRepository<
    AuditLog,
    typeof prisma.auditLog,
    Prisma.AuditLogWhereInput,
    Prisma.AuditLogOrderByWithRelationInput,
    Prisma.AuditLogCreateInput,
    Prisma.AuditLogUpdateInput
> {
    constructor() {
        super(prisma.auditLog, 'AuditLog');
    }

    /**
     * Create a new audit log entry
     */
    async log(data: Prisma.AuditLogCreateInput) {
        return this.create(data);
    }
    
    /**
     * Find logs by entity
     */
    async findByEntity(entityId: string, entityType: string) {
        return this.findMany({
            where: {
                entityId,
                entityType
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}

export const auditLogRepository = new AuditLogRepository();
