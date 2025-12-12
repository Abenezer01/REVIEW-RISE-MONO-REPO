import { Prisma, Permission } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * Permission Repository
 * 
 * Handles all database operations related to permissions.
 */
export class PermissionRepository extends BaseRepository<
    Permission,
    typeof prisma.permission,
    Prisma.PermissionWhereInput,
    Prisma.PermissionOrderByWithRelationInput,
    Prisma.PermissionCreateInput,
    Prisma.PermissionUpdateInput
> {
    constructor() {
        super(prisma.permission, 'Permission');
    }

    /**
     * Find permission by action
     */
    async findByAction(action: string): Promise<Permission | null> {
        return this.delegate.findUnique({
            where: { action },
        });
    }

    /**
     * Find permission with roles that have it
     */
    async findWithRoles(id: string) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }

    /**
     * Find all permissions for a specific role
     */
    async findByRoleId(roleId: string) {
        const rolePermissions = await prisma.rolePermission.findMany({
            where: { roleId },
            include: {
                permission: true,
            },
        });

        return rolePermissions.map((rp) => rp.permission);
    }

    /**
     * Find permissions by action pattern (e.g., "user:*")
     */
    async findByActionPattern(pattern: string) {
        return this.delegate.findMany({
            where: {
                action: {
                    startsWith: pattern.replace('*', ''),
                },
            },
            orderBy: {
                action: 'asc',
            },
        });
    }

    /**
     * Create multiple permissions at once
     */
    async createBulk(
        permissions: Array<{
            action: string;
            description?: string;
        }>
    ) {
        return this.transaction(async (tx) => {
            const created = await Promise.all(
                permissions.map((permission) =>
                    tx.permission.create({
                        data: permission,
                    })
                )
            );

            return created;
        });
    }

    /**
     * Check if permission exists by action
     */
    async existsByAction(action: string): Promise<boolean> {
        const permission = await this.findByAction(action);
        return !!permission;
    }

    /**
     * Get permissions grouped by resource
     * e.g., { user: [...], business: [...], ... }
     */
    async getGroupedByResource() {
        const permissions = await this.findAll();

        const grouped: Record<string, Permission[]> = {};

        permissions.forEach((permission) => {
            const [resource] = permission.action.split(':');
            if (!grouped[resource]) {
                grouped[resource] = [];
            }
            grouped[resource].push(permission);
        });

        return grouped;
    }

    /**
     * Get permission statistics
     */
    async getStats() {
        const [total, assigned, unassigned] = await Promise.all([
            this.count({}),
            this.delegate.count({
                where: {
                    roles: {
                        some: {},
                    },
                },
            }),
            this.delegate.count({
                where: {
                    roles: {
                        none: {},
                    },
                },
            }),
        ]);

        return {
            total,
            assigned,
            unassigned,
        };
    }
}

// Export singleton instance
export const permissionRepository = new PermissionRepository();
