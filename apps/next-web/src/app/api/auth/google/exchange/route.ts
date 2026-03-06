/* eslint-disable import/no-unresolved */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

import { SERVICES_CONFIG } from '@/configs/services'
import { authOptions } from '@/libs/auth'
import { backendClient } from '@/utils/backendClient'

const sanitizeReturnUrl = (value: string | null, locale: string) => {
  const fallback = `/${locale}/admin`

  if (!value || typeof value !== 'string') return fallback
  if (!value.startsWith('/')) return fallback

  // disallow external/absolute protocol values
  if (value.startsWith('//') || value.includes('://')) return fallback

  if (value.startsWith(`/${locale}/`)) return value

  // returnUrl from middleware is usually non-localized (/admin/...)
  return `/${locale}${value}`
}

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') || 'en'
  const returnUrl = sanitizeReturnUrl(req.nextUrl.searchParams.get('returnUrl'), locale)

  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=google_session_missing`, req.url))
  }

  try {
    const AUTH_SERVICE_URL = SERVICES_CONFIG.auth.url

    const data = await backendClient<any>('/v1/auth/google/signin', {
      method: 'POST',
      baseUrl: AUTH_SERVICE_URL,
      data: {
        email: session.user.email,
        name: session.user.name,
        image: (session.user as any).image
      }
    })

    if (!data?.accessToken) {
      return NextResponse.redirect(new URL(`/${locale}/login?error=google_exchange_failed`, req.url))
    }

    const cookieStore = await cookies()

    cookieStore.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES === 'true',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    if (data.refreshToken) {
      cookieStore.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES === 'true',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
    }

    if (data.user) {
      const name = typeof data.user.name === 'string' ? data.user.name : ''
      const nameParts = name.trim().split(' ').filter(Boolean)

      const normalizedUser = {
        id: data.user.id,
        email: data.user.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        role: data.user.role,
        roles: data.user.roles || (data.user.role ? [data.user.role] : []),
        permissions: data.user.permissions || [],
        avatar: data.user.image || '',
        username: data.user.email,
        locationId: data.user.locationId
      }

      cookieStore.set('userInfo', JSON.stringify(normalizedUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES === 'true',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
    }

    const onboardingUrl = `/${locale}/onboarding`
    const redirectTarget = data?.user?.hasBusinessRole === false ? onboardingUrl : returnUrl

    return NextResponse.redirect(new URL(redirectTarget, req.url))
  } catch {
    return NextResponse.redirect(new URL(`/${locale}/login?error=google_exchange_failed`, req.url))
  }
}
