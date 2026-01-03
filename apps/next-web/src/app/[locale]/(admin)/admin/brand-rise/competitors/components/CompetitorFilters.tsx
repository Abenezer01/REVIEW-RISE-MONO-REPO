'use client';

import { Box, Button, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';



export const CompetitorFilters = () => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
      {/* All Button */}
      <Button
        variant="outlined"
        size="small"
        sx={{
          bgcolor: 'warning.lighter',
          borderColor: 'warning.main',
          color: 'warning.dark',
          fontWeight: 600,
          textTransform: 'none',
          px: 2,
          '&:hover': {
            bgcolor: 'warning.light',
            borderColor: 'warning.dark'
          }
        }}
      >
        All
      </Button>

      {/* Filter Boxes */}
      <Stack direction="row" spacing={1.5}>
        <Box
          sx={{
            width: 60,
            height: 32,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.success.main, 0.2),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
          }}
        />
        <Box
          sx={{
            width: 60,
            height: 32,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.info.main, 0.2),
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
          }}
        />
        <Box
          sx={{
            width: 60,
            height: 32,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.secondary.main, 0.2),
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`
          }}
        />
      </Stack>
    </Stack>
  );
};
