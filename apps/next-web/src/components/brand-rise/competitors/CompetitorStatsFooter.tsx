import { Box, Typography, Paper, Grid } from '@mui/material';
import { useTranslations } from 'next-intl';

interface CompetitorStatsFooterProps {
    total: number;
    directLocal: number;
    content: number;
    aggregators: number;
}

export const CompetitorStatsFooter = ({ total, directLocal, content, aggregators }: CompetitorStatsFooterProps) => {
    const t = useTranslations('dashboard');

    return (
        <Paper 
            elevation={0}
            sx={{ 
                p: 3, 
                bgcolor: '#FAF3E8', // Light beige/gold bg
                borderRadius: 4,
                border: '1px solid',
                borderColor: '#E6CBA6',
                mb: 4
            }}
        >
            <Grid container alignItems="center" justifyContent="space-around">
                <StatItem label={t('brandRise.competitors.stats.found')} value={total} color="#D38E18" />
                <StatItem label={t('brandRise.competitors.stats.directLocal')} value={directLocal} color="#D38E18" />
                <StatItem label={t('brandRise.competitors.stats.content')} value={content} color="#D38E18" />
                <StatItem label={t('brandRise.competitors.stats.aggregators')} value={aggregators} color="#D38E18" />
            </Grid>
        </Paper>
    );
};

const StatItem = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: color, mb: 0.5 }}>
            {value}
        </Typography>
        <Typography variant="caption" fontWeight={600} sx={{ color: '#6E6B7B', letterSpacing: 1 }}>
            {label}
        </Typography>
    </Box>
);