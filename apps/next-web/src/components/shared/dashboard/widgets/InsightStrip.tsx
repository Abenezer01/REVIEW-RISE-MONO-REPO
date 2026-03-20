'use client'
import React, { useState } from 'react'
import { Box, Card, Typography, Button, IconButton } from '@mui/material'
import { alpha } from '@mui/material/styles'

export type AlertType = 'Critical' | 'QuickWin' | 'Boost'

export interface InsightAlert {
    id: string
    type: AlertType
    message: string
    actionLabel: string
    onAction?: () => void
}

export default function InsightStrip({ alerts: initialAlerts }: { alerts: InsightAlert[] }) {
    const [alerts, setAlerts] = useState(initialAlerts)

    const handleDismiss = (id: string) => setAlerts(alerts.filter(a => a.id !== id))

    if (alerts.length === 0) return null

    return (
        <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 1 }}>
            {alerts.map(alert => {
                let colors = { color: 'error', iconName: 'tabler-alert-triangle-filled', tag: 'CRITICAL ALERT' }

                if (alert.type === 'QuickWin') {
                    colors = { color: 'warning', iconName: 'tabler-bulb-filled', tag: 'QUICK WIN' }
                } else if (alert.type === 'Boost') {
                    colors = { color: 'secondary', iconName: 'tabler-rocket', tag: 'REPUTATION BOOST' }
                }

                return (
                    <Card key={alert.id} sx={{ minWidth: 420, flexShrink: 0, p: 2, display: 'flex', alignItems: 'center', justifyItems: 'space-between', border: '1px solid', borderColor: `${colors.color}.main`, bgcolor: (theme) => alpha(theme.palette[colors.color as 'error' | 'warning' | 'secondary'].main, 0.1) }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                            <i className={colors.iconName} style={{ color: `var(--mui-palette-${colors.color}-main)`, fontSize: 24, marginRight: 16 }} />
                            <Box>
                                <Typography variant="caption" sx={{ color: `${colors.color}.main`, fontWeight: 700, letterSpacing: 0.5, fontSize: '0.65rem', mb: 0.5, display: 'block', textTransform: 'uppercase' }}>{colors.tag}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, pr: 2 }}>{alert.message}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, flexShrink: 0 }}>
                            <Button size="small" variant="contained" color={colors.color as any} sx={{ textTransform: 'none', borderRadius: 2, mr: 1, px: 2, py: 0.5, fontWeight: 600, boxShadow: 'none' }} onClick={alert.onAction}>
                                {alert.actionLabel}
                            </Button>
                            <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }} onClick={() => handleDismiss(alert.id)}>
                                <i className="tabler-x" style={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>
                    </Card>
                )
            })}
        </Box>
    )
}
