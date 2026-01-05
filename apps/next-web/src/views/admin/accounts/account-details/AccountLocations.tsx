/* eslint-disable import/no-unresolved */
'use client'

import { useMemo, useState, useCallback } from 'react'

import { Box, Chip, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'

import LocationCard from '@/components/admin/locations/LocationCard'
import LocationForm from '@/components/admin/locations/LocationForm'
import LocationListSearch from '@/components/admin/locations/LocationListSearch'
import CustomSideDrawer from '@/components/shared/drawer/side-drawer'
import CustomSelectBox from '@/components/shared/form/custom-select'
import ItemsListing from '@/components/shared/listing'
import { createLocationAdapter } from '@/components/shared/listing/adapters'
import RowOptions from '@/components/shared/listing/row-options'
import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import useTranslation from '@/hooks/useTranslation'

const AccountLocations = () => {
  const t = useTranslation('dashboard')

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  // Define Filter Component
  const FilterComponent = () => {
    return (
      <Grid container spacing={5}>
        <Grid size={12}>
          <CustomSelectBox
            fullWidth
            label={t('locations.form.status')}
            name='status'
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: t('locations.form.active') },
              { value: 'archived', label: t('locations.form.archived') }
            ]}
          />
        </Grid>
      </Grid>
    )
  }

  const {
    data: locationsData,
    meta,
    setPage,
    setPageSize,
    isLoading,
    refetch
  } = usePaginatedList(
    ['admin', 'locations', 'list', search, status],
    '/admin/locations',
    {
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      ['include[business]']: 'true'
    }
  )

  const handleCreate = () => {
    // Open drawer without pre-filled business info
    setSelectedLocation({})
    setIsDrawerOpen(true)
  }

  const handleEdit = useCallback(
    (id: string) => {
      // eslint-disable-next-line eqeqeq
      const location = locationsData?.data?.find((item: any) => item.id === id)

      if (location) {
        setSelectedLocation(location)
        setIsDrawerOpen(true)
      }
    },
    [locationsData]
  )

  const handleDelete = useCallback(async (id: string) => {
    console.log('Delete location', id)
  }, [])

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setSelectedLocation(null)
  }

  const handleFormSuccess = () => {
    setIsDrawerOpen(false)
    setSelectedLocation(null)
    refetch()
  }

  const locationAdapter = useMemo(
    () => createLocationAdapter(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  )

  const formattedItems = useMemo(() => {
    return locationsData?.data ? locationsData.data.map(locationAdapter) : []
  }, [locationsData, locationAdapter])

  const columns: GridColDef[] = [
    {
      field: 'primaryLabel',
      headerName: t('locations.form.name'),
      flex: 1,
      minWidth: 200,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
          {params.row.primaryLabel}
        </Typography>
      )
    },
    {
      field: 'secondaryLabel',
      headerName: t('locations.form.address'),
      flex: 1,
      minWidth: 250,
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {params.row.secondaryLabel}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: t('locations.form.status'),
      width: 120,
      renderCell: params => (
        <Chip
          label={params.row.status?.label}
          color={params.row.status?.color || 'default'}
          size='small'
          variant={params.row.status?.variant || 'tonal'}
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      sortable: false,
      renderCell: params => <RowOptions item={params.row} options={params.row.actions} />
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid size={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => {
              if (newMode) setViewMode(newMode)
            }}
            aria-label='view mode'
            size='small'
            color='primary'
          >
            <ToggleButton value='table' aria-label='table view'>
              <i className='tabler-table' />
            </ToggleButton>
            <ToggleButton value='grid' aria-label='grid view'>
              <i className='tabler-layout-grid' />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <ItemsListing
          title={t('locations.listTitle')}
          items={formattedItems}
          isLoading={isLoading}
          type={viewMode === 'table' ? ITEMS_LISTING_TYPE.table.value : ITEMS_LISTING_TYPE.grid.value}
          ItemViewComponent={LocationCard}
          pagination={{
            page: meta?.page || 1,
            pageSize: meta?.limit || 10,
            total: meta?.total || 0,
            lastPage: Math.ceil((meta?.total || 0) / (meta?.limit || 10))
          }}
          onPaginationChange={(pageSize: number, page: number) => {
            setPage(page)
            setPageSize(pageSize)
          }}
          tableProps={{
            headers: columns
          }}
          createActionConfig={{
            show: true,
            onClick: handleCreate,
            permission: { action: 'manage', subject: 'all' },
            onlyIcon: false
          }}
          hasSearch
          hasFilter
          features={{
            search: {
              enabled: true,
              searchKeys: ['name'],
              onSearch: (term: string) => setSearch(term),
              permission: { action: 'manage', subject: 'all' },
              component: LocationListSearch
            },
            filter: {
              enabled: true,
              component: FilterComponent,
              onFilter: (values: any) => setStatus(values.status || 'all'),
              permission: { action: 'manage', subject: 'all' }
            }
          }}
          FilterComponentItems={FilterComponent}
          breakpoints={{ xs: 12, sm: 6, md: 4, lg: 4 }}
        />
      </Grid>

      <CustomSideDrawer
        open={isDrawerOpen}
        handleClose={handleDrawerClose}
        title='locations.form.title'
        translatedTitle={selectedLocation?.id ? t('locations.editTitle') : t('locations.createTitle')}
      >
        {() => (
          <LocationForm
            initialData={selectedLocation}
            isEdit={!!selectedLocation?.id}
            onCancel={handleDrawerClose}
            onSuccess={handleFormSuccess}
          />
        )}
      </CustomSideDrawer>
    </Grid>
  )
}

export default AccountLocations
