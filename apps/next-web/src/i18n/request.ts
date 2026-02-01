import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale
    }

    return {
        locale,
        messages: {
            common: (await import(`../../messages/${locale}/common.json`)).default,
            auth: (await import(`../../messages/${locale}/auth.json`)).default,
            dashboard: (await import(`../../messages/${locale}/dashboard.json`)).default,
            BrandProfiles: (await import(`../../messages/${locale}/BrandProfiles.json`)).default,
            studio: (await import(`../../messages/${locale}/studio.json`)).default,
            systemMessages: (await import(`../../messages/${locale}/systemMessages.json`)).default
        }
    }
})
