import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale
    }

    const adRiseMessages = (await import(`../../messages/${locale}/ad-rise.json`)).default

    return {
        locale,
        messages: {
            common: (await import(`../../messages/${locale}/common.json`)).default,
            auth: (await import(`../../messages/${locale}/auth.json`)).default,
            dashboard: (await import(`../../messages/${locale}/dashboard.json`)).default,
            BrandProfiles: (await import(`../../messages/${locale}/BrandProfiles.json`)).default,
            studio: (await import(`../../messages/${locale}/studio.json`)).default,
            systemMessages: (await import(`../../messages/${locale}/systemMessages.json`)).default,
            locations: (await import(`../../messages/${locale}/locations.json`)).default,
            theme: (await import(`../../messages/${locale}/theme.json`)).default,
            social: (await import(`../../messages/${locale}/social.json`)).default,
            settings: (await import(`../../messages/${locale}/settings.json`)).default,
            admin: (await import(`../../messages/${locale}/admin.json`)).default,
            blueprint: adRiseMessages.blueprint,
            simulator: (await import(`../../messages/${locale}/simulator.json`)).default,
            'ad-rise': adRiseMessages
        }
    }
})
