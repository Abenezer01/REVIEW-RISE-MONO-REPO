/* eslint-disable import/no-unresolved */
'use server'

import type { ReactNode } from 'react'

import { redirect } from 'next/navigation'

import { getServerUser } from '@/utils/serverAuth'
import { ROLES } from '@/configs/roles'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

/**
 * Admin section layout with server-side route protection.
 * Guards all `/[locale]/admin/*` pages by verifying the authenticated user's role.
 * Non-admin users are redirected to the localized dashboard with a `forbidden` flag.
 */
const AdminSectionLayout = async (props: Props) => {
  const { children, params } = props
  const { locale } = await params

  const user = await getServerUser()

  // Enforce admin-only access
  if (!user || user.role !== ROLES.ADMIN) {
    redirect(`/${locale}/dashboard?error=forbidden`)
  }

  return <>{children}</>
}

export default AdminSectionLayout
