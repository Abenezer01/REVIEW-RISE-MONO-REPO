'use client'

import React from 'react'

import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useTranslations } from 'next-intl'

interface PlatformSelectorProps {
    value: string
    onChange: (value: string) => void
}

const PLATFORMS = [
    { value: 'Instagram', label: 'Instagram', icon: 'tabler-brand-instagram', color: '#E1306C' },
    { value: 'Facebook', label: 'Facebook', icon: 'tabler-brand-facebook', color: '#1877F2' },
    { value: 'LinkedIn', label: 'LinkedIn', icon: 'tabler-brand-linkedin', color: '#0A66C2' },
    { value: 'Twitter', label: 'Twitter', icon: 'tabler-brand-twitter', color: '#1DA1F2' }
]

export default function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
    const t = useTranslations('studio.captions')

    const handleChange = (event: React.MouseEvent<HTMLElement>, newPlatform: string | null) => {
        if (newPlatform !== null) {
            onChange(newPlatform)
        }
    }

    return (
        <Box>
            <Typography variant="body2" fontWeight="bold" mb={1}>{t('selectPlatform')}</Typography>
            <ToggleButtonGroup
                value={value}
                exclusive
                onChange={handleChange}
                aria-label={t('platform')}
                sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', border: 'none' }}
            >
                {PLATFORMS.map((option) => (
                    <ToggleButton
                        key={option.value}
                        value={option.value}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '8px !important', // Force rounded corners
                            px: 3,
                            py: 1.5,
                            textTransform: 'none',
                            color: 'text.secondary',
                            gap: 1,
                            backgroundColor: value === option.value ? `${option.color}15` : 'transparent',
                            '&.Mui-selected': {
                                color: option.color,
                                borderColor: option.color,
                                backgroundColor: `${option.color}20`,
                                '&:hover': {
                                    backgroundColor: `${option.color}30`,
                                }
                            },
                             '&:hover': {
                                borderColor: value === option.value ? option.color : 'text.primary'
                            }
                        }}
                    >
                        <i className={option.icon} style={{ fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="bold">{option.label}</Typography>
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    )
}
