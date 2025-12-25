'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { useTheme, alpha } from '@mui/material/styles';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number | string;
    direction: TrendDirection;
    label?: string;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
  footer?: React.ReactNode;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  loading = false,
  footer,
  onClick,
}) => {
  const theme = useTheme();

  // Color mapping
  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };

  const activeColor = colorMap[color];

  const renderTrend = () => {
    if (!trend) return null;

    const isUp = trend.direction === 'up';
    const isDown = trend.direction === 'down';

    let trendColor = theme.palette.text.secondary;

    if (isUp) trendColor = theme.palette.success.main;
    if (isDown) trendColor = theme.palette.error.main;

    const ArrowIcon = () => {
      if (isUp) return <span style={{ marginRight: 4 }}>↑</span>;
      if (isDown) return <span style={{ marginRight: 4 }}>↓</span>;

      return <span style={{ marginRight: 4 }}>•</span>;
    };

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Typography
          component="span"
          variant="caption"
          sx={{
            color: trendColor,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            bgcolor: alpha(trendColor, 0.1),
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            mr: 1
          }}
        >
          <ArrowIcon />
          {trend.value}
        </Typography>
        {trend.label && (
          <Typography variant="caption" color="text.secondary">
            {trend.label}
          </Typography>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={60} />
        </Box>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="40%" />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick
          ? {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          }
          : undefined,
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        {/* Icon with background */}
        {icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(activeColor, 0.1),
              color: activeColor,
              fontSize: '1.5rem',
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>
          {value}
        </Typography>

        {renderTrend()}

        {footer && (
          <Box sx={{ mt: 2 }}>
            {footer}
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default MetricCard;
