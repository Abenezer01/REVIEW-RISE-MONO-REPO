'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import { useTranslations } from 'next-intl'

import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  const t = useTranslations('common')

  return (
    <div
      className={classnames(horizontalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span className='text-textSecondary'>{t('common.copyright', { year: new Date().getFullYear() })}</span>
        <Link href='https://vyntrise.com/' target='_blank' className='text-primary uppercase'>
          {t('app.name')}
        </Link>
      </p>
    </div>
  )
}

export default FooterContent
