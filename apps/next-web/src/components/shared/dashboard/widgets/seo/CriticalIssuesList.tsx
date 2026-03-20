/* eslint-disable react/jsx-no-literals */
'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardContent, Typography, Box, Stack, Collapse, useTheme, Button } from '@mui/material'

interface CriticalIssue {
    id: string;
    issue: string; // The title/label
    recommendation: string; // The detail/desc
    impact: string;
    difficulty: string;
    category: string;
}

interface CriticalIssuesListProps {
    issues: CriticalIssue[];
}

export default function CriticalIssuesList({ issues }: CriticalIssuesListProps) {
    const theme = useTheme();

    if (!issues || issues.length === 0) {
        return null;
    }

    return (
        <Card sx={{ borderRadius: 3, mb: 3, border: `1px solid ${theme.palette.error.light}40`, boxShadow: 'none' }}>
            <CardHeader
                title={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" fontWeight={800}>{'Critical Issues'}</Typography>
                        <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: theme.palette.error.light + '20', color: theme.palette.error.main, fontWeight: 700, fontSize: '0.875rem' }}>
                            {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'} {'Found'}
                        </Box>
                    </Box>
                }
            />
            <CardContent sx={{ pt: 0 }}>
                <Stack spacing={2}>
                    {issues.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} />
                    ))}
                </Stack>
            </CardContent>
        </Card>
    )
}

function IssueCard({ issue }: { issue: CriticalIssue }) {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);

    return (
        <Box sx={{
            border: `1px solid ${expanded ? theme.palette.error.main : theme.palette.divider}`,
            borderRadius: 2,
            transition: 'all 0.2s',
            bgcolor: expanded ? theme.palette.error.light + '0a' : theme.palette.background.paper,
            overflow: 'hidden'
        }}>
            {/* Header / Summary */}
            <Box
                onClick={() => setExpanded(!expanded)}
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                }}
            >
                <Box sx={{ mt: 0.5, color: theme.palette.error.main }}>
                    <i className="tabler-alert-triangle-filled" style={{ fontSize: '20px' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight={700}>{issue.issue}</Typography>
                        <Box sx={{ px: 0.75, py: 0.25, borderRadius: 1, bgcolor: theme.palette.primary.light + '20', color: theme.palette.primary.main, fontSize: '0.65rem', fontWeight: 800 }}>
                            {'AI IDENTIFIED'}
                        </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {issue.recommendation}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Badge label="Critical" color={theme.palette.error.main} bg={theme.palette.error.light + '20'} />
                        <Badge label={`Impact: ${issue.impact}`} color={theme.palette.success.main} bg={theme.palette.success.light + '20'} />
                        <Badge label={issue.category} color={theme.palette.text.secondary} bg={theme.palette.action.selected} />
                    </Box>
                </Box>

                <i className={`tabler-chevron-${expanded ? 'up' : 'down'}`} style={{ color: theme.palette.text.secondary, marginTop: '4px' }} />
            </Box>

            {/* Actions (Expanded) */}
            <Collapse in={expanded}>
                <Box sx={{ p: 2, pt: 0, pl: { xs: 2, sm: 6 }, display: 'flex', gap: 2 }}>
                    <Button variant="contained" color="error" size="small" sx={{ borderRadius: 1.5, px: 3 }} startIcon={<i className="tabler-tool" />}>
                        {'View Fix Guide'}
                    </Button>
                    <Button variant="outlined" color="inherit" size="small" sx={{ borderRadius: 1.5, borderColor: 'divider' }}>
                        {'Learn More'}
                    </Button>
                </Box>
            </Collapse>
        </Box>
    )
}

function Badge({ label, color, bg }: { label: string, color: string, bg: string }) {
    return (
        <Box sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: bg, color: color, fontSize: '0.75rem', fontWeight: 600 }}>
            {label}
        </Box>
    )
}
