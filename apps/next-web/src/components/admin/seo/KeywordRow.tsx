'use client'

import { Box, Chip, Stack, Typography } from '@mui/material'

import RowOptions from '@/components/shared/listing/row-options'
import type { ListingItem } from '@/types/general/listing-item'

interface KeywordRowProps {
  data: ListingItem
}

const KeywordRow = ({ data }: KeywordRowProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={600}>{data.primaryLabel}</Typography>
        {data.secondaryLabel && (
          <Typography variant="caption" color="text.secondary">{data.secondaryLabel}</Typography>
        )}
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {Array.isArray((data as any).tags) && (data as any).tags.map((t: string) => (
            <Chip key={t} label={t} size="small" variant="outlined" />
          ))}
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        {data.status && (
          <Chip label={data.status.label} size="small" variant={data.status.variant || 'tonal'} color={data.status.color || 'default'} />
        )}
        <RowOptions item={data} options={data.actions} />
      </Stack>
    </Box>
  )
}

export default KeywordRow

