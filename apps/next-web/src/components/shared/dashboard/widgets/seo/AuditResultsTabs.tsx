/* eslint-disable react/jsx-no-literals */
'use client'
import React, { useState } from 'react'
import { Box, Card, Typography, Tabs, Tab, Chip, useTheme, Skeleton } from '@mui/material'
import type { SeverityLevel } from './IssueTriageBar'

export interface AuditItem {
    id: string
    label: string
    status: 'Good' | 'Warning' | 'Critical'
    detail: string
    severity: SeverityLevel
}

export interface AuditResultsTabsProps {
    onPage: AuditItem[]
    technical: AuditItem[]
    severityFilter: SeverityLevel | null
    isLoading?: boolean
}

const STATUS_CONFIG = {
    Good: { color: 'success' as const, icon: 'tabler-circle-check-filled' },
    Warning: { color: 'warning' as const, icon: 'tabler-alert-triangle-filled' },
    Critical: { color: 'error' as const, icon: 'tabler-alert-octagon-filled' },
}

function AuditRow({ item }: { item: AuditItem }) {
    const theme = useTheme()
    const cfg = STATUS_CONFIG[item.status]

    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            py: 1.5, borderBottom: '1px solid', borderColor: 'divider',
            '&:last-child': { borderBottom: 'none' }
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <i className={cfg.icon} style={{ color: theme.palette[cfg.color].main, fontSize: '1.1rem', flexShrink: 0 }} />
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{item.label}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.detail}</Typography>
                </Box>
            </Box>
            <Chip label={item.status} size="small" color={cfg.color} sx={{ fontWeight: 700, fontSize: '0.7rem', ml: 2, flexShrink: 0 }} />
        </Box>
    )
}

function LoadingSkeleton() {
    return (
        <Box>
            {[0, 1, 2, 3, 4].map(i => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Skeleton variant="circular" width={22} height={22} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="40%" height={18} />
                        <Skeleton variant="text" width="65%" height={14} />
                    </Box>
                    <Skeleton variant="rectangular" width={60} height={22} sx={{ borderRadius: 4 }} />
                </Box>
            ))}
        </Box>
    )
}

export default function AuditResultsTabs({ onPage, technical, severityFilter, isLoading = false }: AuditResultsTabsProps) {
    const [tab, setTab] = useState(0)

    const items = tab === 0 ? onPage : technical
    const filtered = severityFilter ? items.filter(i => i.severity === severityFilter) : items

    return (
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, pt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Audit Results</Typography>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 36 }}>
                    <Tab label="On-Page" sx={{ fontWeight: 600, fontSize: '0.85rem', minHeight: 36 }} />
                    <Tab label="Technical" sx={{ fontWeight: 600, fontSize: '0.85rem', minHeight: 36 }} />
                </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
                {isLoading ? <LoadingSkeleton /> : (
                    filtered.length === 0 ? (
                        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <i className="tabler-circle-check" style={{ fontSize: '2rem' }} />
                            <Typography variant="body2" sx={{ mt: 1 }}>No issues at this severity level</Typography>
                        </Box>
                    ) : (
                        filtered.map(item => <AuditRow key={item.id} item={item} />)
                    )
                )}
            </Box>
        </Card>
    )
}
