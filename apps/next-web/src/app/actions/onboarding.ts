/* eslint-disable import/no-unresolved */
'use server'

import { z } from 'zod'

import { prisma, businessRepository } from '@platform/db'

import { getServerUser } from '@/utils/serverAuth'

type OnboardingResponse = {
  success: boolean
  message?: string
  businessId?: string
  errors?: Record<string, string[]>
}

const onboardingSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters'),
})

export async function createBusinessOnboarding(
  _prevState: OnboardingResponse | null,
  formData: FormData
): Promise<OnboardingResponse> {
  const user = await getServerUser()

  if (!user?.id) {
    return { success: false, message: 'Unauthorized' }
  }

  const payload = {
    businessName: String(formData.get('businessName') || '')
  }

  const validation = onboardingSchema.safeParse(payload)

  if (!validation.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validation.error.flatten().fieldErrors
    }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      emailVerified: true,
      userBusinessRoles: {
        where: { deletedAt: null },
        select: { businessId: true },
        take: 1
      }
    }
  })

  if (!dbUser) {
    return { success: false, message: 'User not found' }
  }

  if (!dbUser.emailVerified) {
    return { success: false, message: 'Please verify your email first' }
  }

  if (dbUser.userBusinessRoles.length > 0) {
    return { success: true, businessId: dbUser.userBusinessRoles[0].businessId }
  }

  const ownerRole = await prisma.role.findUnique({ where: { name: 'Owner' }, select: { id: true } })

  if (!ownerRole) {
    return { success: false, message: 'Owner role is not configured' }
  }

  try {
    const businessId = await prisma.$transaction(async tx => {
      const slug = await businessRepository.generateUniqueSlug(validation.data.businessName)

      const business = await tx.business.create({
        data: {
          name: validation.data.businessName,
          slug,
          status: 'active'
        },
        select: { id: true }
      })

      await tx.userBusinessRole.create({
        data: {
          userId: user.id,
          businessId: business.id,
          roleId: ownerRole.id
        }
      })

      return business.id
    })

    return { success: true, businessId }
  } catch (error: any) {
    return { success: false, message: error?.message || 'Failed to create business' }
  }
}

