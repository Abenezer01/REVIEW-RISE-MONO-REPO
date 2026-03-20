/* eslint-disable react/jsx-no-literals */
'use client'

import React, { useState } from 'react'
import { Card, Box, Typography, Collapse, LinearProgress, useTheme, Avatar } from '@mui/material'

export interface BreakdownCategory {
    id: 'onPage' | 'technical' | 'content';
    label: string;
    score: number;
    description: string;
    checks: Array<{
        id: string;
        label: string;
        status: 'Good' | 'Warning' | 'Critical';
        detail: string;
        severity: string;
        recommendation?: string;
        impact?: string;
    }>;
}

interface CategoryBreakdownAccordionProps {
    categories: BreakdownCategory[];
}

export default function CategoryBreakdownAccordion({ categories }: CategoryBreakdownAccordionProps) {
    const theme = useTheme();

    const getIconForCategory = (id: string) => {
        if (id === 'technical') return 'tabler-bolt'
        if (id === 'content') return 'tabler-file-text'

        return 'tabler-layout'
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            {categories.sort((a, b) => a.score - b.score).map((cat) => (
                <CategoryRow key={cat.id} category={cat} icon={getIconForCategory(cat.id)} theme={theme} />
            ))}
        </Box>
    )
}

function CategoryRow({ category, icon, theme }: { category: BreakdownCategory, icon: string, theme: any }) {
    const [expanded, setExpanded] = useState(false);

    const scoreColor = category.score >= 80 ? theme.palette.success.main : category.score >= 60 ? theme.palette.warning.main : theme.palette.error.main;
    const bgLight = scoreColor + '15';

    const criticalCount = category.checks.filter(c => c.severity === 'critical' || c.severity === 'high').length;

    return (
        <Card sx={{
            borderRadius: 3,
            border: `1px solid ${expanded ? scoreColor : theme.palette.divider}`,
            boxShadow: expanded ? `0 4px 20px ${bgLight}` : 'none',
            transition: 'all 0.3s ease',
            overflow: 'hidden'
        }}>
            {/* Header Row */}
            <Box
                onClick={() => setExpanded(!expanded)}
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                }}
            >
                <Avatar sx={{ bgcolor: bgLight, color: scoreColor, width: 48, height: 48, borderRadius: 2 }}>
                    <i className={icon} style={{ fontSize: '24px' }} />
                </Avatar>

                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography variant="h6" fontWeight={700}>{category.label}</Typography>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ color: scoreColor }}>
                                {category.score}%
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {category.checks.length > 0 && (
                                <Box sx={{
                                    px: 1.5, py: 0.5,
                                    borderRadius: 4,
                                    bgcolor: theme.palette.action.hover,
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                }}>
                                    {category.checks.length} {'issues'} {criticalCount > 0 && `• ${criticalCount} critical`}
                                </Box>
                            )}
                            <i className={`tabler-chevron-${expanded ? 'up' : 'down'}`} style={{ color: theme.palette.text.secondary }} />
                        </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {category.description}
                    </Typography>

                    <LinearProgress
                        variant="determinate"
                        value={category.score}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: theme.palette.action.hover,
                            '& .MuiLinearProgress-bar': { bgcolor: scoreColor, borderRadius: 3 }
                        }}
                    />
                </Box>
            </Box>

            {/* Expanded Content */}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ p: 3, pt: 0, pl: { xs: 3, sm: 9 }, borderTop: `1px dashed ${theme.palette.divider}`, mt: -1 }}>
                    <Typography variant="overline" fontWeight={700} color="text.disabled" sx={{ display: 'block', mt: 2, mb: 1.5 }}>
                        {'AI DIAGNOSTIC CHECKS'}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {category.checks.map((check, i) => {
                            const isError = check.status === 'Critical' || check.severity === 'critical';
                            const isWarning = check.status === 'Warning' || check.severity === 'high' || check.severity === 'medium';
                            const checkColor = isError ? theme.palette.error.main : isWarning ? theme.palette.warning.main : theme.palette.success.main;
                            const checkBg = isError ? theme.palette.error.light + '15' : isWarning ? theme.palette.warning.light + '15' : theme.palette.success.light + '15';
                            const checkIcon = isError ? 'tabler-alert-triangle-filled' : isWarning ? 'tabler-alert-circle-filled' : 'tabler-check';

                            return (
                                <Box key={i} sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${checkBg}`,
                                    bgcolor: checkBg,
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <i className={checkIcon} style={{ color: checkColor, fontSize: '18px' }} />
                                            <Typography variant="subtitle2" fontWeight={700}>{check.label}</Typography>
                                        </Box>
                                        <Typography variant="caption" fontWeight={700} sx={{ color: checkColor, textTransform: 'uppercase' }}>
                                            {check.status}
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: check.recommendation ? 1 : 0 }}>
                                        {check.detail}
                                    </Typography>

                                    {check.recommendation && (
                                        <Typography variant="body2" sx={{ ml: 4, fontWeight: 500, color: 'text.primary' }}>
                                            <Box component="span" fontWeight={700} mr={0.5}>Fix:</Box>
                                            {check.recommendation}
                                        </Typography>
                                    )}

                                    {check.impact && (
                                        <Typography variant="body2" sx={{ ml: 4, mt: 0.5, fontWeight: 700, color: theme.palette.primary.main }}>
                                            {'Impact:'} {check.impact}
                                        </Typography>
                                    )}
                                </Box>
                            )
                        })}
                    </Box>
                </Box>
            </Collapse>
        </Card>
    )
}
