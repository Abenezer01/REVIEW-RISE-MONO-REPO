/* eslint-disable import/no-unresolved */
'use server'

import { revalidatePath } from 'next/cache'

import { jobRepository } from '@platform/db'

export async function getJobs(params: any) {
  try {
    const { page = 1, limit = 10, type, businessId, locationId, fromDate, toDate, search } = params

    // Normalize type array if it comes as string or undefined
    let types = type

    if (typeof type === 'string') {
        // If empty string, treat as undefined (all types)
        if (type.trim() === '') {
            types = undefined
        } else {
            types = [type]
        }
    }

    const result = await jobRepository.findFailedJobs({
      page: Number(page),
      limit: Number(limit),
      type: types,
      businessId,
      locationId,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      search,
    })

    return {
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.totalPages
      }
    }
  } catch (error: any) {
    console.error('getJobs error:', error)

    return { success: false, error: error.message, data: [], meta: { total: 0, page: 1, limit: 10, pages: 0 } }
  }
}

export async function retryJob(id: string) {
  try {
    await jobRepository.retryJob(id)
    revalidatePath('/admin/jobs')

    return { success: true }
  } catch (error: any) {
    console.error('retryJob error:', error)

    return { success: false, error: error.message }
  }
}

export async function resolveJob(id: string, notes?: string) {
  try {
    await jobRepository.resolveJob(id, notes)
    revalidatePath('/admin/jobs')

    return { success: true }
  } catch (error: any) {
    console.error('resolveJob error:', error)

    return { success: false, error: error.message }
  }
}

export async function ignoreJob(id: string, notes?: string) {
  try {
    await jobRepository.ignoreJob(id, notes)
    revalidatePath('/admin/jobs')

    return { success: true }
  } catch (error: any) {
    console.error('ignoreJob error:', error)

    return { success: false, error: error.message }
  }
}

export async function bulkRetryJobs(ids: string[]) {
  try {
    await jobRepository.bulkRetry(ids)
    revalidatePath('/admin/jobs')

    return { success: true }
  } catch (error: any) {
    console.error('bulkRetryJobs error:', error)

    return { success: false, error: error.message }
  }
}
