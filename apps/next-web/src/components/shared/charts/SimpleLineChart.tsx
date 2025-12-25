'use client';

import React, { useMemo } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';

// --- Bezier Curve Smoothing Logic ---
const smoothing = 0.2;

const line = (pointA: number[], pointB: number[]) => {
  const lengthX = pointB[0] - pointA[0];
  const lengthY = pointB[1] - pointA[1];


  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  };
};

const controlPoint = (current: number[], previous: number[], next: number[], reverse?: boolean) => {
  const p = previous || current;
  const n = next || current;
  const o = line(p, n);
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;
  const x = current[0] + Math.cos(angle) * length;
  const y = current[1] + Math.sin(angle) * length;


  return [x, y];
};

const bezierCommand = (point: number[], i: number, a: number[][]) => {
  const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
  const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);


  return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
};

const generateSmoothPath = (points: number[][]) => {
  return points.reduce((acc, point, i, a) =>
    i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${bezierCommand(point, i, a)}`
    , '');
};

// ------------------------------------

export interface SeriesConfig {
  dataKey: string;
  color: string;
  label: string;
  strokeDasharray?: string;
}

export interface SimpleLineChartProps {
  data: any[];
  xKey: string;
  series: SeriesConfig[];
  height?: number;
  loading?: boolean;
  title?: string;
  curve?: 'linear' | 'smooth';
  showGrid?: boolean;
  showXAxis?: boolean;
  showDots?: boolean;
  strokeWidth?: number;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  xKey,
  series,
  height = 300,
  loading = false,
  title,
  curve = 'linear',
  showGrid = true,
  showXAxis = true,
  showDots = true,
  strokeWidth = 3
}) => {
  const theme = useTheme();

  // Normalize data and calculate paths
  const maxValue = useMemo(() => {
    if (data.length === 0) return 100;
    let max = 0;

    data.forEach(item => {
      series.forEach(s => {
        const val = item[s.dataKey] || 0;

        if (val > max) max = val;
      });
    });

    return max > 0 ? max * 1.1 : 100; // Add 10% headroom
  }, [data, series]);

  const pathData = useMemo(() => {
    if (data.length < 2) return [];

    return series.map(s => {
      const points: number[][] = data.map((item, i) => {
        const x = (i / (data.length - 1)) * 100;
        const val = item[s.dataKey] || 0;
        const y = 100 - (val / maxValue) * 100;


        return [x, y];
      });

      let d = '';

      if (curve === 'smooth') {
        d = generateSmoothPath(points);
      } else {
        // Linear
        d = `M ${points.map(p => p.join(',')).join(' L ')}`;
      }

      return { ...s, d, points };
    });
  }, [data, series, maxValue, curve]);

  if (loading) {
    return <Paper sx={{ height, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</Paper>;
  }

  if (data.length === 0) {
    return <Paper sx={{ height, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No data</Paper>;
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {title && <Typography variant="h6" gutterBottom>{title}</Typography>}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {series.map(s => (
          <Box key={s.dataKey} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: s.color }} />
            <Typography variant="caption">{s.label}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ position: 'relative', flex: 1, width: '100%', minHeight: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          {/* Grid lines (0, 25, 50, 75, 100%) */}
          {showGrid && [0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke={theme.palette.divider}
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Paths */}
          {pathData.map((p) => (
            <path
              key={p.dataKey}
              d={p.d}
              fill="none"
              stroke={p.color}
              strokeWidth={strokeWidth}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={p.strokeDasharray}
            />
          ))}

          {/* Data Points */}
          {showDots && data.length > 1 && series.map((s) => (
            data.map((item, i) => {
              const val = item[s.dataKey];


              // Skip nulls or undefined
              if (val === null || val === undefined) return null;

              const x = (i / (data.length - 1)) * 100;
              const y = 100 - (val / maxValue) * 100;


              return (
                <circle
                  key={`${s.dataKey}-${i}`}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={theme.palette.background.paper}
                  stroke={s.color}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{`${s.label}: ${typeof val === 'number' ? val.toFixed(1) : val} (${item[xKey] ? new Date(item[xKey]).toLocaleDateString() : ''})`}</title>
                </circle>
              );
            })
          ))}
        </svg>

        {/* X-Axis Labels */}
        {showXAxis && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {data[0][xKey] ? new Date(data[0][xKey]).toLocaleDateString() : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data[data.length - 1][xKey] ? new Date(data[data.length - 1][xKey]).toLocaleDateString() : ''}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SimpleLineChart;
