/* eslint-disable import/no-unresolved */
import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'
import { locales, defaultLocale } from '@platform/i18n'

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: locales as unknown as string[],

    // Used when no locale matches
    defaultLocale,

    // Prefix the default locale
    localePrefix: 'always',

    pathnames: {
        '/': '/',
        '/admin': {
            en: '/admin',
            ar: '/admin'
        },
        '/admin/accounts': {
            en: '/admin/accounts',
            ar: '/admin/accounts'
        },
        '/admin/accounts/[id]': {
            en: '/admin/accounts/[id]',
            ar: '/admin/accounts/[id]'
        }
    }
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
