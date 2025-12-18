'use client'

import { Typography, Chip, Button } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import { useState } from 'react'

import Grid from '@mui/material/Grid'
import ItemsListing from '@/components/shared/listing'
import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'
import CustomSelectBox from '@/components/shared/form/custom-select'
import CustomSideDrawer from '@/components/shared/drawer/side-drawer'
import LocationForm from '@/components/admin/locations/LocationForm'

import { usePaginatedList } from '@/hooks/usePaginatedList'
import { useTranslation } from '@/hooks/useTranslation'
const LocationList = () => {
    const t = useTranslation('dashboard')
    const tCommon = useTranslation('common')

    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<any>(null)

    // Define Filter Component
    const FilterComponent = ({ formik }: { formik: any }) => {
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

    const { data, meta, setPage, setPageSize, isLoading, refetch } = usePaginatedList(
        ['admin', 'locations', 'list', search, status],
        '/admin/locations',
        {
            search: search || undefined,
            status: status === 'all' ? undefined : status
        }
    )

    const handleCreate = () => {
        setSelectedLocation(null)
        setIsDrawerOpen(true)
    }

    const handleEdit = (row: any) => {
        setSelectedLocation(row)
        setIsDrawerOpen(true)
    }

    const handleDrawerClose = () => {
        setIsDrawerOpen(false)
        setSelectedLocation(null)
    }

    const handleFormSuccess = () => {
        setIsDrawerOpen(false)
        setSelectedLocation(null)
        refetch()
    }

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: t('locations.form.name'),
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant='body2' sx={{ color: 'text.primary' }}>
                    {params.row.name}
                </Typography>
            )
        },
        {
            field: 'address',
            headerName: t('locations.form.address'),
            flex: 1,
            minWidth: 250
        },
        {
            field: 'business',
            headerName: t('locations.form.businessId'),
            flex: 1,
            minWidth: 200,
            valueGetter: (params: any) => params.row.business?.name || 'N/A'
        },
        {
            field: 'status',
            headerName: t('locations.form.status'),
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.row.status}
                    color={params.row.status === 'active' ? 'success' : 'default'}
                    size='small'
                    variant='tonal'
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <Button
                    onClick={() => handleEdit(params.row)}
                    size='small'
                    variant='text'
                >
                    Edit
                </Button>
            )
        }
    ]

    return (
        <Grid container spacing={6}>
            <Grid size={12}>
                <ItemsListing
                    title="locations.listTitle"
                    items={data?.data || []}
                    isLoading={isLoading}
                    type={ITEMS_LISTING_TYPE.table.value}
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
                            permission: { action: 'manage', subject: 'all' }
                        },
                        filter: {
                            enabled: true,
                            component: FilterComponent,
                            onFilter: (values: any) => setStatus(values.status || 'all'),
                            permission: { action: 'manage', subject: 'all' }
                        }
                    }}
                    FilterComponentItems={FilterComponent}
                />
            </Grid>

            <CustomSideDrawer
                open={isDrawerOpen}
                handleClose={handleDrawerClose}
                title="locations.form.title"
                translatedTitle={selectedLocation ? t('locations.editTitle') : t('locations.createTitle')}
            >
                {() => (
                    <LocationForm
                        initialData={selectedLocation}
                        isEdit={!!selectedLocation}
                        onCancel={handleDrawerClose}
                        onSuccess={handleFormSuccess}
                    />
                )}
            </CustomSideDrawer>
        </Grid>
    )
}

export default LocationList
