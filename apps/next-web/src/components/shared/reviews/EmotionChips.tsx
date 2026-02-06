'use client'

import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import { useTheme, alpha } from '@mui/material/styles'
import { useTranslations } from 'next-intl'

interface EmotionChipsProps {
  emotions: string[]
  maxDisplay?: number
  clickable?: boolean
  onEmotionClick?: (emotion: string) => void
}

const EmotionChips = ({ 
  emotions, 
  maxDisplay = 3, 
  clickable = false,
  onEmotionClick 
}: EmotionChipsProps) => {
  const theme = useTheme()
  const t = useTranslations('common')
  const [expanded, setExpanded] = useState(false)

  if (!emotions || emotions.length === 0) {
    return null
  }

  // Emotion category color mapping
  const getEmotionColor = (emotion: string) => {
    const lowerEmotion = emotion.toLowerCase()
    
    // Positive emotions
    if (lowerEmotion.includes('delight') || 
        lowerEmotion.includes('satisfaction') || 
        lowerEmotion.includes('gratitude') ||
        lowerEmotion.includes('praise') ||
        lowerEmotion.includes('impressed') ||
        lowerEmotion.includes('trust') ||
        lowerEmotion.includes('loyalty')) {
      return {
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1)
      }
    }
    
    // Negative emotions
    if (lowerEmotion.includes('frustration') || 
        lowerEmotion.includes('disappointment') ||
        lowerEmotion.includes('anger') ||
        lowerEmotion.includes('concern') ||
        lowerEmotion.includes('dissatisfaction')) {
      return {
        color: theme.palette.error.main,
        bgColor: alpha(theme.palette.error.main, 0.1)
      }
    }
    
    // Neutral/informational
    return {
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1)
    }
  }

  const displayedEmotions = expanded ? emotions : emotions.slice(0, maxDisplay)
  const remainingCount = emotions.length - maxDisplay

  const handleChipClick = (emotion: string) => {
    if (clickable && onEmotionClick) {
      onEmotionClick(emotion)
    }
  }

  return (
    <Box display="flex" flexWrap="wrap" gap={0.75} alignItems="center">
      {displayedEmotions.map((emotion, index) => {
        const { color, bgColor } = getEmotionColor(emotion)
        
        return (
          <Tooltip key={index} title={clickable ? t('common.clickToFilter') : ''} arrow>
            <Chip
              label={emotion}
              size="small"
              variant="outlined"
              onClick={clickable ? () => handleChipClick(emotion) : undefined}
              sx={{
                color: color,
                borderColor: alpha(color, 0.5),
                backgroundColor: bgColor,
                fontWeight: 500,
                fontSize: '0.75rem',
                cursor: clickable ? 'pointer' : 'default',
                '&:hover': clickable ? {
                  borderColor: color,
                  backgroundColor: alpha(color, 0.2),
                  transform: 'scale(1.05)'
                } : {},
                transition: 'all 0.2s ease'
              }}
            />
          </Tooltip>
        )
      })}
      
      {!expanded && remainingCount > 0 && (
        <Chip
          label={t('common.moreCount', { count: remainingCount })}
          size="small"
          variant="outlined"
          onClick={() => setExpanded(true)}
          sx={{
            color: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.75rem',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.05)
            },
            transition: 'all 0.2s ease'
          }}
        />
      )}
      
      {expanded && emotions.length > maxDisplay && (
        <Chip
          label={t('common.showLess')}
          size="small"
          variant="outlined"
          onClick={() => setExpanded(false)}
          sx={{
            color: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.75rem',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.05)
            },
            transition: 'all 0.2s ease'
          }}
        />
      )}
    </Box>
  )
}

export default EmotionChips
