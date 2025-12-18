'use client'

import { Card, CardContent, Typography, Box, Chip, Divider } from '@mui/material'

import type { ListingItem } from '@/types/general/listing-item'
import RowOptions from '@/components/shared/listing/row-options'

interface LocationCardProps {
    data: ListingItem
}

const LocationCard = ({ data }: LocationCardProps) => {
    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, pb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant='h5' sx={{ fontWeight: 600 }}>
                            {data.primaryLabel}
                        </Typography>
                        <Chip
                            label={data.status?.label || 'Unknown'}
                            color={data.status?.color || 'default'}
                            variant={data.status?.variant || 'tonal'}
                            size='small'
                            sx={{ width: 'fit-content' }}
                        />
                    </Box>
                    <Box>
                        <RowOptions item={data} options={data.actions} />
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Address
                        </Typography>
                        <Typography variant='body2' sx={{ color: 'text.primary' }}>
                            {data.secondaryLabel || 'N/A'}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Business
                        </Typography>
                        <Chip
                            label={data.tertiaryLabel || 'N/A'}
                            variant='tonal'
                            size='small'
                            color='primary'
                            sx={{ backgroundColor: (theme) => `rgba(${theme.palette.primary.main}, 0.08)` }}
                        />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}

export default LocationCard
