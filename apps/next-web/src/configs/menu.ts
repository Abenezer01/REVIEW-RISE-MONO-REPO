import { ROLES, type RoleType } from './roles'

export type MenuItem = {
  title: string
  href?: string
  icon?: string
  children?: MenuItem[]
  allowedRoles?: RoleType[]
}

const menuData: MenuItem[] = [
  {
    title: 'navigation.dashboard',
    href: '/admin',
    icon: 'tabler-smart-home',
    allowedRoles: [ROLES.ADMIN]
  },
  {
    title: 'navigation.accounts',
    href: '/admin/accounts',
    icon: 'tabler-users',
    allowedRoles: [ROLES.ADMIN]
  },
  {
    title: 'navigation.subscription-issues',
    href: '/admin/subscription-issues',
    icon: 'tabler-credit-card-off',
    allowedRoles: [ROLES.ADMIN]
  },
  {
    title: 'navigation.reviews',
    href: '/admin/reviews',
    icon: 'tabler-star',
    allowedRoles: [ROLES.ADMIN]
  },
  {
    title: 'navigation.social-rise',
    href: '/admin/social-rise',
    icon: 'tabler-brand-twitter',
    allowedRoles: [ROLES.ADMIN]
  },
  {
    title: 'navigation.seo-intelligence',
    href: '/admin/seo-intelligence',
    icon: 'tabler-search',
    allowedRoles: [ROLES.ADMIN]
  },
  {
    title: 'navigation.locations',
    href: '/admin/locations',
    icon: 'tabler-map-pin',
    allowedRoles: [ROLES.ADMIN]
  },
  {
    title: 'navigation.smart-reviews',
    href: '/admin/smart-reviews',
    icon: 'tabler-sparkles',
    allowedRoles: [ROLES.ADMIN]
  },
  {
    title: 'navigation.gbp-rocket',
    href: '/admin/gbp-rocket',
    icon: 'tabler-rocket',
    allowedRoles: [ROLES.ADMIN]
  },
  {
    title: 'navigation.ad-rise',
    href: '/admin/ad-rise',
    icon: 'tabler-badge-ad',
    allowedRoles: [ROLES.ADMIN]
  },
  {
    title: 'navigation.brand-rise',
    href: '/admin/brand-rise',
    icon: 'tabler-palette',
    allowedRoles: [ROLES.ADMIN]
  },
  {
    title: 'navigation.failed-jobs',
    href: '/admin/failed-jobs',
    icon: 'tabler-alert-circle',
    allowedRoles: [ROLES.ADMIN]
  },
  {
    title: 'navigation.logs',
    icon: 'tabler-cpu',
    allowedRoles: [ROLES.ADMIN],
    children: [
      {
        title: 'navigation.social-media-post-logs',
        href: '/admin/logs/social-posts',
        icon: 'tabler-brand-twitter',
        allowedRoles: [ROLES.ADMIN]
      },
      {
        title: 'navigation.review-sync-logs',
        href: '/admin/logs/reviews',
        icon: 'tabler-refresh',
        allowedRoles: [ROLES.ADMIN]
      }
    ]
  }
]

export default menuData
