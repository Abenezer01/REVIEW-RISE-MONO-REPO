/**
 * Supported locales configuration
 */
export const locales = ['en', 'ar'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/**
 * Locale metadata including display information
 */
export interface LocaleMetadata {
    code: Locale
    name: string
    nativeName: string
    direction: 'ltr' | 'rtl'
    flag: string
}

export const localeMetadata: Record<Locale, LocaleMetadata> = {
    en: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
        flag: '🇺🇸'
    },
    ar: {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        direction: 'rtl',
        flag: '🇸🇦'
    }
}

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
    return locales.includes(locale as Locale)
}

/**
 * Get locale metadata safely
 */
export function getLocaleMetadata(locale: Locale): LocaleMetadata {
    return localeMetadata[locale]
}

/**
 * Get locale direction
 */
export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
    return localeMetadata[locale].direction
}
