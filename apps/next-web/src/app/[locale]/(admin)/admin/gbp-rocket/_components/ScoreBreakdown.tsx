'use client'

import { useTranslations } from 'next-intl'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import type { AuditResult } from './AuditTab'

interface ScoreBreakdownProps {
  audit: AuditResult
}

const ScoreBreakdown = ({ audit }: ScoreBreakdownProps) => {
  const t = useTranslations('gbpRocket')
  const theme = useTheme()

  const breakdownItems = [
    { label: t('audit.completenessLabel') || 'Completeness', value: audit.breakdown.completeness },
    { label: t('audit.descriptionLabel') || 'Description Quality', value: audit.breakdown.description },
    { label: t('audit.categoriesLabel') || 'Category Optimization', value: audit.breakdown.categories },
    { label: t('audit.photoQualityLabel') || 'Photo Quality', value: audit.breakdown.photoQuality || 0 },
    { label: t('audit.keywordOptimizationLabel') || 'Keyword Optimization', value: audit.breakdown.keywordOptimization || 0 },
    { label: t('audit.freshnessLabel') || 'Content Freshness', value: audit.breakdown.freshness }
  ]

  const getColor = (value: number) => {
    if (value >= 80) return theme.palette.success.main
    if (value >= 50) return theme.palette.warning.main
    
return theme.palette.error.main
  }

  return (
    <Stack spacing={2.5} sx={{ w: '100%', mt: 1, px: { xs: 1, md: 3 }, py: 2 }}>
      {breakdownItems.map((item, i) => (
        <Box key={i}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="600">{item.label}</Typography>
            <Typography variant="caption" fontWeight="bold" sx={{ color: getColor(item.value) }}>
              {Math.round(item.value)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={item.value}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.grey[500], 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundColor: getColor(item.value)
              }
            }}
          />
        </Box>
      ))}
    </Stack>
  )
}

export default ScoreBreakdown
