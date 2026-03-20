/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

export interface HealthScoreRingProps {
    score: number
    size?: number
    strokeWidth?: number
}

export default function HealthScoreRing({ score, size = 180, strokeWidth = 16 }: HealthScoreRingProps) {
    const theme = useTheme()
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (score / 100) * circumference

    let color = theme.palette.error.main

    if (score >= 90) color = theme.palette.success.main
    else if (score >= 70) color = theme.palette.warning.main

    return (
        <Box sx={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={theme.palette.divider}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
            </svg>
            <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: color, lineHeight: 1 }}>{score}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 500, mt: 0.5, display: 'block' }}> {'/ 100'}</Typography>
            </Box>
        </Box>
    )
}
