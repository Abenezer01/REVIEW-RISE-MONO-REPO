/* eslint-disable react/jsx-no-literals */
'use client'
import React, { useState } from 'react'
import { Box, Typography, Button, IconButton, Collapse } from '@mui/material'

export type SeoAlertType = 'Critical' | 'QuickWin' | 'Opportunity'

export interface SeoAlert {
    id: string
    type: SeoAlertType
    message: string
    actionLabel: string
}

export interface SeoAlertStripProps {
    alerts: SeoAlert[]
}

const ALERT_STYLES: Record<SeoAlertType, { icon: string; color: string; bg: string; border: string }> = {
    Critical: { icon: 'tabler-alert-triangle-filled', color: '#F44336', bg: '#F443361A', border: '#F4433640' },
    QuickWin: { icon: 'tabler-bulb-filled', color: '#FFB300', bg: '#FFB3001A', border: '#FFB30040' },
    Opportunity: { icon: 'tabler-rocket', color: '#9C27B0', bg: '#9C27B01A', border: '#9C27B040' },
}

function AlertItem({ alert, onDismiss }: { alert: SeoAlert, onDismiss: (id: string) => void }) {
    const s = ALERT_STYLES[alert.type]

    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', p: 2, mb: 1.5,
            bgcolor: s.bg, border: '1px solid', borderColor: s.border, borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', bgcolor: 'background.paper', mr: 2, flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <i className={s.icon} style={{ color: s.color, fontSize: '1.25rem' }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                    {alert.type === 'QuickWin' ? 'Quick Win' : alert.type}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    {alert.message}
                </Typography>
            </Box>
            <Button variant="contained" size="small" sx={{ bgcolor: s.color, color: '#fff', '&:hover': { bgcolor: s.color, filter: 'brightness(0.9)' }, ml: 2, whiteSpace: 'nowrap', borderRadius: 6, px: 3 }}>
                {alert.actionLabel}
            </Button>
            <IconButton size="small" onClick={() => onDismiss(alert.id)} sx={{ ml: 1, color: 'text.secondary' }}>
                <i className="tabler-x" style={{ fontSize: '1.1rem' }} />
            </IconButton>
        </Box>
    )
}

export default function SeoAlertStrip({ alerts }: SeoAlertStripProps) {
    const [dismissed, setDismissed] = useState<Set<string>>(new Set())

    const visibleAlerts = alerts.filter(a => !dismissed.has(a.id))

    if (visibleAlerts.length === 0) return null

    return (
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column' }}>
            {visibleAlerts.map(alert => (
                <Collapse key={alert.id} in>
                    <AlertItem alert={alert} onDismiss={(id) => setDismissed(prev => new Set(prev).add(id))} />
                </Collapse>
            ))}
        </Box>
    )
}
