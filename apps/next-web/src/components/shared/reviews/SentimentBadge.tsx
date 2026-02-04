'use client'

import React from 'react'

import Chip from '@mui/material/Chip'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { useTheme, alpha } from '@mui/material/styles'
import { useTranslations } from 'next-intl'

interface SentimentBadgeProps {
  sentiment: 'positive' | 'neutral' | 'negative' | null
  size?: 'small' | 'medium'
  showIcon?: boolean
}

const SentimentBadge = ({ sentiment, size = 'small', showIcon = true }: SentimentBadgeProps) => {
  const theme = useTheme()
  const t = useTranslations('dashboard')
  const ts = useTranslations('common.status')

  if (!sentiment) {
    return (
      <Chip
        label={ts('unanalyzed')}
        size={size}
        variant="outlined"
        icon={showIcon ? <HelpOutlineIcon /> : undefined}
        sx={{
          color: theme.palette.text.disabled,
          borderColor: theme.palette.divider,
          fontWeight: 500
        }}
      />
    )
  }

  const config = {
    positive: {
      label: t('reviews.positive'),
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.16),
      icon: <CheckCircleIcon />
    },
    neutral: {
      label: t('reviews.neutral'),
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.16),
      icon: <RemoveCircleIcon />
    },
    negative: {
      label: t('reviews.negative'),
      color: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, 0.16),
      icon: <CancelIcon />
    }
  }

  // Handle unknown sentiment values safely
  const sentimentKey = (sentiment || '').toLowerCase() as keyof typeof config

  if (!config[sentimentKey]) {
     // Fallback for unknown values
     return (
        <Chip
          label={sentiment || ts('unknown')}
          size={size}
          variant="outlined"
          sx={{
            color: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            fontWeight: 500
          }}
        />
     )
  }

  const { label, color, bgColor, icon } = config[sentimentKey]

  return (
    <Chip
      label={label}
      size={size}
      icon={showIcon ? icon : undefined}
      sx={{
        color: color,
        backgroundColor: bgColor,
        fontWeight: 600,
        borderColor: color,
        '& .MuiChip-icon': {
          color: color
        }
      }}
    />
  )
}

export default SentimentBadge
