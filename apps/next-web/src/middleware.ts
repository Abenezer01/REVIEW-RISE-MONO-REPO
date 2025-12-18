import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import createMiddleware from 'next-intl/middleware'

import { locales, defaultLocale } from '@platform/i18n'

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
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

  // If user is authenticated and tries to access login page, redirect to dashboard
  if (accessToken && isPublicPath) {
    const locale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale

    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  // If user is not authenticated and tries to access protected page
  if (!accessToken && !isPublicPath) {
    // Allow access to static files
    if (pathname.startsWith('/_next') || pathname.includes('.')) {
      return NextResponse.next()
    }

    const locale = pathnameHasLocale ? pathname.split('/')[1] : defaultLocale
    const loginUrl = new URL(`/${locale}/login`, request.url)

    loginUrl.searchParams.set('returnUrl', pathname)

    return NextResponse.redirect(loginUrl)
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
