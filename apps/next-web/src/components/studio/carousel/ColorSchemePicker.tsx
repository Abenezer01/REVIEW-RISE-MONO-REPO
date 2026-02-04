'use client'

import React from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'

const COLOR_SCHEMES = [
    { value: 'orange', color: '#FF8C42' },
    { value: 'blue', color: '#4A90E2' },
    { value: 'purple', color: '#9C27B0' },
    { value: 'green', color: '#4CAF50' },
    { value: 'pink', color: '#E91E63' }
]

interface ColorSchemePickerProps {
    selected: string
    onChange: (color: string) => void
}

export default function ColorSchemePicker({ selected, onChange }: ColorSchemePickerProps) {
    const t = useTranslations('studio.carousels')

    return (
        <Box>
            <Typography variant="body2" fontWeight="bold" mb={1.5}>
                {t('adjustColors')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
                {COLOR_SCHEMES.map((scheme) => (
                    <Box
                        key={scheme.value}
                        onClick={() => onChange(scheme.value)}
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: scheme.color,
                            cursor: 'pointer',
                            border: '3px solid',
                            borderColor: selected === scheme.value ? 'text.primary' : 'transparent',
                            transition: 'all 0.2s ease-in-out',
                            position: 'relative',
                            '&:hover': {
                                transform: 'scale(1.1)',
                                boxShadow: 2
                            }
                        }}
                    >
                        {selected === scheme.value && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <i className="tabler-check" style={{ fontSize: 20, color: 'white' }} />
                            </Box>
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    )
}
