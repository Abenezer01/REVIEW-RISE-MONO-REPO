'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { useTheme, alpha } from '@mui/material/styles';

export interface HeatmapRow {
  id: string;
  label: string;
  values: (number | null)[];
}

export interface HeatmapGridProps {
  rows: HeatmapRow[];
  columns: string[]; // Labels for columns (e.g. dates)
  title?: string;
  loading?: boolean;
  colorMode?: 'ranking' | 'intensity'; // Ranking: Low is Green. Intensity: High is Color.
  height?: number;
}

const HeatmapGrid: React.FC<HeatmapGridProps> = ({ 
  rows, 
  columns, 
  title, 
  loading, 
  colorMode = 'ranking',
  height 
}) => {
  const theme = useTheme();

  if (loading) {
    return <Paper sx={{ p: 2, height: height || 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</Paper>;
  }

  if (!rows.length) {
    return <Paper sx={{ p: 2, height: height || 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No data</Paper>;
  }

  const getCellColor = (val: number | null) => {
    if (val === null) return theme.palette.action.hover; 
    
    if (colorMode === 'ranking') {
       if (val <= 3) return theme.palette.success.main; 
       if (val <= 10) return alpha(theme.palette.success.main, 0.5);
       if (val <= 20) return theme.palette.warning.main;
       
return theme.palette.error.main; 
    } else {
       // Simple intensity intensity (0-100)
       const opacity = Math.min(Math.max(val / 100, 0.1), 1);

       
return alpha(theme.palette.primary.main, opacity);
    }
  };

  const cellWidth = 40;
  const cellHeight = 32;
  const labelWidth = 180;

  return (
    <Paper sx={{ p: 2, overflow: 'hidden', height: '100%' }}>
      {title && <Typography variant="h6" gutterBottom>{title}</Typography>}
      
      <Box sx={{ overflowX: 'auto', pb: 1, height: '100%' }}>
        <Box sx={{ minWidth: columns.length * cellWidth + labelWidth }}>
          {/* Header Row */}
          <Box sx={{ display: 'flex', ml: `${labelWidth}px`, mb: 1 }}>
            {columns.map((col, i) => (
              <Box 
                key={i} 
                sx={{ 
                  width: cellWidth, 
                  textAlign: 'center', 
                  fontSize: '0.75rem', 
                  color: 'text.secondary',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'bottom center',
                  height: 40,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center'
                }}
              >
                 {/* Try to format date if string looks like ISO date */}
                 {col.includes('T') || col.includes('-') ? new Date(col).getDate() : col}
              </Box>
            ))}
          </Box>

          {/* Data Rows */}
          {rows.map((row) => (
            <Box key={row.id} sx={{ display: 'flex', alignItems: 'center', height: cellHeight, mb: '2px' }}>
              <Tooltip title={row.label}>
                <Typography 
                  variant="body2" 
                  noWrap 
                  sx={{ 
                    width: labelWidth, 
                    pr: 2, 
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
                  {row.label}
                </Typography>
              </Tooltip>

              {row.values.map((val, i) => (
                <Tooltip key={i} title={val !== null ? `Value: ${val}` : 'No Data'}>
                  <Box
                    sx={{
                      width: cellWidth - 2,
                      height: cellHeight - 2,
                      mx: '1px',
                      bgcolor: getCellColor(val),
                      color: (val && colorMode === 'ranking' && val <= 20) ? '#fff' : 'text.primary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      cursor: 'default',
                      opacity: val === null ? 0.3 : 1
                    }}
                  >
                    {val ?? '-'}
                  </Box>
                </Tooltip>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default HeatmapGrid;
