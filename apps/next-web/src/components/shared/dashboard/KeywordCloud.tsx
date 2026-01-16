'use client'

import React from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { useTheme, alpha } from '@mui/material/styles'

interface Keyword {
  keyword: string
  count: number
}

interface KeywordCloudProps {
  title: string
  subtitle?: string
  keywords: Keyword[]
}

const KeywordCloud = ({ title, subtitle, keywords }: KeywordCloudProps) => {
  const theme = useTheme()

  if (!keywords || keywords.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader title={title} subheader={subtitle} />
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
            No keywords available
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Find max count for relative sizing
  const maxCount = Math.max(...keywords.map(k => k.count))

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subtitle} />
      <CardContent>
        <Box
          display="flex"
          flexWrap="wrap"
          gap={1}
          alignItems="center"
          justifyContent="center"
          minHeight={200}
          p={2}
        >
          {keywords.map((item, index) => {
            const ratio = item.count / maxCount
            const isTop = ratio > 0.7
            const isMid = ratio > 0.4
            
            // Determine styling props
            const chipProps = isTop ? {
              variant: 'filled' as const,
              sx: {
                fontWeight: 600,
                fontSize: '1rem', // Larger for top keywords
                boxShadow: 2,
                '&:hover': { transform: 'scale(1.05)' },
                transition: 'all 0.2s ease'
              }
            } : {
              variant: 'outlined' as const,
              sx: {
                fontWeight: 500,
                fontSize: isMid ? '0.875rem' : '0.75rem',
                color: isMid ? theme.palette.text.primary : theme.palette.text.secondary,
                borderColor: isMid ? alpha(theme.palette.primary.main, 0.5) : alpha(theme.palette.divider, 0.5),
                '&:hover': { 
                  borderColor: isMid ? theme.palette.primary.main : theme.palette.text.secondary,
                  backgroundColor: alpha(isMid ? theme.palette.primary.main : theme.palette.text.secondary, 0.05)
                },
                transition: 'all 0.2s ease'
              }
            }

            return (
              <Chip
                key={index}
                label={item.keyword}
                size={isTop ? 'medium' : 'small'}
                color={isTop ? 'warning' : 'default'} // Warning is gold/orange in our theme
                {...chipProps}
              />
            )
          })}
        </Box>
      </CardContent>
    </Card>
  )
}

export default KeywordCloud
