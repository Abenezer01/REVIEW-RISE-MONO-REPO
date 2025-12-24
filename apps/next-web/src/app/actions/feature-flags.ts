'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@platform/db'

import { z } from 'zod'

const featureFlagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isEnabled: z.boolean().default(false),
  rolloutPercentage: z.number().min(0).max(100).default(100),
  rules: z.any().optional(),
})

export type FeatureFlag = {
  id: string
  name: string
  description: string | null
  isEnabled: boolean
  rolloutPercentage: number
  rules: any
  createdAt: Date
  updatedAt: Date
}

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Cast to ensure type compatibility if DB has extra fields we don't map yet
    return flags as unknown as FeatureFlag[]
  } catch (error) {
    console.error('Failed to fetch feature flags:', error)

    return []
  }
}

export async function createFeatureFlag(formData: FormData) {
  const data = {
    name: formData.get('name'),
    description: formData.get('description'),
    isEnabled: formData.get('isEnabled') === 'on',
    rolloutPercentage: Number(formData.get('rolloutPercentage') || 100),
    rules: formData.get('rules') ? JSON.parse(formData.get('rules') as string) : undefined,
  }

  const parsed = featureFlagSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors }
  }

  try {
    await prisma.featureFlag.create({
      data: parsed.data as any,
    })
    revalidatePath('/[locale]/admin/settings/feature-flags', 'page')

    return { success: true }
  } catch (error) {
    console.error('Failed to create feature flag:', error)

    return { success: false, error: 'Failed to create feature flag. Name might already exist.' }
  }
}

export async function updateFeatureFlag(id: string, formData: FormData) {
  const data = {
    name: formData.get('name'),
    description: formData.get('description'),
    isEnabled: formData.get('isEnabled') === 'on',
    rolloutPercentage: Number(formData.get('rolloutPercentage') || 100),
    rules: formData.get('rules') ? JSON.parse(formData.get('rules') as string) : undefined,
  }

  const parsed = featureFlagSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors }
  }

  try {
    await prisma.featureFlag.update({
      where: { id },
      data: parsed.data as any,
    })
    revalidatePath('/[locale]/admin/settings/feature-flags', 'page')

    return { success: true }
  } catch (error) {
    console.error('Failed to update feature flag:', error)

    return { success: false, error: 'Failed to update feature flag. Name might already exist.' }
  }
}

export async function toggleFeatureFlag(id: string, isEnabled: boolean) {
  try {
    await prisma.featureFlag.update({
      where: { id },
      data: { isEnabled },
    })
    revalidatePath('/[locale]/admin/settings/feature-flags', 'page')

    return { success: true }
  } catch (error) {
    console.error('Failed to toggle feature flag:', error)

    return { success: false, error: 'Failed to toggle feature flag' }
  }
}

export async function deleteFeatureFlag(id: string) {
  try {
    await prisma.featureFlag.delete({
      where: { id },
    })
    revalidatePath('/[locale]/admin/settings/feature-flags', 'page')

    return { success: true }
  } catch (error) {
    console.error('Failed to delete feature flag:', error)

    return { success: false, error: 'Failed to delete feature flag' }
  }
}
