'use client'

import React, { useState } from 'react'

import dynamic from 'next/dynamic'

import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import type { KeywordDTO } from '@platform/contracts'

import { useAuth } from '@/contexts/AuthContext'
import { useApiGet } from '@/hooks/useApi'
import { useSeoApiGet, useSeoApiDelete } from '@/hooks/useSeoApi'

const KeywordListing = dynamic(() => import('@/components/admin/seo/KeywordListing'), { ssr: false })

interface BusinessResponse {
  data: Array<{ id: string; name: string }>;
}

interface KeywordsResponse {
  data: KeywordDTO[];
}

export default function KeywordManager() {
  const { user } = useAuth()

  const [businessId, setBusinessId] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [search, setSearch] = useState('')

  // Fetch user businesses
  const { data: businessesData } = useApiGet<BusinessResponse>(
    ['user-businesses', user?.id || ''],
    `/admin/users/${user?.id}/businesses`,
    undefined,
    { enabled: !!user?.id }
  )

  // Auto-select first business when data loads
  React.useEffect(() => {
    const businesses = businessesData?.data || []
    if (businesses.length > 0 && !businessId) {
      setBusinessId(businesses[0].id)
    }
  }, [businessesData, businessId])

  const locationId: string | undefined = undefined

  // Fetch keywords
  const {
    data: keywordsData,
    isLoading: loading,
    refetch
  } = useSeoApiGet<KeywordsResponse>(
    ['keywords', businessId || '', statusFilter, tagFilter],
    '/keywords',
    {
      businessId,
      locationId,
      limit: 200,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      tags: tagFilter || undefined
    },
    { enabled: !!businessId }
  )

  const keywords = keywordsData?.data || []

  const deleteKeywordMutation = useSeoApiDelete('/keywords/:id', {
    onSuccess: () => {
      refetch()
    }
  })

  const handleDeleteKeyword = async (id: string) => {
    await deleteKeywordMutation.mutateAsync(id)
  }

  const fetchKeywords = async () => {
    await refetch()
  }

  const filteredRows = keywords.filter(k => {
    const byTag = tagFilter
      ? ((k.tags || []) as any).some((x: string) => x.toLowerCase().includes(tagFilter.toLowerCase()))
      : true

    const bySearch = search ? k.keyword.toLowerCase().includes(search.toLowerCase()) : true

    return byTag && bySearch
  })

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        SEO Keywords
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Add, view, and manage tracked keywords for local SEO
      </Typography>

      <KeywordListing
        keywords={filteredRows}
        isLoading={loading}
        businessId={businessId || ''}
        onDelete={handleDeleteKeyword}
        onRefetch={fetchKeywords}
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilter={val => setStatusFilter(val)}
        tagFilter={tagFilter}
        onTagFilter={setTagFilter}
        onApplyFilter={() => fetchKeywords()}
      />

      {/* Drawer and form are handled inside KeywordListing */}

      {/* Listing table rendered above via ItemsListing */}
    </Container>
  )
}
