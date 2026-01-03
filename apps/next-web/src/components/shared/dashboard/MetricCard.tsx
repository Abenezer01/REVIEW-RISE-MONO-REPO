'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'

interface MetricCardProps {
  title: string
  value: string | number
  trend?: {
    value: number | string
    label: string
    direction: 'up' | 'down' | 'neutral'
    suffix?: string
  }
  icon?: React.ReactNode
  iconColor?: string
}

const MetricCard = (props: MetricCardProps) => {
  const { title, value, trend, icon, iconColor } = props

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          {icon && (
            <Avatar
              variant='rounded'
              sx={{
                width: 38,
                height: 38,
                bgcolor: iconColor ? `${iconColor}15` : 'primary.light', // 15 = roughly 8% opacity hex
                color: iconColor || 'primary.main'
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>

        <Typography variant='h4' sx={{ mb: 1, fontWeight: 600 }}>
          {value}
        </Typography>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant='body2'
              sx={{
                color: trend.direction === 'up' ? 'success.main' : trend.direction === 'down' ? 'error.main' : 'success.main', // Figma shows green for neutral too (competitors)
                fontWeight: 600,
                mr: 1
              }}
            >
              {trend.direction === 'up' ? '+' : ''}{trend.value}{trend.suffix ?? '%'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {trend.label}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default MetricCard
