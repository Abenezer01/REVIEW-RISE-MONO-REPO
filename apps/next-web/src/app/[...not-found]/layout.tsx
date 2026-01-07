/* eslint-disable import/no-unresolved */

export const metadata = {
  title: 'Page Not Found',
  description: 'Page Not Found'
}

// import { Public_Sans } from 'next/font/google'

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import { NextIntlClientProvider } from 'next-intl'

// Platform Imports
import { defaultLocale, getLocaleDirection } from '@platform/i18n'

import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'
import '@assets/iconify-icons/generated-icons.css'

// const publicSans = Public_Sans({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-public-sans',
//   weight: ['300', '400', '500', '600', '700', '800', '900']
// })
const publicSans = { variable: 'font-sans-serif', className: 'font-sans-serif' }

export default async function NotFoundLayout({
  children
}: {
  children: React.ReactNode
}) {
  const systemMode = await getSystemMode()
  const direction = getLocaleDirection(defaultLocale)

  return (
    <html id='__next' lang={defaultLocale} dir={direction} suppressHydrationWarning>
      <body className={`flex is-full min-bs-full flex-auto flex-col ${publicSans.className}`}>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        <NextIntlClientProvider locale={defaultLocale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
