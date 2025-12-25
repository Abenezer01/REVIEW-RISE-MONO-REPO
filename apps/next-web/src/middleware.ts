/* eslint-disable import/no-unresolved */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import createMiddleware from 'next-intl/middleware'

import { locales, defaultLocale } from '@platform/i18n'

import menuData from '@/configs/menu'
import { ROLES } from '@/configs/roles'

const isJwtExpired = (token: string): boolean => {
  try {
    const parts = token.split('.')

    if (parts.length < 2) return true
    const payload = JSON.parse(atob(parts[1]))
    const exp = typeof payload.exp === 'number' ? payload.exp * 1000 : 0

    return exp <= Date.now()
  } catch {
    return true
  }
}

const getRoleFromToken = (token: string): string | null => {
  try {
    const parts = token.split('.')

    if (parts.length < 2) return null
    const payload = JSON.parse(atob(parts[1]))
    const roles = Array.isArray(payload.roles) ? payload.roles : []

    return roles[0] || null
  } catch {

    return null
  }
}

const matchMenu = (items: typeof menuData, path: string): { allowedRoles?: string[] } | null => {
  for (const item of items) {
    const href = item.href || '/'

    if (path === href || path.startsWith(href + '/')) {
      return { allowedRoles: item.allowedRoles as string[] | undefined }
    }

    if (item.children) {
      const child = matchMenu(item.children as any, path)

      if (child) return child
    }
  }

  return null
}

const findFirstAllowedMenuPath = (items: typeof menuData, role: string | null): string | null => {
  if (!role) return null
  const stack = [...items] as any[]

  while (stack.length) {
    const item = stack.shift() as any
    const href = item.href || '/'
    const allowed = item.allowedRoles as string[] | undefined

    if (allowed && (allowed.includes(role) || (role === ROLES.ADMIN && allowed.includes(ROLES.ADMIN)))) {

      if (href.startsWith('/admin')) return href
    }

    if (item.children) {
      stack.unshift(...(item.children as any))
    }
  }

  return null
}

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessTokenCookie = request.cookies.get('accessToken')
  const refreshTokenCookie = request.cookies.get('refreshToken')
  let accessTokenValue = accessTokenCookie?.value || null
  let refreshedThisRequest = false
  let refreshResponseCookie: string | null = null

  // Public paths that don't require authentication (without locale prefix)
  const publicPaths = ['/login', '/register', '/forgot-password']

  // Check if the current path is an API route
  if (pathname.startsWith('/api')) {

    return NextResponse.next()
  }

  // Extract locale from pathname
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Get the path without locale
  const pathWithoutLocale = pathnameHasLocale
    ? pathname.slice(pathname.indexOf('/', 1))
    : pathname

  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => pathWithoutLocale.startsWith(path))

  // Attempt server-side refresh if needed
  if ((!accessTokenValue || isJwtExpired(accessTokenValue)) && refreshTokenCookie && !isPublicPath) {
    try {
      const refreshUrl = new URL('/api/auth/refresh-token', request.url)

      const res = await fetch(refreshUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenCookie.value })
      })

      if (res.ok) {
        const data = await res.json()

        if (data?.accessToken) {
          accessTokenValue = data.accessToken as string
          refreshedThisRequest = true
          refreshResponseCookie = data.accessToken as string
        }
      }
    } catch {
      // ignore network errors; fallback to normal flow
    }
  }

  // If user is authenticated and tries to access login page, redirect to admin
  if (accessTokenValue && isPublicPath) {
    const locale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale
    const role = getRoleFromToken(accessTokenValue)
    const returnUrlParam = request.nextUrl.searchParams.get('returnUrl') || '/admin'
    const match = matchMenu(menuData, returnUrlParam)

    if (
      match?.allowedRoles &&
      role &&
      (match.allowedRoles.includes(role) || (role === ROLES.ADMIN && match.allowedRoles.includes(ROLES.ADMIN)))
    ) {

      const redirectResponse = NextResponse.redirect(new URL(`/${locale}${returnUrlParam}`, request.url))

      if (refreshedThisRequest && refreshResponseCookie) {
        redirectResponse.cookies.set('accessToken', refreshResponseCookie, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7
        })
      }

      return redirectResponse
    }

    const fallback = findFirstAllowedMenuPath(menuData, role)

    if (fallback) {

      const redirectResponse = NextResponse.redirect(new URL(`/${locale}${fallback}`, request.url))

      if (refreshedThisRequest && refreshResponseCookie) {
        redirectResponse.cookies.set('accessToken', refreshResponseCookie, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7
        })
      }

      return redirectResponse
    }

    const notFoundUrl = new URL(`/${locale}/not-found`, request.url)

    const rewriteResponse = NextResponse.rewrite(notFoundUrl)

    if (refreshedThisRequest && refreshResponseCookie) {
      rewriteResponse.cookies.set('accessToken', refreshResponseCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      })
    }

    return rewriteResponse
  }

  // If user is not authenticated and tries to access protected page
  if (!accessTokenValue && !isPublicPath) {
    // Allow access to static files
    if (pathname.startsWith('/_next') || pathname.includes('.')) {

      return NextResponse.next()
    }

    const locale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale
    const loginUrl = new URL(`/${locale}/login`, request.url)

    const legacyToAdmin = (p: string) => {
      const base = p || '/'

      if (base.startsWith('/dashboard')) return '/admin'
      if (base.startsWith('/reviews')) return '/admin/reviews'
      if (base.startsWith('/social-rise')) return '/admin/social-rise'
      if (base.startsWith('/seo-intelligence')) return '/admin/seo-intelligence'

      return base
    }

    const targetReturn = legacyToAdmin(pathWithoutLocale)

    loginUrl.searchParams.set('returnUrl', targetReturn)

    return NextResponse.redirect(loginUrl)
  }

  // Role-based route guard: only allow access to routes permitted by menu configuration
  if (accessTokenValue && pathWithoutLocale.startsWith('/admin')) {
    const locale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale

    const notFoundUrl = new URL(`/${locale}/not-found`, request.url)

    const role = getRoleFromToken(accessTokenValue)

    const match = matchMenu(menuData, pathWithoutLocale)

    if (match?.allowedRoles) {
      const isAllowed =
        role &&
        (match.allowedRoles.includes(role) ||
          (role === ROLES.ADMIN && match.allowedRoles.includes(ROLES.ADMIN)))

      if (!isAllowed) {

        const rewriteResponse = NextResponse.rewrite(notFoundUrl)

        if (refreshedThisRequest && refreshResponseCookie) {
          rewriteResponse.cookies.set('accessToken', refreshResponseCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
          })
        }

        return rewriteResponse
      }
    }
  }

  // Apply next-intl middleware for locale handling
  const intlResponse = intlMiddleware(request)

  if (refreshedThisRequest && refreshResponseCookie) {
    intlResponse.cookies.set('accessToken', refreshResponseCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })
  }

  return intlResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
}
