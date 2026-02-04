/* eslint-disable import/no-unresolved */
'use client'

import { useState, useMemo, useEffect } from 'react'

import {
  Box,
  Switch,
  Button,
} from '@mui/material'
import { useTranslations } from 'next-intl'
import { PageHeader } from '@platform/shared-ui'

import { type GridColDef } from '@mui/x-data-grid'

import ItemsListing from '@/components/shared/listing'
import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'

import {
  type FeatureFlag,
  getFeatureFlags,
  toggleFeatureFlag,
  deleteFeatureFlag,
} from '@/app/actions/feature-flags'

import CreateFeatureFlagDrawer from './CreateFeatureFlagDrawer'

export default function FeatureFlagsClient({
  initialFlags,
}: {
  initialFlags: FeatureFlag[]
}) {
  const t = useTranslations('admin.featureFlags')
  const tc = useTranslations('common')
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)
  const [loading, setLoading] = useState(false)
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags)

  // Filter flags
  const filteredFlags = flags.filter(
    (flag) =>
      flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flag.description &&
        flag.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  })

  const paginatedFlags = filteredFlags.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  )

  useEffect(() => {
    let isMounted = true

    setLoading(true)
    getFeatureFlags()
      .then((refreshed) => {
        if (isMounted) setFlags(refreshed)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleToggle = async (id: string, currentState: boolean) => {
    setLoading(true)
    await toggleFeatureFlag(id, !currentState)
    const refreshed = await getFeatureFlags()

    setFlags(refreshed)
    setLoading(false)
  }

  const handleEdit = (flag: FeatureFlag) => {
    setEditingFlag(flag)
    setOpen(true)
  }

  const handleCloseDrawer = () => {
    setOpen(false)
    setEditingFlag(null)
  }

  const columns: GridColDef[] = useMemo(() => [
    { field: 'name', headerName: t('name'), flex: 1 },
    { field: 'description', headerName: t('description'), flex: 1.5 },
    {
      field: 'rolloutPercentage',
      headerName: t('rolloutPercent'),
      width: 120,
      valueFormatter: (params) => `${params}%`,
    },

    {
      field: 'isEnabled',
      headerName: t('enabled'),
      width: 100,
      renderCell: (params) => (
        <Switch
          checked={params.value as boolean}
          onChange={() => handleToggle(params.row.id, params.value as boolean)}
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('actions'),
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            onClick={() => handleEdit(params.row)}
          >
            {tc('common.edit')}
          </Button>
          <Button
            color="error"
            size="small"
            onClick={async () => {
              if (confirm(tc('common.confirmDelete'))) {
                setLoading(true)
                await deleteFeatureFlag(params.row.id)
                const refreshed = await getFeatureFlags()

                setFlags(refreshed)
                setLoading(false)
              }
            }}
          >
            {tc('common.delete')}
          </Button>
        </Box>
      ),
    },
  ], [t, tc])
  
  return (
    <Box>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
      />

      <ItemsListing
        items={paginatedFlags}
        type={ITEMS_LISTING_TYPE.table.value}
        isLoading={loading}
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          total: filteredFlags.length,
          lastPage: Math.ceil(filteredFlags.length / pagination.pageSize),
        }}
        onPaginationChange={(pageSize, page) =>
          setPagination({ page, pageSize })
        }
        tableProps={{
          headers: columns,
        }}
        createActionConfig={{
          show: true,
          onClick: () => setOpen(true),
          permission: { action: 'create', subject: 'feature-flag' },
          onlyIcon: false,
        }}
        hasListHeader={true}
        hasSearch={true}
        features={{
          search: {
            enabled: true,
            placeholder: t('searchPlaceholder'),
            onSearch: (term) => {
              setSearchTerm(term)
              setPagination({ ...pagination, page: 1 }) // Reset to first page on search
            },
            searchKeys: ['name', 'description'],
            permission: { action: 'read', subject: 'feature-flag' },
          },
        }}
        title=""
      />

      <CreateFeatureFlagDrawer open={open} onClose={handleCloseDrawer} editFlag={editingFlag} />
    </Box>
  )
}
