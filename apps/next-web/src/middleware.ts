/* eslint-disable import/no-unresolved */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import createMiddleware from 'next-intl/middleware'

import { locales, defaultLocale } from '@platform/i18n'

import menuData from '@/configs/menu'
import { ROLES } from '@/configs/roles'

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')

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

  // If user is authenticated and tries to access login page, redirect to admin
  if (accessToken && isPublicPath) {
    const locale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale
    const role = getRoleFromToken(accessToken.value)
    const returnUrlParam = request.nextUrl.searchParams.get('returnUrl') || '/admin'
    const match = matchMenu(menuData, returnUrlParam)

    if (
      match?.allowedRoles &&
      role &&
      (match.allowedRoles.includes(role) || (role === ROLES.ADMIN && match.allowedRoles.includes(ROLES.ADMIN)))
    ) {

      return NextResponse.redirect(new URL(`/${locale}${returnUrlParam}`, request.url))
    }

    const fallback = findFirstAllowedMenuPath(menuData, role)

    if (fallback) {

      return NextResponse.redirect(new URL(`/${locale}${fallback}`, request.url))
    }

    const notFoundUrl = new URL(`/${locale}/not-found`, request.url)

    return NextResponse.rewrite(notFoundUrl)
  }

  // If user is not authenticated and tries to access protected page
  if (!accessToken && !isPublicPath) {
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
  if (accessToken && pathWithoutLocale.startsWith('/admin')) {
    const locale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale

    const notFoundUrl = new URL(`/${locale}/not-found`, request.url)

    const role = getRoleFromToken(accessToken.value)

    const match = matchMenu(menuData, pathWithoutLocale)

    if (match?.allowedRoles) {
      const isAllowed =
        role &&
        (match.allowedRoles.includes(role) ||
          (role === ROLES.ADMIN && match.allowedRoles.includes(ROLES.ADMIN)))

      if (!isAllowed) {

        return NextResponse.rewrite(notFoundUrl)
      }
    }
  }

  // Apply next-intl middleware for locale handling
  return intlMiddleware(request)
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
