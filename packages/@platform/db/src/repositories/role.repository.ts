import { Prisma, Role } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * Role Repository
 * 
 * Handles all database operations related to roles and permissions.
 */
export class RoleRepository extends BaseRepository<
    Role,
    typeof prisma.role,
    Prisma.RoleWhereInput,
    Prisma.RoleOrderByWithRelationInput,
    Prisma.RoleCreateInput,
    Prisma.RoleUpdateInput
> {
    constructor() {
        super(prisma.role, 'Role');
    }

    /**
     * Find role by name
     */
    async findByName(name: string): Promise<Role | null> {
        return this.delegate.findUnique({
            where: { name },
        });
    }

    /**
     * Find role with all permissions
     */
    async findWithPermissions(id: string) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }

    /**
     * Find role with users who have this role
     */
    async findWithUsers(id: string) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                userRoles: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Create role with permissions
     */
    async createWithPermissions(
        roleData: Omit<Prisma.RoleCreateInput, 'permissions'>,
        permissionIds: string[]
    ) {
        return this.transaction(async (tx) => {
            // Create role
            const role = await tx.role.create({
                data: roleData,
            });

            // Assign permissions
            if (permissionIds.length > 0) {
                await tx.rolePermission.createMany({
                    data: permissionIds.map((permissionId) => ({
                        roleId: role.id,
                        permissionId,
                    })),
                });
            }

            // Return role with permissions
            return tx.role.findUnique({
                where: { id: role.id },
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });
        });
    }

    /**
     * Assign permission to role
     */
    async assignPermission(roleId: string, permissionId: string) {
        return prisma.rolePermission.create({
            data: {
                roleId,
                permissionId,
            },
            include: {
                permission: true,
                role: true,
            },
        });
    }

    /**
     * Remove permission from role
     */
    async removePermission(roleId: string, permissionId: string) {
        return prisma.rolePermission.delete({
            where: {
                roleId_permissionId: {
                    roleId,
                    permissionId,
                },
            },
        });
    }

    /**
     * Sync role permissions (replace all permissions)
     */
    async syncPermissions(roleId: string, permissionIds: string[]) {
        return this.transaction(async (tx) => {
            // Remove all existing permissions
            await tx.rolePermission.deleteMany({
                where: { roleId },
            });

            // Add new permissions
            if (permissionIds.length > 0) {
                await tx.rolePermission.createMany({
                    data: permissionIds.map((permissionId) => ({
                        roleId,
                        permissionId,
                    })),
                });
            }

            // Return updated role
            return tx.role.findUnique({
                where: { id: roleId },
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });
        });
    }

    /**
     * Check if role has specific permission
     */
    async hasPermission(roleId: string, permissionAction: string): Promise<boolean> {
        const rolePermission = await prisma.rolePermission.findFirst({
            where: {
                roleId,
                permission: {
                    action: permissionAction,
                },
            },
        });

        return !!rolePermission;
    }

    /**
     * Get all permissions for a role
     */
    async getPermissions(roleId: string) {
        const rolePermissions = await prisma.rolePermission.findMany({
            where: { roleId },
            include: {
                permission: true,
            },
        });

        return rolePermissions.map((rp) => rp.permission);
    }

    /**
     * Find roles with specific permission
     */
    async findByPermission(permissionAction: string) {
        return this.delegate.findMany({
            where: {
                permissions: {
                    some: {
                        permission: {
                            action: permissionAction,
                        },
                    },
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }

    /**
     * Get role statistics
     */
    async getStats() {
        const [total, withUsers, withPermissions] = await Promise.all([
            this.count({}),
            this.delegate.count({
                where: {
                    userRoles: {
                        some: {},
                    },
                },
            }),
            this.delegate.count({
                where: {
                    permissions: {
                        some: {},
                    },
                },
            }),
        ]);

        return {
            total,
            withUsers,
            withPermissions,
            withoutPermissions: total - withPermissions,
        };
    }
}

// Export singleton instance
export const roleRepository = new RoleRepository();
