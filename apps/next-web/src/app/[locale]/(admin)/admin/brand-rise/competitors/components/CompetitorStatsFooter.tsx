import { Box, Typography, Paper, Grid } from '@mui/material';

interface CompetitorStatsFooterProps {
    total: number;
    directLocal: number;
    content: number;
    aggregators: number;
}

export const CompetitorStatsFooter = ({ total, directLocal, content, aggregators }: CompetitorStatsFooterProps) => {
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
                <StatItem label="COMPETITORS FOUND" value={total} color="#D38E18" />
                <StatItem label="DIRECT LOCAL" value={directLocal} color="#D38E18" />
                <StatItem label="CONTENT COMPETITORS" value={content} color="#D38E18" />
                <StatItem label="AGGREGATORS" value={aggregators} color="#D38E18" />
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