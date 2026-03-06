/* eslint-disable import/no-unresolved */
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { prisma } from '@platform/db'

import Onboarding from '@views/Onboarding'
import { getServerUser } from '@/utils/serverAuth'

export const metadata: Metadata = {
  title: 'Onboarding',
  description: 'Create your business workspace'
}

const OnboardingPage = async () => {
  const user = await getServerUser()

  if (!user?.id) {
    redirect('/login?returnUrl=/onboarding')
  }

  const hasBusinessRole = await prisma.userBusinessRole.findFirst({
    where: {
      userId: user.id,
      deletedAt: null
    },
    select: { id: true }
  })

  if (hasBusinessRole) {
    redirect('/admin')
  }

  return <Onboarding />
}

export default OnboardingPage
