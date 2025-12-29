'use client'

import { Card, CardContent, Typography, Box, Chip, Divider, Stack } from '@mui/material'

import RowOptions from '@/components/shared/listing/row-options'
import type { ListingItem } from '@/types/general/listing-item'

interface KeywordCardProps {
  data: ListingItem
}

const KeywordCard = ({ data }: KeywordCardProps) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {data.primaryLabel}
            </Typography>
            {data.secondaryLabel && (
              <Typography variant="caption" color="text.secondary">
                {data.secondaryLabel}
              </Typography>
            )}
            {data.status && (
              <Chip
                label={data.status.label}
                color={data.status.color || 'default'}
                variant={data.status.variant || 'tonal'}
                size="small"
                sx={{ width: 'fit-content' }}
              />
            )}
          </Box>
          <Box>
            <RowOptions item={data} options={data.actions} />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {Array.isArray((data as any).tags) && (data as any).tags.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {(data as any).tags.map((t: string) => (
              <Chip key={t} label={t} size="small" variant="outlined" />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

export default KeywordCard

