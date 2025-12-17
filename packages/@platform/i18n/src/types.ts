import type { Locale } from './locales'

/**
 * Translation namespace types
 */
export type TranslationNamespace = 'common' | 'auth' | 'dashboard'

/**
 * Translation messages structure
 */
export interface TranslationMessages {
    [key: string]: string | TranslationMessages
}

/**
 * Locale messages structure
 */
export type LocaleMessages = Record<TranslationNamespace, TranslationMessages>

/**
 * Translation function type
 */
export type TranslationFunction = (key: string, values?: Record<string, string | number>) => string
