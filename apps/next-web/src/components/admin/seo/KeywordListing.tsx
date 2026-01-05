'use client'

import { useMemo, useState, useCallback } from 'react'

import dynamic from 'next/dynamic'

import { Grid, Select, MenuItem, TextField, Chip, Typography, Box } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import type { KeywordDTO } from '@platform/contracts'

import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'
import { createKeywordAdapter } from '@/components/shared/listing/adapters'
import { ItemsListing } from '@/components/shared/listing/listing'
import RowOptions from '@/components/shared/listing/row-options'

const KeywordCard = dynamic(() => import('./KeywordCard'), { ssr: false })
const KeywordDrawer = dynamic(() => import('./KeywordDrawer'), { ssr: false })

interface KeywordListingProps {
  keywords: KeywordDTO[]
  isLoading: boolean
  businessId: string
  onDelete: (id: string) => Promise<void>
  onRefetch: () => Promise<void>
  search: string
  onSearch: (q: string) => void
  statusFilter: 'all' | 'active' | 'archived'
  onStatusFilter: (status: 'all' | 'active' | 'archived') => void
  tagFilter: string
  onTagFilter: (tag: string) => void
  onApplyFilter: () => void
}

const KeywordListing = ({
  keywords,
  isLoading,
  businessId,
  onDelete,
  onRefetch,
  onSearch,
  statusFilter,
  onStatusFilter,
  tagFilter,
  onTagFilter,
  onApplyFilter
}: KeywordListingProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordDTO | null>(null)

  const handleCreate = useCallback(() => {
    setSelectedKeyword(null)
    setIsDrawerOpen(true)
  }, [])

  const handleEdit = useCallback((id: string) => {
    const k = keywords.find(x => x.id === id) || null

    setSelectedKeyword(k)
    setIsDrawerOpen(true)
  }, [keywords])

  const handleDelete = useCallback(async (id: string) => {
    await onDelete(id)
  }, [onDelete])

  const handleClose = useCallback(() => {
    setIsDrawerOpen(false)
    setSelectedKeyword(null)
  }, [])

  const handleSuccess = useCallback(async () => {
    handleClose()
    await onRefetch()
  }, [handleClose, onRefetch])

  const adapter = useMemo(() => createKeywordAdapter(handleEdit, handleDelete), [handleEdit, handleDelete])
  const formattedItems = useMemo(() => keywords.map(adapter), [keywords, adapter])

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'primaryLabel',
      headerName: 'Keyword',
      flex: 1,
      minWidth: 200,
      renderCell: (params: any) => (
        <Typography fontWeight={600}>
          {params.row.primaryLabel}
        </Typography>
      )
    },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1,
      minWidth: 200,
      renderCell: (params: any) => {
        const tg = params.row.tags as string[]
        const uniqueTags = Array.from(new Set(tg || []))

        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', my: 1 }}>
            {uniqueTags.map(t => (
              <Chip key={t} label={t} size="small" variant="outlined" />
            ))}
          </Box>
        )
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: any) => (
        <Chip
          label={params.row.status?.label}
          size="small"
          variant="tonal"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params: any) => (
        <RowOptions item={params.row} options={params.row.actions} />
      )
    }
  ], [])

  return (
    <>
      <ItemsListing
        title="SEO Keywords"
        items={formattedItems}
        isLoading={isLoading}
        type={ITEMS_LISTING_TYPE.table.value}
        ItemViewComponent={KeywordCard as any}
        tableProps={{ headers: columns }}
        pagination={{
          page: 1,
          pageSize: 10,
          total: formattedItems.length,
          lastPage: 1
        } as any}
        onPaginationChange={() => { }}
        createActionConfig={{
          show: true,
          onClick: handleCreate,
          onlyIcon: false,
          permission: { action: 'create', subject: 'Keyword' }
        }}
        hasSearch
        hasFilter
        features={{
          search: {
            enabled: true,
            onSearch,
            permission: { action: 'read', subject: 'Keyword' },
            searchKeys: ['keyword']
          },
          filter: {
            enabled: true,
            component: () => (
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <Select fullWidth value={statusFilter} onChange={e => onStatusFilter(e.target.value as any)}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField label="Tag contains" value={tagFilter} onChange={e => onTagFilter(e.target.value)} fullWidth />
                </Grid>
              </Grid>
            ),
            onFilter: onApplyFilter,
            permission: { action: 'read', subject: 'Keyword' }
          }
        }}
      />

      {isDrawerOpen && (
        <KeywordDrawer
          open={isDrawerOpen}
          initialData={selectedKeyword}
          businessId={businessId}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

export default KeywordListing
