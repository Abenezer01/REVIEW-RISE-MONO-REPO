/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Card, Box, Typography, useTheme, Skeleton, Chip } from '@mui/material'

export interface LocationEntry {
    id: string
    name: string
    address: string
    score: number
    napStatus: 'Healthy' | 'Warning' | 'Critical'
    rating: number
}

export interface LocationHealthMapProps {
    locations: LocationEntry[]
    isLoading?: boolean
}

function ScoreRing({ score }: { score: number }) {
    const color = score >= 80 ? '#4CAF50' : score >= 60 ? '#FF9800' : '#F44336'
    const size = 56
    const r = 22
    const circ = 2 * Math.PI * r
    const pct = score / 100

    return (
        <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eee" strokeWidth={5} />
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke={color} strokeWidth={5}
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - pct)}
                    strokeLinecap="round"
                />
            </svg>
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color, fontSize: '0.7rem' }}>{score}</Typography>
            </Box>
        </Box>
    )
}

function LocationCard({ location }: { location: LocationEntry }) {
    const theme = useTheme()
    const napColor = location.napStatus === 'Healthy' ? 'success' : location.napStatus === 'Warning' ? 'warning' : 'error'

    return (
        <Card variant="outlined" sx={{
            p: 2, borderRadius: 2,
            display: 'flex', alignItems: 'center', gap: 2,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: 4 }
        }}>
            <ScoreRing score={location.score} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25, color: 'text.primary' }} noWrap>
                    {location.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.75 }} noWrap>
                    {location.address}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={location.napStatus} size="small" color={napColor} sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        <i className="tabler-star-filled" style={{ fontSize: 11, color: theme.palette.warning.main }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                            {location.rating.toFixed(1)}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Card>
    )
}

export default function LocationHealthMap({ locations, isLoading = false }: LocationHealthMapProps) {
    const theme = useTheme()

    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Skeleton variant="text" width="45%" height={28} sx={{ mb: 2 }} />
                {[0, 1].map(i => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Skeleton variant="circular" width={56} height={56} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Skeleton variant="text" width="70%" height={20} />
                            <Skeleton variant="text" width="90%" height={16} />
                            <Skeleton variant="rectangular" width={55} height={18} sx={{ mt: 0.75, borderRadius: 4 }} />
                        </Box>
                    </Box>
                ))}
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className="tabler-building-store" style={{ color: theme.palette.primary.main, fontSize: '1.5rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Locations</Typography>
                </Box>
                <Chip label={`${locations.length} active`} size="small" color="primary" variant="outlined" />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1, overflow: 'auto' }}>
                {locations.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 4, color: 'text.secondary' }}>
                        <i className="tabler-map-off" style={{ fontSize: '2.5rem' }} />
                        <Typography variant="body2">No locations found</Typography>
                    </Box>
                ) : (
                    locations.map(loc => <LocationCard key={loc.id} location={loc} />)
                )}
            </Box>
        </Card>
    )
}
