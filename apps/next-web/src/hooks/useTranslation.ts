import { useTranslations as useNextIntlTranslations } from 'next-intl'

/**
 * Type-safe translation hook wrapper for next-intl
 * 
 * @example
 * const t = useTranslation('common')
 * t('navigation.home') // Returns translated string
 */
export function useTranslation(namespace?: string) {
    return useNextIntlTranslations(namespace)
}

export default useTranslation
