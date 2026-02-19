/* eslint-disable import/no-unresolved */
'use client'

// React Imports
import { createContext, useContext, useState, useCallback, useMemo } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

import { useLocale } from 'next-intl'

// Type Imports
import type { ChildrenType } from '@core/types'
import menuData, { type MenuItem } from '@/configs/menu'
import { ROLES } from '@/configs/roles'

// Define User type
export type User = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role?: string
  roles?: string[]
  permissions?: string[]
  username?: string
  avatar?: string
  locationId?: string
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const matchMenu = (items: MenuItem[], path: string): { allowedRoles?: string[] } | null => {
  let bestHrefLength = -1
  let bestAllowedRoles: string[] | undefined

  const visit = (nodes: MenuItem[]) => {
    for (const item of nodes) {
      const href = item.href

      if (href && (path === href || path.startsWith(`${href}/`))) {
        if (href.length > bestHrefLength) {
          bestHrefLength = href.length
          bestAllowedRoles = item.allowedRoles as string[] | undefined
        }
      }

      if (item.children) {
        visit(item.children)
      }
    }
  }

  visit(items)

  if (bestHrefLength < 0) return null

  return { allowedRoles: bestAllowedRoles }
}

const findFirstAllowedMenuPath = (items: MenuItem[], role: string | null): string | null => {
  if (!role) return null
  const stack = [...items]

  while (stack.length) {
    const item = stack.shift()!
    const href = item.href || '/'
    const allowedRoles = item.allowedRoles as string[] | undefined

    if (
      allowedRoles &&
      (allowedRoles.includes(role) || (role === ROLES.ADMIN && allowedRoles.includes(ROLES.ADMIN))) &&
      href.startsWith('/admin')
    ) {
      return href
    }

    if (item.children) {
      stack.unshift(...item.children)
    }
  }

  return null
}

export const AuthProvider = ({ children, user: initialUser }: ChildrenType & { user: User | null }) => {
  // States
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading] = useState(false)

  // Hooks
  const router = useRouter()
  const locale = useLocale()

  // No need for client-side initAuth since we pass initialUser from server

  const login = useCallback((userData: User) => {
    setUser(userData)

    const params = new URLSearchParams(window.location.search)
    const returnUrl = params.get('returnUrl')
    const role = userData.role || userData.roles?.[0] || null

    if (returnUrl) {
      const match = matchMenu(menuData, returnUrl)

      const isAllowed =
        role &&
        match?.allowedRoles &&
        (match.allowedRoles.includes(role) || (role === ROLES.ADMIN && match.allowedRoles.includes(ROLES.ADMIN)))

      if (isAllowed) {
        router.push(`/${locale}${returnUrl}`)

        return
      }
    }

    const firstAllowedPath = findFirstAllowedMenuPath(menuData, role)

    if (firstAllowedPath) {
      router.push(`/${locale}${firstAllowedPath}`)

      return
    }

    router.push(`/${locale}/not-found`)
  }, [router, locale])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout failed', error)
    }

    setUser(null)
    router.push('/login')
  }, [router])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
