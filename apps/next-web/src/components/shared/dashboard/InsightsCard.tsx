'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'

interface Insight {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'success'
  icon?: React.ReactNode
}

interface InsightsCardProps {
  insights: Insight[]
}

const InsightsCard = ({ insights }: InsightsCardProps) => {
  const t = useTranslations('dashboard.brandRise.overview.insights')

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title={t('title')}
        subheader={t('subtitle')}
        action={
            <Typography variant="caption" sx={{ bgcolor: 'secondary.light', color: 'secondary.dark', px: 1, py: 0.5, borderRadius: 1 }}>
                {t('aiGenerated')}
            </Typography>
        }
      />
      <CardContent>
        <List disablePadding>
          {insights.map((insight, index) => (
            <Box key={insight.id} sx={{ mb: index !== insights.length - 1 ? 2 : 0, bgcolor: 'action.hover', borderRadius: 1 }}>
                <ListItem alignItems="flex-start">
                <ListItemAvatar>
                    <Avatar 
                        variant="rounded"
                        sx={{ 
                            bgcolor: insight.severity === 'success' ? 'success.light' : insight.severity === 'warning' ? 'warning.light' : 'info.light',
                            color: insight.severity === 'success' ? 'success.main' : insight.severity === 'warning' ? 'warning.main' : 'info.main'
                        }}
                    >
                    {insight.icon || (insight.severity === 'success' ? '✓' : '!')}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={insight.title}
                    secondary={insight.description}
                    primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'body2', noWrap: false }}
                />
                </ListItem>
            </Box>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

export default InsightsCard
