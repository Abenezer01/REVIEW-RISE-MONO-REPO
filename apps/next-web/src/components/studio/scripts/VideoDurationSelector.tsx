'use client'

import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import { useTranslations } from 'next-intl'

const DURATIONS = [
    { value: 15, label: '15s', subtitle: 'SHORTS' },
    { value: 30, label: '30s', subtitle: 'SHORTS' },
    { value: 60, label: '60s', subtitle: 'SHORTS' }
]

interface VideoDurationSelectorProps {
    selected: number
    onChange: (duration: number) => void
}

export default function VideoDurationSelector({ selected, onChange }: VideoDurationSelectorProps) {
    const t = useTranslations('studio.scripts')
    const [customDuration, setCustomDuration] = useState('')
    const isCustom = !DURATIONS.some(d => d.value === selected)

    const handleCustomChange = (value: string) => {
        setCustomDuration(value)
        const num = parseInt(value)

        if (num && num > 0) {
            onChange(num)
        }
    }

    return (
        <Box>
            <Typography variant="body2" fontWeight="bold" mb={1.5}>
                {t('duration')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                {DURATIONS.map((duration) => (
                    <Card
                        key={duration.value}
                        onClick={() => {
                            onChange(duration.value)
                            setCustomDuration('')
                        }}
                        sx={{
                            cursor: 'pointer',
                            flex: 1,
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.5,
                            border: '2px solid',
                            borderColor: selected === duration.value ? 'primary.main' : 'divider',
                            bgcolor: selected === duration.value ? 'primary.lightOpacity' : 'transparent',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                borderColor: 'primary.main',
                                transform: 'translateY(-2px)',
                                boxShadow: 2
                            }
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            fontWeight="bold"
                            color={selected === duration.value ? 'primary.main' : 'text.primary'}
                        >
                            {duration.label}
                        </Typography>
                        <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: '0.7rem' }}
                        >
                            {duration.subtitle}
                        </Typography>
                    </Card>
                ))}
            </Box>
            <TextField
                label={t('duration')}
                placeholder={'e.g., 120'}
                type="number"
                value={customDuration}
                onChange={(e) => handleCustomChange(e.target.value)}
                fullWidth
                size="small"
                inputProps={{ min: 1, max: 600 }}
                helperText="For longer videos (up to 10 minutes)"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderColor: isCustom ? 'primary.main' : undefined
                    }
                }}
            />
        </Box>
    )
}
