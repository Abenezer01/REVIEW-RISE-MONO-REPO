/* eslint-disable react/jsx-no-literals */
'use client'

import React from 'react'
import { Card, CardHeader, CardContent, Typography, Box, useTheme, LinearProgress, alpha } from '@mui/material'

export default function GeographicHealthMap() {
    const theme = useTheme()

    // Mocking the geographic data representation since we don't have a map library installed by default in Next.js (like Leaflet/react-simple-maps)
    // We will build a beautiful list-based visualization that feels like a geographic summary

    const locations = [
        { name: 'New York, USA', score: 92, status: 'success', reviews: 412, searches: '42k' },
        { name: 'London, UK', score: 85, status: 'primary', reviews: 298, searches: '31k' },
        { name: 'Toronto, CA', score: 76, status: 'warning', reviews: 145, searches: '18k' },
        { name: 'Sydney, AU', score: 61, status: 'error', reviews: 89, searches: '9k' }
    ]

    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader
                title="Regional Location Health"
                subheader="Performance breakdown by geographic zones."
                action={<i className="tabler-map" style={{ fontSize: '1.5rem', color: theme.palette.text.secondary }} />}
            />
            <CardContent>
                {/* Placeholder for an actual Map visualization */}
                <Box
                    sx={{
                        height: 140,
                        borderRadius: 2,
                        mb: 3,
                        background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.info.main, 0.1)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px dashed ${theme.palette.divider}`
                    }}
                >
                    <Box sx={{ textAlign: 'center' }}>
                        <i className="tabler-map-pin-filled" style={{ fontSize: '2rem', color: alpha(theme.palette.primary.main, 0.5) }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                            {'Interactive Map Visualization Placeholder'}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {locations.map((loc, index) => (
                        <Box key={index}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{loc.name}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: (theme.palette as any)[loc.status]?.main || theme.palette.primary.main }}>
                                    {loc.score}{'% Health'}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={loc.score}
                                color={loc.status as any}
                                sx={{ height: 8, borderRadius: 4, mb: 1, backgroundColor: alpha((theme.palette as any)[loc.status]?.main || theme.palette.primary.main, 0.1) }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">
                                    <i className="tabler-star" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                    {loc.reviews} {'Reviews'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    <i className="tabler-search" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                    {loc.searches} {'Searches'}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    )
}
