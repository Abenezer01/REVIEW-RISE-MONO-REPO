export const ROLES = {
  ADMIN: 'Admin',
  OWNER: 'Owner',
  MANAGER: 'Manager',
  STAFF: 'Staff'
} as const

export type RoleType = typeof ROLES[keyof typeof ROLES]
