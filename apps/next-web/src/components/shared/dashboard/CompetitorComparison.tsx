'use client'

import React from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import StarIcon from '@mui/icons-material/Star'
import BusinessIcon from '@mui/icons-material/Store'
import { useTheme } from '@mui/material/styles'
import { useTranslations } from 'next-intl'

interface CompetitorComparisonProps {
  businessStats: {
    averageRating: number
    totalReviews: number
  }
  competitors: Array<{
    competitorName: number | string
    averageRating: number
    totalReviews: number
  }>
}

const CompetitorComparison = ({ businessStats, competitors }: CompetitorComparisonProps) => {
  const theme = useTheme()
  const t = useTranslations('dashboard.brandRise.competitors')
  const td = useTranslations('dashboard')

  // Ensure we display correctly even if API returns numbers or strings
  const stats = [
    {
      name: t('detail.yourBrand'),
      rating: Number(businessStats.averageRating),
      reviews: Number(businessStats.totalReviews),
      isSelf: true
    },
    ...competitors.map(c => ({
      name: String(c.competitorName),
      rating: Number(c.averageRating),
      reviews: Number(c.totalReviews),
      isSelf: false
    }))
  ]

  // Find max values for progress bars
  const maxReviews = Math.max(...stats.map(s => s.reviews))

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={t('detail.compare')} />
      <CardContent sx={{ pt: 1 }}>
        <List disablePadding>
          {stats.map((item, index) => (
             <ListItem 
                key={index} 
                disableGutters
                divider={index < stats.length - 1}
                sx={{ display: 'block', py: 2 }}
             >
               <Box display="flex" alignItems="center" mb={1} gap={2}>
                 <Avatar 
                    variant="rounded" 
                    sx={{ 
                        bgcolor: item.isSelf ? 'primary.main' : 'action.selected',
                        color: item.isSelf ? 'primary.contrastText' : 'text.primary',
                        width: 40, height: 40
                    }}
                 >
                    {item.isSelf ? <BusinessIcon /> : item.name[0]}
                 </Avatar>
                 <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={item.isSelf ? 700 : 500}>
                        {item.name} {item.isSelf && `(${t('detail.yourBrand')})`}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="body2" fontWeight={600}>
                            {item.rating.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {'('}{item.reviews.toLocaleString()} {td('overview.totalReviews').toLowerCase()}{')'}
                        </Typography>
                    </Box>
                 </Box>
               </Box>

               <Box display="flex" alignItems="center" gap={2}>
                 <Box flex={1}>
                    <LinearProgress 
                        variant="determinate" 
                        value={(item.reviews / maxReviews) * 100} 
                        sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: item.isSelf ? 'primary.main' : 'info.main'
                            }
                        }}
                    />
                 </Box>
               </Box>
             </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

export default CompetitorComparison
