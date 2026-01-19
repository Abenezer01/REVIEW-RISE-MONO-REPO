/* eslint-disable import/no-unresolved */
'use server'

import { brandProfileRepository } from '@platform/db'

export async function getBrandProfileByBusinessId(businessId: string) {
  try {
    const profile = await brandProfileRepository.findFirst({
      where: { businessId }
    })

    if (!profile) {
      return {
        success: false,
        error: 'Brand profile not found'
      }
    }

    return {
      success: true,
      data: profile
    }
  } catch (error: any) {
    console.error('getBrandProfileByBusinessId error:', error)

    return {
      success: false,
      error: error.message
    }
  }
}

export async function updateAutoReplySettings(businessId: string, settings: any) {
  try {
    const profile = await brandProfileRepository.findFirst({
      where: { businessId }
    })

    if (!profile) {
      throw new Error('Brand profile not found')
    }

    const updatedProfile = await brandProfileRepository.update(profile.id, {
      autoReplySettings: settings
    } as any)

    return {
      success: true,
      data: updatedProfile
    }
  } catch (error: any) {
    console.error('updateAutoReplySettings error:', error)

    return {
      success: false,
      error: error.message
    }
  }
}
