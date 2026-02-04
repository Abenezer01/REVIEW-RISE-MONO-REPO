'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useTheme, alpha } from '@mui/material/styles'
import { useTranslations } from 'next-intl'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'

interface ReviewMetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: number // percentage change
  subtitle?: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'
}

const ReviewMetricCard = ({
  title,
  value,
  icon,
  change,
  subtitle,
  color = 'primary'
}: ReviewMetricCardProps) => {
  const theme = useTheme()
  const t = useTranslations('dashboard.brandRise.overview')
  const colorValue = theme.palette[color].main
  const bgColor = alpha(colorValue, 0.1)

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={600}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: bgColor,
              color: colorValue
            }}
          >
            {icon}
          </Box>
        </Box>

        {change !== undefined && (
          <Box display="flex" alignItems="center" gap={0.5}>
            {change >= 0 ? (
              <TrendingUpIcon fontSize="small" color="success" />
            ) : (
              <TrendingDownIcon fontSize="small" color="error" />
            )}
            <Typography
              variant="body2"
              color={change >= 0 ? 'success.main' : 'error.main'}
              fontWeight={500}
            >
              {Math.abs(change)}{'%'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('fromLastPeriod')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default ReviewMetricCard
