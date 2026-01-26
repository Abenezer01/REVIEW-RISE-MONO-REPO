/* eslint-disable import/no-unresolved */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { createSuccessResponse } from '@platform/contracts'

export async function POST() {
  const cookieStore = await cookies()

  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')

  return NextResponse.json(createSuccessResponse(null, 'Logged out successfully'))
}
