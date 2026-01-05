'use client'

import { useEffect, useState, useCallback } from 'react'

import dynamic from 'next/dynamic'

import axios from 'axios'

import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import type { KeywordDTO } from '@platform/contracts'

import { useAuth } from '@/contexts/AuthContext'

const KeywordListing = dynamic(() => import('@/components/admin/seo/KeywordListing'), { ssr: false })

const API_URL = 'http://localhost:3012/api/v1'

export default function KeywordManager() {
  const { user } = useAuth()

  const [businessId, setBusinessId] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<KeywordDTO[]>([])
  const [loading, setLoading] = useState(false)

  const [tagFilter, setTagFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user?.id) return
    axios.get(`/api/admin/users/${user.id}/businesses`).then(res => {
      const items = res.data?.data || []

      if (items.length) {
        setBusinessId(items[0].id)
      }
    })
  }, [user?.id])

  const locationId: string | undefined = undefined

  const fetchKeywords = useCallback(async () => {
    if (!businessId) return
    setLoading(true)

    const res = await axios.get(`${API_URL}/keywords`, {
      params: {
        businessId,
        locationId,
        limit: 200,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        tags: tagFilter || undefined
      }
    })

    const items = (res.data?.data || []) as KeywordDTO[]

    setKeywords(items)
    setLoading(false)
  }, [businessId, locationId, statusFilter, tagFilter])

  useEffect(() => {
    fetchKeywords()
  }, [fetchKeywords])

  const handleDeleteKeyword = async (id: string) => {
    await axios.delete(`${API_URL}/keywords/${id}`)
    await fetchKeywords()
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
