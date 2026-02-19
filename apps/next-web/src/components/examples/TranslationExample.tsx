import { useTranslation } from '@/hooks/useTranslation'
import LocaleSwitcher from '@/components/LocaleSwitcher'

/**
 * Example component showing how to use translations
 * 
 * This demonstrates:
 * 1. Using the useTranslation hook
 * 2. Accessing nested translation keys
 * 3. Using the LocaleSwitcher component
 */
export default function TranslationExample() {
    const t = useTranslation()

    return (
        <div>
            <h1>{t('common.app.name')}</h1>
            <p>{t('common.app.description')}</p>

            <nav>
                <a href="#">{t('common.navigation.home')}</a>
                <a href="#">{t('common.navigation.dashboard')}</a>
                <a href="#">{t('common.navigation.reviews')}</a>
            </nav>

            <LocaleSwitcher />

            <button>{t('common.common.save')}</button>
            <button>{t('common.common.cancel')}</button>
        </div>
    )
}
