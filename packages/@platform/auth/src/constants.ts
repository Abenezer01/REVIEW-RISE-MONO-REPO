export const ROLES = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
} as const;

export type RoleType = keyof typeof ROLES;

export const PERMISSIONS = {
  MANAGE_BILLING: 'manage_billing',
  MANAGE_REVIEWS: 'manage_reviews',
  MANAGE_USERS: 'manage_users',
  VIEW_INSIGHTS: 'view_insights',
} as const;

export type PermissionType = keyof typeof PERMISSIONS;
