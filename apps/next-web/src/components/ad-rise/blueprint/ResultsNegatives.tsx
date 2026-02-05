'use client';

import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    Chip,
    Button,
    alpha,
    useTheme,
    Snackbar,
    Alert
} from '@mui/material';
import { NegativeKeywordList } from '@platform/contracts';

interface Props {
    negatives: NegativeKeywordList[];
}

export default function ResultsNegatives({ negatives }: Props) {
    const theme = useTheme();
    const [copiedCategory, setCopiedCategory] = useState<string | null>(null);

    const copyCategory = (keywords: string[], category: string) => {
        const text = keywords.join(', ');
        navigator.clipboard.writeText(text);
        setCopiedCategory(category);
    };

    const copyAll = () => {
        const allKeywords = negatives.flatMap(n => n.keywords);
        const text = allKeywords.join(', ');
        navigator.clipboard.writeText(text);
        setCopiedCategory('All keywords');
    };

    const totalKeywords = negatives.reduce((sum, n) => sum + n.keywords.length, 0);

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
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography variant="h6">🚫</Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Negative Keywords
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {totalKeywords} keyword{totalKeywords !== 1 ? 's' : ''} to prevent wasted ad spend
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={copyAll}
                        >
                            Copy All
                        </Button>
                    </Stack>

                    <Stack spacing={3}>
                        {(negatives || []).map((list, i) => (
                            <Box key={i}>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{ mb: 2 }}
                                >
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {list.category}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {list.keywords.length} keyword{list.keywords.length !== 1 ? 's' : ''}
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => copyCategory(list.keywords, list.category)}
                                    >
                                        Copy
                                    </Button>
                                </Stack>

                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: alpha(theme.palette.error.main, 0.03),
                                        borderRadius: 1,
                                        border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                                    }}
                                >
                                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                        {list.keywords.map((keyword, idx) => (
                                            <Chip
                                                key={idx}
                                                label={keyword}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                                                    color: 'error.dark',
                                                    fontWeight: 500,
                                                    '&:hover': {
                                                        bgcolor: alpha(theme.palette.error.main, 0.1)
                                                    }
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            </Box>
                        ))}
                    </Stack>

                    {/* Info Box */}
                    <Box
                        sx={{
                            mt: 3,
                            p: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.05),
                            borderRadius: 1,
                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                        }}
                    >
                        <Typography variant="body2" color="info.main">
                            <strong>💡 Tip:</strong> Add these negative keywords to your campaign to prevent your ads
                            from showing for irrelevant searches and save your budget for qualified traffic.
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Copy Feedback Snackbar */}
            <Snackbar
                open={!!copiedCategory}
                autoHideDuration={2000}
                onClose={() => setCopiedCategory(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" variant="filled" onClose={() => setCopiedCategory(null)}>
                    {copiedCategory} copied to clipboard!
                </Alert>
            </Snackbar>
        </>
    );
}
