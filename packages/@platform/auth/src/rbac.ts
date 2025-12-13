import { prisma } from '@platform/db';
import { ROLES, PERMISSIONS } from './constants';

export async function assignRoleToUser(userId: string, businessId: string, roleName: string) {
  // Ensure role exists
  let role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    // In a real app we might want to seed this, but for now we create if missing (or error)
    // For safety, let's assume roles must exist.
    throw new Error(`Role ${roleName} does not exist`);
  }

  // Create UserBusinessRole
  return prisma.userBusinessRole.upsert({
    where: {
      userId_businessId_roleId: {
        userId,
        businessId,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId,
      businessId,
      roleId: role.id,
    },
  });
}

// Helper to check precise permission (DB based check)
export async function hasPermission(userId: string, businessId: string, action: string): Promise<boolean> {
  const userRoles = await prisma.userBusinessRole.findMany({
    where: {
      userId,
      businessId,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  // Check if any role has the permission
  return userRoles.some((ubr) =>
    ubr.role.permissions.some((rp) => rp.permission.action === action)
  );
}

// In-memory or simplified check based on role name constants (if we want to avoid DB hits for standard roles)
// However, the request specifically asked for "RBAC helpers" which usually implies checking capabilities.
// Let's implement the specific requested helpers.

export async function canManageBilling(userId: string, businessId: string): Promise<boolean> {
  // Example: Only OWNER can manage billing
  // Or check for PERMISSIONS.MANAGE_BILLING if we are fully DB driven.
  // For hybrid approach (Role name based checks + Permission based):
  
  const userRoles = await getUserRolesForBusiness(userId, businessId);
  
  if (userRoles.includes(ROLES.OWNER)) return true;
  
  // Also check permission if we want granularity
  return hasPermission(userId, businessId, PERMISSIONS.MANAGE_BILLING);
}

export async function canManageReviews(userId: string, businessId: string): Promise<boolean> {
  const userRoles = await getUserRolesForBusiness(userId, businessId);
  
  if (userRoles.includes(ROLES.OWNER) || userRoles.includes(ROLES.MANAGER)) return true;
  
  return hasPermission(userId, businessId, PERMISSIONS.MANAGE_REVIEWS);
}

export async function getUserRolesForBusiness(userId: string, businessId: string): Promise<string[]> {
  const roles = await prisma.userBusinessRole.findMany({
    where: { userId, businessId },
    include: { role: true },
  });
  return roles.map(r => r.role.name);
}

/**
 * Get all roles for a user across all businesses
 * Useful for JWT payload
 */
export async function getUserRoles(userId: string) {
  const roles = await prisma.userBusinessRole.findMany({
    where: { userId },
    include: { role: true },
  });
  
  // Return a map of businessId -> roleNames[]
  const result: Record<string, string[]> = {};
  for (const r of roles) {
    if (!result[r.businessId]) {
      result[r.businessId] = [];
    }
    result[r.businessId].push(r.role.name);
  }
  return result;
}
