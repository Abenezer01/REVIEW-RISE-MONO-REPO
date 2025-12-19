/* eslint-disable import/no-unresolved */
'use client'

// React Imports
import { createContext, useContext, useState, useCallback, useMemo } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

import { useLocale } from 'next-intl'

// Type Imports
import type { ChildrenType } from '@core/types'

// Define User type
export type User = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role?: string
  username?: string
  avatar?: string
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

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

    if (returnUrl) {
      router.push(`/${locale}${returnUrl}`)

      return
    }

    const isAdmin = userData.role?.toLowerCase() === 'admin'

    router.push(`/${locale}/${isAdmin ? 'admin' : 'dashboard'}`)
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
