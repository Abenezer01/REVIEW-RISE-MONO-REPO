// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Home',
    href: '/home',
    icon: 'tabler-smart-home'
  },
  {
    label: 'SEO Intelligence',
    href: '/admin/seo-intelligence/analyzer',
    icon: 'tabler-search'
  },
  {
    label: 'About',
    href: '/about',
    icon: 'tabler-info-circle'
  },
  {
    label: 'Reviews',
    icon: 'tabler-star',
    children: [
      {
        label: 'Inbox',
        href: '/admin/reviews/inbox',
        icon: 'tabler-message'
      },
      {
        label: 'Dashboard',
        href: '/admin/reviews/dashboard',
        icon: 'tabler-chart-pie'
      }
    ]
  },
  {
    label: 'BrandingRise',
    href: '/admin/brand-rise/overview',
    icon: 'tabler-chart-dots'
  },
  {
    label: 'Ad Rise',
    icon: 'tabler-rocket',
    children: [
      {
        label: 'Blueprint Generator',
        href: '/admin/ad-rise/blueprint',
        icon: 'tabler-wand'
      }
    ]
  }
]

export default verticalMenuData
