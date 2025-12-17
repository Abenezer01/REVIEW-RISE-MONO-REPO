import { redirect } from 'next/navigation'

import { defaultLocale } from '@platform/i18n'

// Redirect to default locale
export default function RootPage() {
    redirect(`/${defaultLocale}`)
}
