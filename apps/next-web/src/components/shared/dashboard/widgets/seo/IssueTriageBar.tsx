/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Box, Card, Typography, useTheme, Skeleton, Chip } from '@mui/material'

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low'

export interface IssueTriageBarProps {
    critical: number
    high: number
    medium: number
    low: number
    activeFilter: SeverityLevel | null
    onFilterChange: (level: SeverityLevel | null) => void
    isLoading?: boolean
}

interface TriageChipProps {
    level: SeverityLevel
    count: number
    active: boolean
    onClick: () => void
}

const LEVEL_CONFIG: Record<SeverityLevel, { label: string; icon: string; color: string; bgColor: string }> = {
    critical: { label: 'Critical', icon: 'tabler-alert-octagon-filled', color: '#F44336', bgColor: '#F4433618' },
    high: { label: 'High', icon: 'tabler-alert-triangle-filled', color: '#FF9800', bgColor: '#FF980018' },
    medium: { label: 'Medium', icon: 'tabler-alert-circle-filled', color: '#FF9800', bgColor: '#FFC10718' },
    low: { label: 'Info', icon: 'tabler-info-circle-filled', color: '#2196F3', bgColor: '#2196F318' },
}

function TriageChip({ level, count, active, onClick }: TriageChipProps) {
    const cfg = LEVEL_CONFIG[level]

    return (
        <Box
            onClick={onClick}
            sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75,
                flex: 1, cursor: 'pointer', p: 2, borderRadius: 2,
                border: `2px solid ${active ? cfg.color : 'transparent'}`,
                bgcolor: active ? cfg.bgColor : 'action.hover',
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: cfg.bgColor, borderColor: cfg.color }
            }}
        >
            <i className={cfg.icon} style={{ color: cfg.color, fontSize: '1.5rem' }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{count}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                {cfg.label}
            </Typography>
        </Box>
    )
}

export default function IssueTriageBar({
    critical, high, medium, low, activeFilter, onFilterChange, isLoading = false
}: IssueTriageBarProps) {
    const theme = useTheme()
    const total = critical + high + medium + low

    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {[0, 1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={90} sx={{ flex: 1, borderRadius: 2 }} />)}
                </Box>
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className="tabler-list-check" style={{ color: theme.palette.primary.main, fontSize: '1.4rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Issues Detected</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={`${total} total`} size="small" color="default" />
                    {activeFilter && (
                        <Chip
                            label="Clear filter"
                            size="small"
                            onDelete={() => onFilterChange(null)}
                            sx={{ fontSize: '0.7rem' }}
                        />
                    )}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
                {(['critical', 'high', 'medium', 'low'] as SeverityLevel[]).map(level => (
                    <TriageChip
                        key={level}
                        level={level}
                        count={level === 'critical' ? critical : level === 'high' ? high : level === 'medium' ? medium : low}
                        active={activeFilter === level}
                        onClick={() => onFilterChange(activeFilter === level ? null : level)}
                    />
                ))}
            </Box>
        </Card>
    )
}
