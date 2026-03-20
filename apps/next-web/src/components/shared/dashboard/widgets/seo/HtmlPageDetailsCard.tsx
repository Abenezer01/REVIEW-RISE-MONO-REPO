/* eslint-disable react/jsx-no-literals */
'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardContent, Collapse, Typography, Box, Grid, IconButton, useTheme, Chip } from '@mui/material'

interface HtmlDetailsProps {
    details: {
        metaTitle: { value: string; isOptimal: boolean; statusLabel: string };
        metaDescription: { value: string; isOptimal: boolean; statusLabel: string };
        wordCount: number;
        statusCode: number;
    };
    url: string;
}

export default function HtmlPageDetailsCard({ details, url }: HtmlDetailsProps) {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(true);

    return (
        <Card sx={{ borderRadius: 3, mb: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
            <CardHeader
                title={<Typography variant="h5" fontWeight={700}>{'HTML Page Details'}</Typography>}
                action={
                    <IconButton onClick={() => setExpanded(!expanded)}>
                        <i className={`tabler-chevron-${expanded ? 'up' : 'down'}`} />
                    </IconButton>
                }
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => setExpanded(!expanded)}
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent sx={{ pt: 0 }}>
                    <Grid container spacing={3}>
                        <DetailItem
                            label="Meta Title"
                            value={details.metaTitle.value || 'Not set'}
                            status={details.metaTitle.isOptimal}
                            statusLabel={details.metaTitle.statusLabel}
                        />
                        <DetailItem
                            label="Meta Description"
                            value={details.metaDescription.value || 'Not set'}
                            status={details.metaDescription.isOptimal}
                            statusLabel={details.metaDescription.statusLabel}
                        />
                        <DetailItem
                            label="Page URL"
                            value={url}
                            isCode
                        />
                        <DetailItem
                            label="Status Code"
                            value={details.statusCode.toString()}
                            status={details.statusCode === 200}
                            statusLabel={details.statusCode === 200 ? 'OK' : 'Error'}
                        />
                        <DetailItem
                            label="Word Count"
                            value={details.wordCount.toLocaleString() + ' words'}
                            status={details.wordCount > 300}
                            statusLabel={details.wordCount > 300 ? 'Good Length' : 'Too Short'}
                        />
                    </Grid>
                </CardContent>
            </Collapse>
        </Card>
    )
}

function DetailItem({ label, value, status, statusLabel, isCode }: { label: string, value: string, status?: boolean, statusLabel?: string, isCode?: boolean }) {
    const theme = useTheme();


    return (
        <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
                    {label}
                </Typography>
                <Chip size="small" label="AI Analysis" sx={{ height: 16, fontSize: '0.65rem', fontWeight: 600, bgcolor: theme.palette.primary.light + '20', color: theme.palette.primary.main }} />
            </Box>

            <Typography variant="body1" fontWeight={500} sx={{
                wordBreak: 'break-word',
                fontFamily: isCode ? 'monospace' : 'inherit',
                fontSize: isCode ? '0.875rem' : '1rem',
                mb: 0.5
            }}>
                {value}
            </Typography>

            {statusLabel && (
                <Typography variant="caption" sx={{
                    fontWeight: 600,
                    color: status ? theme.palette.success.main : theme.palette.warning.main,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                }}>
                    <i className={status ? "tabler-check" : "tabler-alert-triangle"} style={{ fontSize: '14px' }} />
                    {statusLabel}
                </Typography>
            )}
        </Grid>
    )
}
