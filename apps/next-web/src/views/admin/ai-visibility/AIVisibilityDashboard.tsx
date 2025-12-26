'use client'

import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'

import BrandInputSection from './BrandInputSection'
import AIVisibilityOverview, { type BrandVisibilityMetrics } from './AIVisibilityOverview'
import AIPlatformBreakdown, { type PlatformData } from './AIPlatformBreakdown'
import AIOptimizationTips, { type Suggestion } from './AIOptimizationTips'
import AIVisibilityLoading from './AIVisibilityLoading'

const AIVisibilityDashboard = () => {
  const [loading, setLoading] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [metrics, setMetrics] = useState<BrandVisibilityMetrics | null>(null)
  const [platformData, setPlatformData] = useState<PlatformData[]>([])
  const [tips, setTips] = useState<Suggestion[]>([])

  const handleAnalyze = async (url: string) => {
    setLoading(true)
    setAnalyzed(false)

    try {
        const response = await fetch('/api/ai-visibility/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))

            console.error('Analysis API Error:', errorData)
            throw new Error(errorData.message || 'Analysis failed')
        }

        const data = await response.json()

        if (data.success && data.data) {
            setMetrics(data.data.metrics)
            setPlatformData(data.data.platformData)
            setTips(data.data.tips)
            setAnalyzed(true)
        }
    } catch (error) {
        console.error('Error analyzing brand:', error)

        // Fallback or error handling could go here
    } finally {
        setLoading(false)
    }
  }

  return (
    <Box>
      <Grid container spacing={6}>
        {/* Input Section */}
        <Grid size={{ xs: 12 }}>
          <BrandInputSection onAnalyze={handleAnalyze} loading={loading} />
        </Grid>

        {/* Results Section */}
        {loading ? (
          <Grid size={{ xs: 12 }}>
            <AIVisibilityLoading />
          </Grid>
        ) : analyzed && (
          <>
            <Grid size={{ xs: 12 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Analysis complete! Your brand has strong visibility on ChatGPT and Perplexity.
              </Alert>
            </Grid>

            {/* Overview Metrics */}
            <Grid size={{ xs: 12 }}>
              <AIVisibilityOverview metrics={metrics} />
            </Grid>

            {/* Platform Breakdown */}
            <Grid size={{ xs: 12, md: 8 }}>
              <AIPlatformBreakdown data={platformData} />
            </Grid>

            {/* Optimization Tips */}
            <Grid size={{ xs: 12, md: 4 }}>
              <AIOptimizationTips tips={tips} />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  )
}

export default AIVisibilityDashboard
