import type { Metadata } from 'next'

import UserProfileSettings from '@/views/admin/profile/UserProfileSettings'

import { getServerUser } from '@/utils/serverAuth'

export const metadata: Metadata = {
    title: 'Profile Settings - ReviewRise',
    description: 'Manage your personal profile and preferences'
}

export default async function ProfilePage() {
    const user = await getServerUser()

    return <UserProfileSettings user={user} />
}
