import { headers, cookies } from 'next/headers'

export async function getServerAuthHeaders(): Promise<{ Authorization?: string }> {
  const headersList = await headers()
  let authorization = headersList.get('authorization')

  if (!authorization) {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')

    if (accessToken) {
      authorization = `Bearer ${accessToken.value}`
    }
  }

  return authorization ? { Authorization: authorization } : {}
}
