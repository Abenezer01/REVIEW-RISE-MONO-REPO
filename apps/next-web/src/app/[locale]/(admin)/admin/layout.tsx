/* eslint-disable import/no-unresolved */
'use server'

import type { ReactNode } from 'react'

import { redirect } from 'next/navigation'

import { getServerUser } from '@/utils/serverAuth'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

/**
 * Admin section layout with server-side auth protection.
 * Route-level role authorization is handled by middleware/menu rules.
 */
const AdminSectionLayout = async (props: Props) => {
  const { children, params } = props
  const { locale } = await params

  const user = await getServerUser()

  // Require authentication; middleware handles per-route role authorization.
  if (!user) {
    redirect(`/${locale}/login?returnUrl=/admin`)
  }

  return <>{children}</>
}

export default AdminSectionLayout
