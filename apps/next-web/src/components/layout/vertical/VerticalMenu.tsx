/* eslint-disable import/no-unresolved */
'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import { useTranslations } from 'next-intl'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'
import { Link } from '@/i18n/routing'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

import { useAuth } from '@/contexts/AuthContext'

// Config Imports
import menuData, { type MenuItem as MenuItemType } from '@/configs/menu'
import { type RoleType } from '@/configs/roles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { user } = useAuth()
  const t = useTranslations('dashboard')

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const renderMenuItems = (items: MenuItemType[]) => {
    return items.map((item, index) => {
      // Check if user has permission
      if (item.allowedRoles && user?.role && !item.allowedRoles.includes(user.role as RoleType)) {
        return null
      }

      // If no user and role is required, hide it (or handle as needed)
      if (item.allowedRoles && !user) {
        return null
      }

      if (item.children) {
        return (
          <SubMenu
            key={index}
            label={t(item.title as any)}
            icon={item.icon ? <i className={item.icon} /> : undefined}
          >
            {renderMenuItems(item.children)}
          </SubMenu>
        )
      }

      return (
        <MenuItem
          key={index}
          component={<Link href={(item.href as any) || '/'} />}
          icon={item.icon ? <i className={item.icon} /> : undefined}
        >
          {t(item.title as any)}
        </MenuItem>
      )
    })
  }

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {renderMenuItems(menuData)}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
