// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Home',
    href: '/home',
    icon: 'tabler-smart-home'
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
  }

]

export default verticalMenuData
