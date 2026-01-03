'use client';

import { Box, Grid, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

interface CompetitorStatsProps {
  stats?: { value: number; label?: string }[];
}

export const CompetitorStats = ({ 
  stats = [
    { value: 18 },
    { value: 7 },
    { value: 9 },
    { value: 2 }
  ]
}: CompetitorStatsProps) => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        bgcolor: alpha(theme.palette.warning.main, 0.08),
        borderRadius: 3,
        p: 4,
        mt: 4,
        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
      }}
    >
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700,
                  color: 'warning.main',
                  fontSize: { xs: '3rem', md: '4rem' }
                }}
              >
                {stat.value}
              </Typography>
              {stat.label && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    mt: 1
                  }}
                >
                  {stat.label}
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
