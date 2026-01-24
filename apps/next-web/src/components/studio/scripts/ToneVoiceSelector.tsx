'use client'

import React from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

const TONES = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'energetic', label: 'Energetic' },
    { value: 'educational', label: 'Educational' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'humorous', label: 'Humorous' }
]

interface ToneVoiceSelectorProps {
    selected: string
    onChange: (tone: string) => void
}

export default function ToneVoiceSelector({ selected, onChange }: ToneVoiceSelectorProps) {
    return (
        <Box>
            <Typography variant="body2" fontWeight="bold" mb={1.5}>
                Tone & Voice
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {TONES.map((tone) => (
                    <Chip
                        key={tone.value}
                        label={tone.label}
                        onClick={() => onChange(tone.value)}
                        variant={selected === tone.value ? 'filled' : 'outlined'}
                        color={selected === tone.value ? 'primary' : 'default'}
                        sx={{
                            fontWeight: selected === tone.value ? 'bold' : 'medium',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 1
                            }
                        }}
                    />
                ))}
            </Box>
        </Box>
    )
}
