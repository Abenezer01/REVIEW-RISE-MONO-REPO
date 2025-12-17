import { notFound } from 'next/navigation'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// next-intl Imports
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

// Type Imports
import { locales, getLocaleDirection, type Locale } from '@platform/i18n'



// Platform Imports

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
    title: 'ReviewRise',
    description: 'ReviewRise - AI-Powered Local SEO & Review Management'
}

type Props = {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}

// Next Imports
import { Open_Sans } from 'next/font/google'

// Font Configuration
const openSans = Open_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-open-sans',
    weight: ['300', '400', '500', '600', '700', '800']
})

const LocaleLayout = async (props: Props) => {
    const { children, params } = props
    const { locale } = await params

    // Ensure that the incoming `locale` is valid
    if (!locales.includes(locale as Locale)) {
        notFound()
    }

    // Vars
    const systemMode = await getSystemMode()
    const direction = getLocaleDirection(locale as Locale)
    const messages = await getMessages()

    return (
        <html id='__next' lang={locale} dir={direction} suppressHydrationWarning>
            <body className={`flex is-full min-bs-full flex-auto flex-col ${openSans.className}`}>
                <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
                <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
            </body>
        </html>
    )
}

export default LocaleLayout
