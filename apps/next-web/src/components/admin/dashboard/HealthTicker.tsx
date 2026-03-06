'use client'

import React from 'react'
import { Box, Typography, useTheme, alpha, keyframes } from '@mui/material'

const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`

export default function HealthTicker() {
    const theme = useTheme()

    const tickerItems = [
        { text: 'System OK', status: 'success' },
        { text: 'Google Sync Active', status: 'success' },
        { text: 'Yelp Token Expiring in 2 Days', status: 'warning' },
        { text: 'AI Background Worker: Processing 3 jobs', status: 'info' },
        { text: 'No Failed Ads', status: 'success' },
    ]

    // Duplicate for seamless infinite scroll
    const displayItems = [...tickerItems, ...tickerItems]

    return (
        <Box
            sx={{
                width: '100%',
                overflow: 'hidden',
                backgroundColor: alpha(theme.palette.background.paper, 0.4),
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                alignItems: 'center',
                height: 36,
                position: 'relative',
                mt: 'auto'
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 40,
                    zIndex: 2,
                    background: `linear-gradient(to right, ${theme.palette.background.default}, transparent)`
                }}
            />

            <Box sx={{ display: 'flex', whiteSpace: 'nowrap', animation: `${scroll} 40s linear infinite` }}>
                {displayItems.map((item, idx) => {
                    let color = theme.palette.text.secondary

                    if (item.status === 'success') color = theme.palette.success.main
                    if (item.status === 'warning') color = theme.palette.warning.main
                    if (item.status === 'error') color = theme.palette.error.main
                    if (item.status === 'info') color = theme.palette.info.main

                    return (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mr: 8 }}>
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: color,
                                    mr: 1,
                                    boxShadow: `0 0 8px ${alpha(color, 0.5)}`
                                }}
                            />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary, letterSpacing: 0.5 }}>
                                {item.text}
                            </Typography>
                        </Box>
                    )
                })}
            </Box>

            <Box
                sx={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 40,
                    zIndex: 2,
                    background: `linear-gradient(to left, ${theme.palette.background.default}, transparent)`
                }}
            />
        </Box>
    )
}
