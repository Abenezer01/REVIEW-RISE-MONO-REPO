/* eslint-disable react/jsx-no-literals */
'use client'
import React, { useState, useEffect } from 'react'
import { Box, Card, Typography, Checkbox, Chip, useTheme, Skeleton, Button } from '@mui/material'
import type { SeverityLevel } from './IssueTriageBar'

export interface FixTask {
    id: string
    title: string
    impactPts: number
    effort: 'Low' | 'Medium' | 'High'
    category: string
    severity: SeverityLevel
}

export interface FixPlanBoardProps {
    scanId: string
    tasks: FixTask[]
    onRescan: () => void
    isLoading?: boolean
}

const EFFORT_COLORS = {
    Low: 'success',
    Medium: 'warning',
    High: 'error'
} as const

function TaskRow({ task, checked, onToggle }: { task: FixTask, checked: boolean, onToggle: (id: string) => void }) {
    const theme = useTheme()

    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', p: 1.5, gap: 1.5,
            borderBottom: '1px solid', borderColor: 'divider',
            transition: 'background-color 0.2s ease',
            bgcolor: checked ? 'action.hover' : 'transparent',
            '&:last-child': { borderBottom: 'none' }
        }}>
            <Checkbox
                checked={checked}
                onChange={() => onToggle(task.id)}
                color="primary"
                sx={{ p: 0.5 }}
            />
            <Box sx={{ flexGrow: 1, textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.6 : 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{task.title}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', gap: 1, mt: 0.5 }}>
                    <span>{task.category}</span>
                    <span>•</span>
                    <span style={{ color: theme.palette[task.severity === 'critical' ? 'error' : task.severity === 'high' ? 'warning' : 'info'].main }}>
                        {task.severity.charAt(0).toUpperCase() + task.severity.slice(1)} Priority
                    </span>
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: checked ? 0.6 : 1 }}>
                <Chip size="small" label={`+${task.impactPts} pts`} color="success" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                <Chip size="small" label={`${task.effort} Effort`} color={EFFORT_COLORS[task.effort]} sx={{ fontSize: '0.7rem', fontWeight: 600, minWidth: 80 }} />
            </Box>
        </Box>
    )
}

function LoadingSkeleton() {
    return (
        <Box>
            {[0, 1, 2, 3].map(i => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', p: 1.5, gap: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Skeleton variant="circular" width={24} height={24} sx={{ flexShrink: 0 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="60%" height={20} />
                        <Skeleton variant="text" width="30%" height={16} />
                    </Box>
                    <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 4 }} />
                    <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 4 }} />
                </Box>
            ))}
        </Box>
    )
}

export default function FixPlanBoard({ scanId, tasks, onRescan, isLoading = false }: FixPlanBoardProps) {
    const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({})

    // Load persisted state for this specific scan
    useEffect(() => {
        if (!scanId || isLoading) return

        try {
            const saved = localStorage.getItem(`seo:fixPlan:${scanId}`)

            if (saved) setCheckedTasks(JSON.parse(saved))
        } catch { }
    }, [scanId, isLoading])

    // Save state changes
    const handleToggle = (id: string) => {
        setCheckedTasks(prev => {
            const next = { ...prev, [id]: !prev[id] }

            try { localStorage.setItem(`seo:fixPlan:${scanId}`, JSON.stringify(next)) } catch { }

            return next
        })
    }

    const completedCount = tasks.filter(t => checkedTasks[t.id]).length
    const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100)
    const allDone = tasks.length > 0 && completedCount === tasks.length

    return (
        <Card sx={{ borderRadius: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <i className="tabler-clipboard-list" style={{ fontSize: '1.4rem', color: '#673AB7' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Actionable Fix Plan</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Track your remediation progress</Typography>
                </Box>
                {!isLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>{progress}%</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1 }}>Fixed</Typography>
                    </Box>
                )}
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5 }}>
                {isLoading ? <LoadingSkeleton /> : (
                    tasks.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                            <i className="tabler-mood-smile" style={{ fontSize: '3rem', opacity: 0.5 }} />
                            <Typography variant="h6" sx={{ mt: 2 }}>All caught up!</Typography>
                            <Typography variant="body2">No active fixes required.</Typography>
                        </Box>
                    ) : (
                        tasks.map(task => (
                            <TaskRow
                                key={task.id}
                                task={task}
                                checked={!!checkedTasks[task.id]}
                                onToggle={handleToggle}
                            />
                        ))
                    )
                )}
            </Box>

            {allDone && !isLoading && (
                <Box sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="tabler-rosette-discount-check-filled" style={{ fontSize: '1.5rem' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>All tasks completed!</Typography>
                    </Box>
                    <Button variant="contained" size="small" color="primary" onClick={onRescan}>
                        Re-scan to Verfiy
                    </Button>
                </Box>
            )}
        </Card>
    )
}
