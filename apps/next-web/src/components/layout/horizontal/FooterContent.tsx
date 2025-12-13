'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  return (
    <div
      className={classnames(horizontalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, all rights reserved `}</span>
        <Link href='https://vyntrise.com/' target='_blank' className='text-primary uppercase'>
          ReviewRise
        </Link>
      </p>
    </div>
  )
}

export default FooterContent
