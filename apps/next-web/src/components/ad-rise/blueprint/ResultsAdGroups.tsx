'use client';

import React, { useState } from 'react';

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Collapse,
    IconButton,
    Snackbar,
    Stack,
    Typography,
    alpha,
    useTheme
} from '@mui/material';

import type { AdGroup } from '@platform/contracts';

import { useTranslation } from '@/hooks/useTranslation';

interface Props {
    adGroups: AdGroup[];
}

export default function ResultsAdGroups({ adGroups }: Props) {
    const t = useTranslation('blueprint');
    const theme = useTheme();
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([0]));
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const toggleGroup = (index: number) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);

            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }

            return newSet;
        });
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
    };

    const copyAllHeadlines = (headlines: string[]) => {
        const text = headlines.join('\n');

        copyToClipboard(text, 'All headlines');
    };

    const copyAllDescriptions = (descriptions: string[]) => {
        const text = descriptions.join('\n');

        copyToClipboard(text, 'All descriptions');
    };

    return (
        <>
            <Card
                sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: theme.shadows[2]
                }}
            >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography variant="h6">{t('icons.memo')}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {t('results.adGroups.title')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('results.adGroups.subtitle', { count: adGroups.length })}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack spacing={2}>
                        {(adGroups || []).map((group, i) => {
                            const isExpanded = expandedGroups.has(i);

                            return (
                                <Box
                                    key={i}
                                    sx={{
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: theme.palette.secondary.main,
                                            boxShadow: `0 0 0 1px ${alpha(theme.palette.secondary.main, 0.2)}`
                                        }
                                    }}
                                >
                                    {/* Ad Group Header */}
                                    <Box
                                        onClick={() => toggleGroup(i)}
                                        sx={{
                                            p: 2,
                                            cursor: 'pointer',
                                            bgcolor: isExpanded ? alpha(theme.palette.secondary.main, 0.05) : 'transparent',
                                            transition: 'background-color 0.2s ease',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.secondary.main, 0.08)
                                            }
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                    {group.name}
                                                </Typography>
                                                <Chip
                                                    label={t('results.adGroups.keywordsCount', { count: group.keywords.keywords.length })}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Stack>
                                            <IconButton size="small">
                                                <Typography sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                                    {t('icons.caret')}
                                                </Typography>
                                            </IconButton>
                                        </Stack>
                                    </Box>

                                    {/* Ad Group Content */}
                                    <Collapse in={isExpanded}>
                                        <Box sx={{ p: 2, pt: 0, bgcolor: 'background.default' }}>
                                            {/* Headlines */}
                                            <Box sx={{ mb: 3 }}>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                        {t('results.adGroups.headlines', { count: group.assets.headlines.length })}
                                                    </Typography>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyAllHeadlines(group.assets.headlines);
                                                        }}
                                                    >
                                                        {t('results.adGroups.copyAll')}
                                                    </Button>
                                                </Stack>
                                                <Stack spacing={1}>
                                                    {group.assets.headlines.map((h, idx) => (
                                                        <Box
                                                            key={idx}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                p: 1.5,
                                                                bgcolor: 'background.paper',
                                                                borderRadius: 1,
                                                                border: `1px solid ${theme.palette.divider}`,
                                                                '&:hover': {
                                                                    borderColor: alpha(theme.palette.primary.main, 0.5),
                                                                    '& .copy-btn': {
                                                                        opacity: 1
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                                {h}
                                                            </Typography>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Chip
                                                                    label={`${h.length}/30`}
                                                                    size="small"
                                                                    sx={{
                                                                        fontSize: '0.7rem',
                                                                        height: 20,
                                                                        bgcolor: h.length > 30 ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                                                                        color: h.length > 30 ? 'error.main' : 'success.main',
                                                                        border: 'none'
                                                                    }}
                                                                />
                                                                <IconButton
                                                                    size="small"
                                                                    className="copy-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        copyToClipboard(h, `Headline ${idx + 1}`);
                                                                    }}
                                                                    sx={{ opacity: 0, transition: 'opacity 0.2s' }}
                                                                >
                                                                    📋
                                                                </IconButton>
                                                            </Stack>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Box>

                                            {/* Descriptions */}
                                            <Box>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                                                        {t('results.adGroups.descriptions', { count: group.assets.descriptions.length })}
                                                    </Typography>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyAllDescriptions(group.assets.descriptions);
                                                        }}
                                                    >
                                                        {t('results.adGroups.copyAll')}
                                                    </Button>
                                                </Stack>
                                                <Stack spacing={1}>
                                                    {group.assets.descriptions.map((d, idx) => (
                                                        <Box
                                                            key={idx}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                justifyContent: 'space-between',
                                                                p: 1.5,
                                                                bgcolor: 'background.paper',
                                                                borderRadius: 1,
                                                                border: `1px solid ${theme.palette.divider}`,
                                                                '&:hover': {
                                                                    borderColor: alpha(theme.palette.secondary.main, 0.5),
                                                                    '& .copy-btn': {
                                                                        opacity: 1
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                                {d}
                                                            </Typography>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Chip
                                                                    label={`${d.length}/90`}
                                                                    size="small"
                                                                    sx={{
                                                                        fontSize: '0.7rem',
                                                                        height: 20,
                                                                        bgcolor: d.length > 90 ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                                                                        color: d.length > 90 ? 'error.main' : 'success.main',
                                                                        border: 'none'
                                                                    }}
                                                                />
                                                                <IconButton
                                                                    size="small"
                                                                    className="copy-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        copyToClipboard(d, `Description ${idx + 1}`);
                                                                    }}
                                                                    sx={{ opacity: 0, transition: 'opacity 0.2s' }}
                                                                >
                                                                    📋
                                                                </IconButton>
                                                            </Stack>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        </Box>
                                    </Collapse>
                                </Box>
                            );
                        })}
                    </Stack>
                </CardContent>
            </Card>

            {/* Copy Feedback Snackbar */}
            <Snackbar
                open={!!copiedText}
                autoHideDuration={2000}
                onClose={() => setCopiedText(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" variant="filled" onClose={() => setCopiedText(null)}>
                    {t('results.adGroups.copied', { label: copiedText || '' })}
                </Alert>
            </Snackbar>
        </>
    );
}
