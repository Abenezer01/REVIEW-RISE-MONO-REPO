/* eslint-disable import/no-unresolved */
'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@platform/db'

export async function getAccounts(params: any) {
  try {
    const { page = 1, limit = 10, search, status, plan } = params
    const skip = (page - 1) * limit

    const where: any = {
      deletedAt: null
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (plan) {
      where.subscriptions = {
        some: {
          plan: { contains: plan, mode: 'insensitive' },
          status: 'active'
        }
      }
    }

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        include: {
          subscriptions: true,
          userBusinessRoles: {
            include: {
              user: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.business.count({ where })
    ])

    const data = businesses.map(b => {
      // Try to find owner, otherwise take first user
      const ownerRole = b.userBusinessRoles.find(ubr => ubr.role.name === 'Owner') || b.userBusinessRoles[0]
      const activeSub = b.subscriptions.find(s => s.status === 'active')

      return {
        id: b.id,
        name: b.name,
        email: b.email,
        owner: ownerRole?.user?.email || 'N/A',
        ownerName: ownerRole?.user?.name || 'Unknown',
        ownerImage: ownerRole?.user?.image,
        status: b.status,
        plan: activeSub?.plan || 'Free',
        createdAt: b.createdAt
      }
    })

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('getAccounts error:', error)

    return { data: [], meta: { total: 0, page: 1, limit: 10, pages: 0 }, error: error.message }
  }
}

export async function getAccount(id: string) {
  try {
    const account = await prisma.business.findUnique({
      where: { id },
      include: {
        subscriptions: true,
        userBusinessRoles: {
          include: {
            user: true,
            role: true
          }
        },
        locations: true
      }
    })

    if (!account) {
      throw new Error('Account not found')
    }

    return account
  } catch (error: any) {
    console.error('getAccount error:', error)

    return { error: error.message }
  }
}

export async function createAccount(data: any) {
  try {
    const { plan, ...businessData } = data

    // Generate unique slug
    const baseSlug = businessData.slug || businessData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    let slug = baseSlug
    let counter = 1

    while (await prisma.business.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Start a transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Business
      const business = await tx.business.create({
        data: {
          name: businessData.name,
          slug: slug,
          email: businessData.email,
          status: businessData.status || 'active',
          subscriptions: plan ? {
            create: {
              plan: plan,
              status: 'active',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
          } : undefined
        }
      })

      // 2. Handle Owner User & Role
      if (businessData.email) {
        // Find Owner role
        let ownerRole = await tx.role.findUnique({
          where: { name: 'Owner' }
        })

        // If 'Owner' role doesn't exist, create it
        if (!ownerRole) {
          ownerRole = await tx.role.create({
            data: { name: 'Owner', description: 'Business Owner' }
          })
        }

        // Find or Create User
        let user = await tx.user.findUnique({
          where: { email: businessData.email }
        })

        if (!user) {
          user = await tx.user.create({
            data: {
              email: businessData.email,
              name: businessData.email.split('@')[0], // Fallback name
            }
          })
        }

        // Link User to Business with Owner Role
        await tx.userBusinessRole.create({
          data: {
            userId: user.id,
            businessId: business.id,
            roleId: ownerRole.id
          }
        })

        // Also add to UserRole table as requested
        // This assigns the global 'Owner' role to the user as well
        const existingUserRole = await tx.userRole.findUnique({
          where: {
            userId_roleId: {
              userId: user.id,
              roleId: ownerRole.id
            }
          }
        })

        if (!existingUserRole) {
          await tx.userRole.create({
            data: {
              userId: user.id,
              roleId: ownerRole.id
            }
          })
        }
      }

      return business
    })

    revalidatePath('/[locale]/admin/accounts')

    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function updateAccount(id: string, data: any) {
  try {
    const { plan, ...businessData } = data

    const result = await prisma.business.update({
      where: { id },
      data: businessData
    })

    if (plan) {
      // Update or create subscription
      // Find existing active subscription
      const activeSub = await prisma.subscription.findFirst({
        where: { businessId: id, status: 'active' }
      })

      if (activeSub) {
        await prisma.subscription.update({
          where: { id: activeSub.id },
          data: { plan }
        })
      } else {
        await prisma.subscription.create({
          data: {
            businessId: id,
            plan,
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        })
      }
    }

    revalidatePath('/admin/accounts')
    revalidatePath(`/admin/accounts/${id}`)

    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deleteAccount(id: string) {
  try {
    // 1. Find the business and its owner to identify the user to delete
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        userBusinessRoles: {
          include: { role: true }
        }
      }
    })

    if (!business) {
      return { success: false, message: 'Account not found' }
    }

    const ownerRole = business.userBusinessRoles.find(ubr => ubr.role.name === 'Owner')
    const ownerUserId = ownerRole?.userId

    // Perform operations in a transaction
    await prisma.$transaction(async (tx) => {
      const now = new Date()

      // 1. Soft delete the business
      await tx.business.update({
        where: { id },
        data: { deletedAt: now }
      })

      // 2. Soft delete subscriptions
      await tx.subscription.updateMany({
        where: { businessId: id },
        data: { deletedAt: now }
      })

      // 3. Soft delete locations
      await tx.location.updateMany({
        where: { businessId: id },
        data: { deletedAt: now }
      })

      // 4. Soft delete UserBusinessRoles (remove access for all users)
      await tx.userBusinessRole.updateMany({
        where: { businessId: id },
        data: { deletedAt: now }
      })

      // 5. Hard Delete the Owner User
      // Note: This will cascade delete their UserBusinessRole and UserRole entries
      if (ownerUserId) {
        await tx.user.delete({
          where: { id: ownerUserId }
        })
      }
    })

    revalidatePath('/admin/accounts')

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
