'use client'

import React from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import LightbulbIcon from '@mui/icons-material/Lightbulb'

export interface Suggestion {
  id: string
  title: string
  description: string
  impact: 'High' | 'Medium' | 'Low'
  type: 'technical' | 'content' | 'authority'
}

interface AIOptimizationTipsProps {
  tips: Suggestion[]
}

const AIOptimizationTips: React.FC<AIOptimizationTipsProps> = ({ tips }) => {

  const getImpactColor = (impact: string) => {
      switch(impact) {
          case 'High': return 'error'
          case 'Medium': return 'warning'
          case 'Low': return 'info'
          default: return 'default'
      }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Optimization Tips"
        subheader="Actionable suggestions to improve AI visibility"
        avatar={
            <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', color: 'common.white' }}>
                <LightbulbIcon />
            </Avatar>
        }
      />
      <CardContent>
        <List disablePadding>
            {tips.map((suggestion, index) => (
                <ListItem
                    key={suggestion.id}
                    alignItems="flex-start"
                    disableGutters
                    secondaryAction={
                        <Chip
                            label={suggestion.impact}
                            color={getImpactColor(suggestion.impact) as any}
                            size="small"
                            variant="tonal"
                            sx={{ height: 20, fontSize: '0.625rem' }}
                        />
                    }
                    sx={{
                        mb: 2,
                        borderBottom: index !== tips.length - 1 ? '1px solid var(--mui-palette-divider)' : 'none',
                        pb: index !== tips.length - 1 ? 2 : 0,
                        pr: 8 // Add padding right to prevent text overlap with secondary action
                    }}
                >
                    <ListItemAvatar>
                        <Avatar variant="rounded" sx={{ bgcolor: 'action.hover', color: 'text.primary' }}>
                            {suggestion.type === 'technical' && <AutoFixHighIcon fontSize="small" />}
                            {suggestion.type === 'authority' && <TrendingUpIcon fontSize="small" />}
                            {suggestion.type === 'content' && <LightbulbIcon fontSize="small" />}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={suggestion.title}
                        secondary={suggestion.description}
                        primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600, sx: { mb: 0.5 } }}
                        secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    />
                </ListItem>
            ))}
        </List>
      </CardContent>
    </Card>
  )
}

export default AIOptimizationTips
