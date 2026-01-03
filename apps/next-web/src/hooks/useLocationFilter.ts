'use client'

import { useCallback } from 'react'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export const useLocationFilter = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const locationId = searchParams.get('locationId')

  const setLocationId = useCallback((id: string | number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (id) {
      params.set('locationId', id.toString())
    } else {
      params.delete('locationId')
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, pathname, router])

  return {
    locationId,
    setLocationId
  }
}
