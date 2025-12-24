/* eslint-disable import/no-unresolved */
'use client'

import { useState, useMemo } from 'react'

import {
  Box,
  Switch,
  Button,
} from '@mui/material'
import { PageHeader } from '@platform/shared-ui'

import { type GridColDef } from '@mui/x-data-grid'

import ItemsListing from '@/components/shared/listing'
import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'

import {
  type FeatureFlag,
  toggleFeatureFlag,
  deleteFeatureFlag,
} from '@/app/actions/feature-flags'

import CreateFeatureFlagDrawer from './CreateFeatureFlagDrawer'

export default function FeatureFlagsClient({
  initialFlags,
}: {
  initialFlags: FeatureFlag[]
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)

  // Filter flags
  const filteredFlags = initialFlags.filter(
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

  const handleToggle = async (id: string, currentState: boolean) => {
    await toggleFeatureFlag(id, !currentState)
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
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1.5 },
    {
      field: 'rolloutPercentage',
      headerName: 'Rollout %',
      width: 120,
      valueFormatter: (params) => `${params}%`,
    },

    {
      field: 'isEnabled',
      headerName: 'Enabled',
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
      headerName: 'Actions',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            onClick={() => handleEdit(params.row)}
          >
            Edit
          </Button>
          <Button
            color="error"
            size="small"
            onClick={async () => {
              if (confirm('Are you sure?')) await deleteFeatureFlag(params.row.id)
            }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ], [])

  return (
    <Box>
      <PageHeader
        title="Feature Flags"
        subtitle="Manage global feature flags and toggles"
      />

      <ItemsListing
        items={paginatedFlags}
        type={ITEMS_LISTING_TYPE.table.value}
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
            placeholder: 'Search feature flags...',
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
