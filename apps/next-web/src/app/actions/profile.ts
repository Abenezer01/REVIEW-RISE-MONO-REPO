'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { prisma } from '@platform/db'
import { getServerUser } from '@/utils/serverAuth'

export async function updateProfile(data: { name: string; email: string; image?: string }) {
    try {
        const user = await getServerUser()

        if (!user) throw new Error('Unauthorized')

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: data.name,
                email: data.email,
                image: data.image
            }
        })

        revalidatePath('/[locale]/admin/profile')

        return { success: true, data: updatedUser }
    } catch (error: any) {
        console.error('updateProfile error:', error)

        return { success: false, message: error.message }
    }
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
    try {
        const user = await getServerUser()

        if (!user) throw new Error('Unauthorized')

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!dbUser || !dbUser.password) {
            throw new Error('User not found or uses OAuth provider')
        }

        const isMatch = await bcrypt.compare(data.currentPassword, dbUser.password)

        if (!isMatch) {
            return { success: false, message: 'Incorrect current password' }
        }

        const hashedPassword = await bcrypt.hash(data.newPassword, 10)

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })

        return { success: true, message: 'Password updated successfully' }
    } catch (error: any) {
        console.error('changePassword error:', error)

        return { success: false, message: error.message }
    }
}
