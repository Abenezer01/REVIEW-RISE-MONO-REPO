import React from 'react';
import { Card, Typography, Box, useTheme, Chip } from '@mui/material';
import useTranslation from '@/hooks/useTranslation';

const MOCK_TOPICS = [
    { text: 'Great Service', sentiment: 'Positive', count: 42 },
    { text: 'Professional', sentiment: 'Positive', count: 38 },
    { text: 'Fast Response', sentiment: 'Positive', count: 25 },
    { text: 'Quality Work', sentiment: 'Positive', count: 21 },
    { text: 'Fair Pricing', sentiment: 'Positive', count: 18 },
    { text: 'Friendly Staff', sentiment: 'Positive', count: 15 },
    { text: 'Reliable', sentiment: 'Positive', count: 12 },
    { text: 'Excellent', sentiment: 'Positive', count: 10 },
    { text: 'Long Wait', sentiment: 'Negative', count: 5 },
    { text: 'Unresponsive', sentiment: 'Negative', count: 3 },
];

export default function TopicCloudCard() {
    const theme = useTheme();
    const t = useTranslation('dashboard');

    return (
        <Card sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {t('widgets.topicCloud.title')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {MOCK_TOPICS.map((topic, index) => (
                    <Chip
                        key={index}
                        label={topic.text}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            bgcolor: topic.sentiment === 'Positive' ? 'success.light' : 'error.light',
                            color: topic.sentiment === 'Positive' ? 'success.dark' : 'error.dark',
                            opacity: 0.8 + (topic.count / 50) * 0.2 // Make more frequent topics slightly more opaque
                        }}
                    />
                ))}
            </Box>
        </Card>
    );
}
