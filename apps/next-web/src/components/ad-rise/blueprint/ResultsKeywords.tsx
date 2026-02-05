'use client';

import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Chip,
    Box,
    Stack,
    Collapse,
    IconButton,
    Badge,
    alpha,
    useTheme
} from '@mui/material';
import { KeywordCluster } from '@platform/contracts';

interface Props {
    clusters: KeywordCluster[];
}

export default function ResultsKeywords({ clusters }: Props) {
    const theme = useTheme();
    const [expandedClusters, setExpandedClusters] = useState<Set<number>>(new Set([0]));

    const toggleCluster = (index: number) => {
        setExpandedClusters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const getIntentColor = (intent: string) => {
        switch (intent.toLowerCase()) {
            case 'service':
                return 'primary';
            case 'problem':
                return 'success';
            case 'commercial':
                return 'info';
            default:
                return 'default';
        }
    };

    return (
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
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography variant="h6">🔑</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Keyword Clusters by Intent
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {clusters.length} cluster{clusters.length !== 1 ? 's' : ''} • {clusters.reduce((sum, c) => sum + c.keywords.length, 0)} keywords total
                        </Typography>
                    </Box>
                </Stack>

                <Stack spacing={2}>
                    {(clusters || []).map((cluster, i) => {
                        const isExpanded = expandedClusters.has(i);
                        return (
                            <Box
                                key={i}
                                sx={{
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: theme.palette.primary.main,
                                        boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`
                                    }
                                }}
                            >
                                {/* Cluster Header */}
                                <Box
                                    onClick={() => toggleCluster(i)}
                                    sx={{
                                        p: 2,
                                        cursor: 'pointer',
                                        bgcolor: isExpanded ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                        transition: 'background-color 0.2s ease',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.08)
                                        }
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {cluster.theme}
                                            </Typography>
                                            <Chip
                                                label={cluster.intent}
                                                color={getIntentColor(cluster.intent)}
                                                size="small"
                                                sx={{ fontWeight: 500 }}
                                            />
                                            <Badge
                                                badgeContent={cluster.keywords.length}
                                                color="default"
                                                sx={{
                                                    '& .MuiBadge-badge': {
                                                        bgcolor: alpha(theme.palette.text.primary, 0.1),
                                                        color: 'text.secondary'
                                                    }
                                                }}
                                            >
                                                <Typography variant="body2" color="text.secondary">
                                                    keywords
                                                </Typography>
                                            </Badge>
                                        </Stack>
                                        <IconButton size="small">
                                            <Typography sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                                ▼
                                            </Typography>
                                        </IconButton>
                                    </Stack>
                                </Box>

                                {/* Cluster Keywords */}
                                <Collapse in={isExpanded}>
                                    <Box sx={{ p: 2, pt: 0, bgcolor: 'background.default' }}>
                                        <Stack spacing={1.5}>
                                            {cluster.keywords.map((k, idx) => (
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
                                                            bgcolor: alpha(theme.palette.primary.main, 0.02)
                                                        }
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {k.term}
                                                    </Typography>
                                                    <Chip
                                                        label={k.matchType}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            fontSize: '0.75rem',
                                                            height: 24,
                                                            borderColor: alpha(theme.palette.text.primary, 0.2)
                                                        }}
                                                    />
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Collapse>
                            </Box>
                        );
                    })}
                </Stack>
            </CardContent>
        </Card>
    );
}
