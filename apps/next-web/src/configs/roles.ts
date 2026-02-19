export const ROLES = {
  ADMIN: 'Admin',
  OWNER: 'Owner',
  MANAGER: 'Manager',
  STAFF: 'Staff',
  VIEW: 'Viewer'
} as const

export type RoleType = typeof ROLES[keyof typeof ROLES]
