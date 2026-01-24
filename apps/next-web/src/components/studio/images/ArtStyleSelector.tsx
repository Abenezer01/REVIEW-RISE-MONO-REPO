'use client'

import React from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'

const ART_STYLES = [
    { 
        value: 'Photorealistic', 
        label: 'Photorealistic', 
        gradient: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
        icon: 'tabler-camera',
        color: '#667eea'
    },
    { 
        value: 'Digital Art', 
        label: 'Digital Art', 
        gradient: 'linear-gradient(135deg, rgba(240, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%)',
        icon: 'tabler-palette',
        color: '#f093fb'
    },
    { 
        value: '3D Render', 
        label: '3D Render', 
        gradient: 'linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)',
        icon: 'tabler-box',
        color: '#4facfe'
    },
    { 
        value: 'Illustration', 
        label: 'Illustration', 
        gradient: 'linear-gradient(135deg, rgba(67, 233, 123, 0.15) 0%, rgba(56, 249, 215, 0.15) 100%)',
        icon: 'tabler-pencil',
        color: '#43e97b'
    }
]

interface ArtStyleSelectorProps {
    selected: string
    onChange: (style: string) => void
}

export default function ArtStyleSelector({ selected, onChange }: ArtStyleSelectorProps) {
    return (
        <Box>
            <Typography variant="h6" fontWeight="bold" mb={2}>
                Choose Art Style
            </Typography>
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2 
            }}>
                {ART_STYLES.map((style) => (
                    <Card
                        key={style.value}
                        onClick={() => onChange(style.value)}
                        sx={{
                            cursor: 'pointer',
                            position: 'relative',
                            height: { xs: 100, md: 110 },
                            background: style.gradient,
                            border: selected === style.value ? '3px solid' : '2px solid transparent',
                            borderColor: selected === style.value ? 'primary.main' : 'transparent',
                            borderRadius: 2,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            '&:hover': {
                                transform: 'translateY(-4px) scale(1.02)',
                                boxShadow: 4,
                                '& .art-icon': {
                                    transform: 'scale(1.1) rotate(5deg)',
                                },
                                '& .art-label': {
                                    transform: 'translateY(-2px)'
                                }
                            },
                            '&:active': {
                                transform: 'translateY(-2px) scale(0.98)'
                            },
                            ...(selected === style.value && {
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                '@keyframes pulse': {
                                    '0%, 100%': {
                                        boxShadow: '0 0 0 0 rgba(var(--mui-palette-primary-mainChannel) / 0.4)'
                                    },
                                    '50%': {
                                        boxShadow: '0 0 0 8px rgba(var(--mui-palette-primary-mainChannel) / 0)'
                                    }
                                }
                            })
                        }}
                    >
                        {/* Icon */}
                        <i 
                            className={`${style.icon} art-icon`} 
                            style={{ 
                                fontSize: 40, 
                                color: style.color,
                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} 
                        />
                        
                        {/* Label */}
                        <Box
                            className="art-label"
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 2,
                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <Typography variant="body2" fontWeight="bold" color="text.primary">
                                {style.label}
                            </Typography>
                        </Box>
                        
                        {/* Check mark */}
                        {selected === style.value && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    bgcolor: 'primary.main',
                                    borderRadius: '50%',
                                    width: 24,
                                    height: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    animation: 'checkmark-appear 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '@keyframes checkmark-appear': {
                                        '0%': {
                                            transform: 'scale(0) rotate(-180deg)',
                                            opacity: 0
                                        },
                                        '100%': {
                                            transform: 'scale(1) rotate(0deg)',
                                            opacity: 1
                                        }
                                    }
                                }}
                            >
                                <i className="tabler-check" style={{ fontSize: 16, color: 'white' }} />
                            </Box>
                        )}
                    </Card>
                ))}
            </Box>
        </Box>
    )
}
