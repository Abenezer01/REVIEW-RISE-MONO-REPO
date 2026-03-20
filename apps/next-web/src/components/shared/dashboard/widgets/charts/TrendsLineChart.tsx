'use client'
import React from 'react'
import { Card, Typography, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

export interface TrendsLineChartProps {
    title: string
    yLabel?: string
    data: any[]
    xAxisKey: string
    lineKey: string
    lineColorThemeKey?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
}

export default function TrendsLineChart({ title, yLabel, data, xAxisKey, lineKey, lineColorThemeKey = 'primary' }: TrendsLineChartProps) {
    const theme = useTheme()
    const lineColor = theme.palette[lineColorThemeKey].main

    return (
        <Card sx={{ p: 3, borderRadius: 3, height: '100%', minHeight: 300 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
                {yLabel && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{yLabel}</Typography>}
            </Box>
            <Box sx={{ height: 260, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient_${lineKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey={xAxisKey} stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, color: theme.palette.text.primary }}
                            itemStyle={{ color: theme.palette.text.primary }}
                        />
                        <Area type="monotone" dataKey={lineKey} stroke={lineColor} strokeWidth={3} fillOpacity={1} fill={`url(#gradient_${lineKey})`} />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    )
}
