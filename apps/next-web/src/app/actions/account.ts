/* eslint-disable import/no-unresolved */
'use server'

import { revalidatePath } from 'next/cache'

import bcrypt from 'bcryptjs'

import { prisma } from '@platform/db'

import { getServerUser } from '@/utils/serverAuth'

export async function getAccounts(params: any) {
  try {
    const currentUser = await getServerUser()
    const { page = 1, limit = 10, search } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (currentUser) {
      where.id = { not: currentUser.id }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    const data = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.userRoles[0]?.role?.name || 'User',
      createdAt: u.createdAt,
      status: 'active'
    }))

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
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true
          }
        },
        userBusinessRoles: {
          include: {
            business: true
          }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
        ...user,
        status: 'active',
        role: user.userRoles[0]?.role?.name || 'User'
    }
  } catch (error: any) {
    console.error('getAccount error:', error)
    
    return { error: error.message }
  }
}

export async function getCurrentAccount() {
  try {
    const user = await getServerUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    return getAccount(user.id)
  } catch (error: any) {
    console.error('getCurrentAccount error:', error)
    
    return { error: error.message }
  }
}

export async function createAccount(data: any) {
  try {
    const { name, email, password, role } = data

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { success: false, message: 'User with this email already exists' }
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined

    if (!role) {
       return { success: false, message: 'Role is required' }
    }

    const userRole = await prisma.role.findUnique({
      where: { name: role }
    })

    if (!userRole) {
         return { success: false, message: 'Invalid role' }
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          image: data.image
        }
      })

      if (userRole) {
          await tx.userRole.create({
            data: {
              userId: user.id,
              roleId: userRole.id
            }
          })
      }

      return user
    })

    revalidatePath('/[locale]/admin/accounts')

    return { success: true, data: result }
  } catch (error: any) {
    console.error('createAccount error:', error)
    
    return { success: false, message: error.message }
  }
}

export async function updateAccount(id: string, data: any) {
  try {
    const { password, role, ...userData } = data
    
    const updateData: any = { ...userData }
    
    if (password) {
        updateData.password = await bcrypt.hash(password, 10)
    }

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { id },
            data: updateData
        })
        
        if (role) {
            const newRole = await tx.role.findUnique({ where: { name: role } })
            
            if (newRole) {
                await tx.userRole.deleteMany({ where: { userId: id } })
                await tx.userRole.create({
                    data: {
                        userId: id,
                        roleId: newRole.id
                    }
                })
            }
        }
        
        return user
    })

    revalidatePath('/admin/accounts')
    revalidatePath(`/admin/accounts/${id}`)

    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deleteAccount(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    })

    revalidatePath('/admin/accounts')

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function getRoles() {
  try {
    const roles = await prisma.role.findMany()

    return roles
  } catch (error: any) {
    console.error('getRoles error:', error)
    
    return []
  }
}
