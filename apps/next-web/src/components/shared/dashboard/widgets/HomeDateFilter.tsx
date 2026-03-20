/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { ToggleButton, ToggleButtonGroup, Button, Box } from '@mui/material'

export type DateFilterValue = '7D' | '30D' | '90D' | 'Custom'

export interface HomeDateFilterProps {
    value: DateFilterValue
    onChange: (value: DateFilterValue) => void
}

export default function HomeDateFilter({ value, onChange }: HomeDateFilterProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ToggleButtonGroup
                value={value}
                exclusive
                onChange={(e, val) => val && onChange(val)}
                size="small"
                color="primary"
            >
                <ToggleButton value="7D">{'7D'}</ToggleButton>
                <ToggleButton value="30D">{'30D'}</ToggleButton>
                <ToggleButton value="90D">{'90D'}</ToggleButton>
            </ToggleButtonGroup>
            <Button
                variant={value === 'Custom' ? 'contained' : 'outlined'}
                color="primary"
                startIcon={<i className="tabler-calendar" style={{ fontSize: '1.25rem' }} />}
                onClick={() => onChange('Custom')}
                sx={{ height: 38, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
            >
                Custom
            </Button>
        </Box>
    )
}
