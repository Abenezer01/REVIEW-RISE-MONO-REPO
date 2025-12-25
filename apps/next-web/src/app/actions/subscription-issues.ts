/* eslint-disable import/no-unresolved */
'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@platform/db'
import type { Prisma } from '@prisma/client'

import { getServerUser } from '@/utils/serverAuth'

export type SubscriptionIssue = {
  id: string
  businessId: string
  businessName: string
  plan: string
  status: string
  currentPeriodEnd: Date
  contactedAt: Date | null
  contactedBy: string | null
  latestIssueDetails: Prisma.JsonValue | null
}

export async function getSubscriptionIssues(): Promise<SubscriptionIssue[]> {
  try {
    const user = await getServerUser()

    if (!user) throw new Error('Unauthorized')

    // Find subscriptions that are problematic:
    // 1. Status is not active
    // 2. OR Current period end is in the past
    // AND not deleted
    const issues = await prisma.subscription.findMany({
      where: {
        deletedAt: null,
        OR: [
          { status: { not: 'active' } },
          { currentPeriodEnd: { lt: new Date() } }
        ]
      },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        currentPeriodEnd: 'desc'
      }
    })

    // For each issue, find the latest 'contacted' audit log
    const issuesWithContactInfo = await Promise.all(
      issues.map(async (sub) => {
        const latestIssueLog = await prisma.auditLog.findFirst({
          where: {
            entityType: { in: ['subscription', 'Subscription'] },
            entityId: sub.id,
            action: 'subscription:issue_contacted'
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            details: true,
            createdAt: true,
            user: { select: { name: true } }
          }
        })

        const lastContactLog = await prisma.auditLog.findFirst({
          where: {
            entityType: { in: ['subscription', 'Subscription'] },
            entityId: sub.id,
            action: 'subscription:admin_contacted'
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            details: true,
            createdAt: true,
            user: { select: { name: true } }
          }
        })

        return {
          id: sub.id,
          businessId: sub.businessId,
          businessName: sub.business.name,
          plan: sub.plan,
          status: sub.status,
          currentPeriodEnd: sub.currentPeriodEnd,
          contactedAt: lastContactLog ? lastContactLog.createdAt : null,
          contactedBy: lastContactLog?.user?.name || null,
          latestIssueDetails: latestIssueLog?.details || null
        }
      })
    )

    return issuesWithContactInfo
  } catch (error) {
    console.error('Failed to fetch subscription issues:', error)

    return []
  }
}

export async function markSubscriptionAsContacted(subscriptionId: string) {
  try {
    const user = await getServerUser()

    if (!user) throw new Error('Unauthorized')

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'subscription:admin_contacted',
        entityType: 'subscription',
        entityId: subscriptionId,
        details: {
          status: 'contacted',
          note: 'Admin manually marked this subscription issue as contacted.'
        }
      }
    })

    revalidatePath('/admin/subscription-issues')

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function toggleSubscriptionStatus(subscriptionId: string, newStatus: string) {
  try {
    const user = await getServerUser()

    if (!user) throw new Error('Unauthorized')

    const currentSubscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: { status: true }
    })

    if (!currentSubscription) throw new Error('Subscription not found')
    const oldStatus = currentSubscription.status

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: newStatus }
    })
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'subscription:status_changed',
        entityType: 'subscription',
        entityId: subscriptionId,
        details: {
          oldStatus,
          newStatus
        }
      }
    })

    revalidatePath('/admin/subscription-issues')

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function resolveSubscriptionIssue(subscriptionId: string) {
  // Logic to resolve issue. For now, let's assume it means setting status to active and extending period if expired?
  // Or just setting status to active.
  return toggleSubscriptionStatus(subscriptionId, 'active')
}
