'use client'

import { useEffect, useState, useCallback } from 'react'

import dynamic from 'next/dynamic'

import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import type { KeywordDTO } from '@platform/contracts'

import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/apiClient'
import { SERVICES_CONFIG } from '@/configs/services';

const KeywordListing = dynamic(() => import('@/components/admin/seo/KeywordListing'), { ssr: false })

const API_URL = SERVICES_CONFIG.seo.url;

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
    apiClient.get(`/api/admin/users/${user.id}/businesses`).then(res => {
      const items = res.data || []

      if (items.length) {
        setBusinessId(items[0].id)
      }
    })
  }, [user?.id])

  const locationId: string | undefined = undefined

  const fetchKeywords = useCallback(async () => {
    if (!businessId) return
    setLoading(true)

    try {
      const res = await apiClient.get<KeywordDTO[]>(`${API_URL}/keywords`, {
        params: {
          businessId,
          locationId,
          limit: 200,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          tags: tagFilter || undefined
        }
      })

      setKeywords(res.data || [])
    } catch (error) {
      console.error('Failed to fetch keywords', error)
    } finally {
      setLoading(false)
    }
  }, [businessId, locationId, statusFilter, tagFilter])

  useEffect(() => {
    fetchKeywords()
  }, [fetchKeywords])

  const handleDeleteKeyword = async (id: string) => {
    try {
      await apiClient.delete(`${API_URL}/keywords/${id}`)
      await fetchKeywords()
    } catch (error) {
      console.error('Failed to delete keyword', error)
    }
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
    </Container>
  )
}
