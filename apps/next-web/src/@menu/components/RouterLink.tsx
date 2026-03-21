'use client'

// React Imports
import { forwardRef } from 'react'

// Next Imports
import Link from 'next/link'
import type { LinkProps } from 'next/link'

type RouterLinkProps = Omit<LinkProps, 'href'> & {
  href: LinkProps['href']
  className?: string
  children?: any
}

export const RouterLink = forwardRef((props: RouterLinkProps, ref: any) => {
  // Props
  const { href, className, children, ...other } = props

  return (
    <Link ref={ref} href={href} className={className} {...other}>
      {children as any}
    </Link>
  )
})
