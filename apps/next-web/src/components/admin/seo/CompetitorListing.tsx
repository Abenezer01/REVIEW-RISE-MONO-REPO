'use client'

import { useMemo } from 'react'

import { Typography, Box, Chip } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import type { CompetitorDto } from '@platform/contracts'

import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'
import { ItemsListing } from '@/components/shared/listing/listing'

interface CompetitorListingProps {
    competitors: CompetitorDto[]
    isLoading: boolean
}

const CompetitorListing = ({ competitors, isLoading }: CompetitorListingProps) => {
    const formattedItems = useMemo(() => {
        return competitors.map((comp) => ({
            id: comp.id,
            primaryLabel: comp.name || comp.domain,
            secondaryLabel: comp.domain,
            metaData: {
                avgRank: comp.avgRank,
                visibilityScore: comp.visibilityScore,
                reviewCount: comp.reviewCount,
                rating: comp.rating,
                gbpCompleteness: comp.gbpCompleteness,
            },
            status: {
                label: comp.visibilityScore ? `${comp.visibilityScore.toFixed(1)}% visible` : 'N/A',
                level: comp.visibilityScore && comp.visibilityScore > 50 ? 'success' : 'warning',
            },
            actions: []
        }))
    }, [competitors])

    const columns: GridColDef[] = useMemo(() => [
        {
            field: 'primaryLabel',
            headerName: 'Competitor',
            flex: 1,
            minWidth: 200,
            renderCell: (params: any) => (
                <Box>
                    <Typography fontWeight={600}>{params.row.primaryLabel}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.secondaryLabel}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'avgRank',
            headerName: 'Avg Rank',
            width: 100,
            renderCell: (params: any) => (
                <Typography>
                    {params.row.metaData?.avgRank ? Math.round(params.row.metaData.avgRank) : '-'}
                </Typography>
            ),
        },
        {
            field: 'visibilityScore',
            headerName: 'Visibility',
            width: 120,
            renderCell: (params: any) => (
                <Chip
                    label={params.row.status?.label || 'N/A'}
                    size="small"
                    variant="tonal"
                    color={params.row.status?.level === 'success' ? 'success' : 'warning'}
                />
            ),
        },
        {
            field: 'reviewCount',
            headerName: 'Reviews',
            width: 100,
            renderCell: (params: any) => (
                <Typography>
                    {params.row.metaData?.reviewCount || '-'}
                </Typography>
            ),
        },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 100,
            renderCell: (params: any) => (
                <Typography>
                    {params.row.metaData?.rating ? `${params.row.metaData.rating.toFixed(1)} ⭐` : '-'}
                </Typography>
            ),
        },
        {
            field: 'gbpCompleteness',
            headerName: 'GBP Score',
            width: 120,
            renderCell: (params: any) => {
                const score = params.row.metaData?.gbpCompleteness
                return (
                    <Chip
                        label={score ? `${score}%` : 'N/A'}
                        size="small"
                        variant="tonal"
                        color={score && score > 70 ? 'success' : 'error'}
                    />
                )
            },
        },
    ], [])

    return (
        <ItemsListing
            title="Competitors"
            items={formattedItems}
            isLoading={isLoading}
            type={ITEMS_LISTING_TYPE.table.value}
            tableProps={{ headers: columns }}
            pagination={{
                page: 1,
                pageSize: 10,
                total: formattedItems.length,
                lastPage: 1,
            } as any}
            onPaginationChange={() => { }}
            createActionConfig={{
                show: false,
                onClick: () => { },
                onlyIcon: false,
                permission: { action: 'read', subject: 'Competitor' }
            }}
            hasSearch={false}
            hasFilter={false}
        />
    )
}

export default CompetitorListing
