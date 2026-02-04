'use client'

import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'

import { useTranslation } from '@/hooks/useTranslation'
import apiClient from '@/lib/apiClient'
import BrandInputSection from './BrandInputSection'
import AIVisibilityOverview, { type BrandVisibilityMetrics } from './AIVisibilityOverview'
import AIPlatformBreakdown, { type PlatformData } from './AIPlatformBreakdown'
import AIOptimizationTips, { type Suggestion } from './AIOptimizationTips'
import AIVisibilityLoading from './AIVisibilityLoading'
import AIVisibilityValidationResults from './AIVisibilityValidationResults'
import { type AiVisibilityValidationResults } from './AIVisibilityValidationTypes'

const AIVisibilityDashboard = () => {
  const t = useTranslation('dashboard')
  const [loading, setLoading] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [validationResults, setValidationResults] = useState<AiVisibilityValidationResults | null>(null)
  const [metrics, setMetrics] = useState<BrandVisibilityMetrics | null>(null)
  const [platformData, setPlatformData] = useState<PlatformData[]>([])
  const [tips, setTips] = useState<Suggestion[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)

  const handleAnalyze = async (url: string) => {
    setLoading(true)
    setAnalyzed(false)
    setValidationResults(null) // Clear previous validation results
    setErrorMessage(null) // Clear previous errors
    setLoadingMessage(t('aiVisibility.dashboard.starting')) // Initial loading message

    try {
      setLoadingMessage(t('aiVisibility.dashboard.validating'))

      // Call real validation API using apiClient (auto-unwraps data field)
      const validationData = await apiClient.post<AiVisibilityValidationResults>('/api/ai-visibility/validate', { url })
        .then(res => res.data)

      setValidationResults(validationData)

      // If validation fails, stop here and show specific error messages
      if (!validationData.urlAccessibility.isPubliclyAccessible) {
        setErrorMessage(t('aiVisibility.dashboard.errorAccessibility'))
        setLoading(false)

return
      }

      if (!validationData.robotsTxt.allowsAIBots) {
        setErrorMessage(t('aiVisibility.dashboard.errorRobots'))
        setLoading(false)

return
      }

      if (!validationData.seoPractices.properHtml) {
        setErrorMessage(t('aiVisibility.dashboard.errorSeo'))
        setLoading(false)

return
      }

      // If validation passes, proceed with AI analysis
      setLoadingMessage(t('aiVisibility.dashboard.analyzing'))

      const analysisData = await apiClient.post<any>('/api/ai-visibility/analyze', { url })
        .then(res => res.data)

      // Calculate Technical Readiness Score from validation results
      let technicalScore = 0

      const checks = [
          validationData.urlAccessibility.isPubliclyAccessible,
          validationData.urlAccessibility.noLoginWall,
          validationData.urlAccessibility.noIpRestriction,
          validationData.urlAccessibility.noAggressiveBotBlocking,
          validationData.robotsTxt.allowsAIBots,
          validationData.seoPractices.properHtml,
          validationData.seoPractices.semanticTags,
          validationData.seoPractices.sitemapXml,
          validationData.seoPractices.cleanUrls
      ]

      const passed = checks.filter(Boolean).length

      technicalScore = Math.round((passed / checks.length) * 100)

      setMetrics({
          ...analysisData.metrics,
          technicalReadiness: technicalScore
      })
      setPlatformData(analysisData.platformData)
      setTips(analysisData.tips)
      setAnalyzed(true)

    } catch (error: any) {
        console.error('Error analyzing brand:', error)
        const message = error.response?.data?.message || error.message || t('aiVisibility.dashboard.unexpectedError')

        setErrorMessage(message)
    } finally {
        setLoading(false)
        setLoadingMessage(null) // Clear loading message on completion or error
    }
  }

  return (
    <Box>
      <Grid container spacing={6}>
        {errorMessage && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error" sx={{ mb: 4 }}>
              {errorMessage}
            </Alert>
          </Grid>
        )}
        {/* Input Section */}
        <Grid size={{ xs: 12 }}>
          <BrandInputSection onAnalyze={handleAnalyze} loading={loading} />
        </Grid>

        {/* Results Section */}
        {loading ? (
          <Grid size={{ xs: 12 }}>
            <AIVisibilityLoading message={loadingMessage} />
          </Grid>
        ) : (
          <>
            {!analyzed && !validationResults && !errorMessage && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ mb: 4 }}>
                  {t('aiVisibility.dashboard.initialInfo')}
                </Alert>
              </Grid>
            )}
            {validationResults && (
              <Grid size={{ xs: 12 }}>
                <AIVisibilityValidationResults results={validationResults} />
              </Grid>
            )}
            {analyzed && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {metrics ? t('aiVisibility.dashboard.analysisCompleteScore', { score: metrics.visibilityScore }) : t('aiVisibility.dashboard.analysisComplete')}
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
          </>
        )}
      </Grid>
    </Box>
  )
}

export default AIVisibilityDashboard
