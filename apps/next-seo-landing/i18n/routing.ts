import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'
import { locales, defaultLocale } from '@platform/i18n'

export const routing = defineRouting({
    locales: locales as unknown as string[],
    defaultLocale,
    localePrefix: 'always'
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
