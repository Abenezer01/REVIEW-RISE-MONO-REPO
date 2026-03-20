'use client'
import React from 'react'
import { Card, Typography, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart } from 'recharts'

export interface DualAxisReviewChartProps {
    title: string
    data: any[]
    xAxisKey: string
    barKey: string
    lineKey: string
}

export default function DualAxisReviewChart({ title, data, xAxisKey, barKey, lineKey }: DualAxisReviewChartProps) {
    const theme = useTheme()

    return (
        <Card sx={{ p: 3, borderRadius: 3, height: '100%', minHeight: 300 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
            </Box>
            <Box sx={{ height: 260, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey={xAxisKey} stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, color: theme.palette.text.primary }}
                            itemStyle={{ color: theme.palette.text.primary }}
                            cursor={{ fill: theme.palette.action.hover }}
                        />
                        {/* Reviews Volume (Bars) */}
                        <Bar yAxisId="left" dataKey={barKey} fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} barSize={20} />
                        {/* Average Rating (Line) */}
                        <Line yAxisId="right" type="monotone" dataKey={lineKey} stroke={theme.palette.warning.main} strokeWidth={3} dot={{ stroke: theme.palette.warning.main, strokeWidth: 2, r: 4, fill: theme.palette.background.paper }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    )
}
