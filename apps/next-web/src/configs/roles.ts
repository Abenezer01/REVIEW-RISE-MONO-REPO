export const ROLES = {
  ADMIN: 'Admin',
  OWNER: 'Owner'
} as const

export type RoleType = typeof ROLES[keyof typeof ROLES]
