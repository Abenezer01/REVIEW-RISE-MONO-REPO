'use client'

import { useMemo, useState, useCallback } from 'react'

import dynamic from 'next/dynamic'

import {
    Box,
    Chip,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material'
import Grid from '@mui/material/Grid'


import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import useTranslation from '@/hooks/useTranslation'
import apiClient from '@/lib/apiClient'
import { createLocationAdapter } from '@/components/shared/listing/adapters'
import RowOptions from '@/components/shared/listing/row-options'
import CustomSelectBox from '@/components/shared/form/custom-select'

// 🔥 LAZY LOAD HEAVY COMPONENTS
const ItemsListing = dynamic(
    () => import('@/components/shared/listing'),
    { ssr: false }
)

const LocationCard = dynamic(
    () => import('@/components/admin/locations/LocationCard'),
    { ssr: false }
)

const CustomSideDrawer = dynamic(
    () => import('@/components/shared/drawer/side-drawer'),
    { ssr: false }
)

const LocationForm = dynamic(
    () => import('@/components/admin/locations/LocationForm'),
    {
        ssr: false,
        loading: () => <Typography>Loading...</Typography>
    }
)

export default function LocationListClient() {
    const t = useTranslation('dashboard')

    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<any>(null)
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

    // ✅ Memoized Filter Component
    const FilterComponent = useCallback(() => (
        <Grid container spacing={5}>
            <Grid size={12}>
                <CustomSelectBox
                    fullWidth
                    label={t('locations.form.status')}
                    name="status"
                    options={[
                        { value: 'all', label: 'All' },
                        { value: 'active', label: t('locations.form.active') },
                        { value: 'archived', label: t('locations.form.archived') }
                    ]}
                />
            </Grid>
        </Grid>
    ), [t])

    const { data, meta, setPage, setPageSize, isLoading, refetch } =
        usePaginatedList(
            ['admin', 'locations', 'list', search, status],
            '/admin/locations',
            {
                search: search || undefined,
                status: status === 'all' ? undefined : status,
                ['include[business]']: 'true'
            }
        )

    const handleCreate = () => {
        setSelectedLocation(null)
        setIsDrawerOpen(true)
    }

    const handleEdit = useCallback((id: string) => {
        const location = data?.data?.find((item: any) => item.id == id)

        if (location) {
            setSelectedLocation(location)
            setIsDrawerOpen(true)
        }
    }, [data])

    const handleDelete = useCallback(async (id: string) => {
        if (!window.confirm(t('common.confirmDelete'))) return

        await apiClient.delete(`/admin/locations/${id}`)
        refetch()
    }, [t, refetch])

    const handleDrawerClose = () => {
        setIsDrawerOpen(false)
        setSelectedLocation(null)
    }

    const handleFormSuccess = () => {
        handleDrawerClose()
        refetch()
    }

    const locationAdapter = useMemo(
        () => createLocationAdapter(handleEdit, handleDelete),
        [handleEdit, handleDelete]
    )

    const formattedItems = useMemo(
        () => data?.data?.map(locationAdapter) || [],
        [data, locationAdapter]
    )

    // ✅ Memoized columns (CRITICAL)
    const columns = useMemo(() => [
        {
            field: 'primaryLabel',
            headerName: t('locations.form.name'),
            flex: 1,
            minWidth: 200,
            renderCell: (params: any) => (
                <Typography fontWeight={600}>
                    {params.row.primaryLabel}
                </Typography>
            )
        },
        {
            field: 'secondaryLabel',
            headerName: t('locations.form.address'),
            flex: 1,
            minWidth: 250
        },
        {
            field: 'status',
            headerName: t('locations.form.status'),
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
    ], [t])

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, mode) => mode && setViewMode(mode)}
                    size="small"
                >
                    <ToggleButton value="table">
                        {/* <TableRowsIcon fontSize="small" /> */}
                    </ToggleButton>
                    <ToggleButton value="grid">
                        {/* <GridViewIcon fontSize="small" /> */}
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <ItemsListing
                title="locations.listTitle"
                items={formattedItems}
                isLoading={isLoading}
                type={
                    viewMode === 'table'
                        ? ITEMS_LISTING_TYPE.table.value
                        : ITEMS_LISTING_TYPE.grid.value
                }
                ItemViewComponent={LocationCard as any}
                tableProps={{ headers: columns }}
                pagination={{
                    page: meta?.page || 1,
                    pageSize: meta?.limit || 10,
                    total: meta?.total || 0,
                    lastPage: Math.ceil((meta?.total || 0) / (meta?.limit || 10))
                }}
                onPaginationChange={(size, page) => {
                    setPage(page)
                    setPageSize(size)
                }}

                createActionConfig={{
                    show: true,
                    onClick: handleCreate,
                    onlyIcon: false,
                    permission: { action: 'create', subject: 'location' }
                }}
                hasSearch
                hasFilter
                features={{
                    search: {
                        enabled: true,
                        onSearch: (term) => setSearch(term),
                        searchKeys: ['name', 'address'],
                        permission: { action: 'read', subject: 'location' }
                    },
                    filter: {
                        enabled: true,
                        component: FilterComponent,
                        onFilter: (v: any) => setStatus(v.status || 'all'),
                        permission: { action: 'read', subject: 'location' }
                    }
                }}
            />

            {isDrawerOpen && (
                <CustomSideDrawer
                    open
                    handleClose={handleDrawerClose}
                    title="locations.form.title"
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
            )}
        </>
    )
}
