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
import AIVisibilityValidationResults from './AIVisibilityValidationResults'
import { type AiVisibilityValidationResults } from './AIVisibilityValidationTypes'

const AIVisibilityDashboard = () => {
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
    setLoadingMessage('Starting analysis...') // Initial loading message

    try {
      setLoadingMessage('Validating URL accessibility and robots.txt...')

      // Call real validation API
      const validationResponse = await fetch('/api/ai-visibility/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!validationResponse.ok) {
        const errorData = await validationResponse.json().catch(() => ({}))

        console.error('Validation API Error:', errorData)
        const message = errorData.message || 'Validation failed'

        setErrorMessage(message)
        throw new Error(message)
      }

      const validationResponseData = await validationResponse.json()

      if (!validationResponseData.success || !validationResponseData.data) {
        console.error('Validation API Error: Invalid response structure', validationResponseData)
        throw new Error(validationResponseData.message || 'Validation failed: Invalid response')
      }

      const validationData: AiVisibilityValidationResults = validationResponseData.data

      setValidationResults(validationData)

      // If validation fails, stop here and show specific error messages
      if (!validationData.urlAccessibility.isPubliclyAccessible) {
        setErrorMessage('URL is not publicly accessible. Please ensure it is live and not behind a login or IP restriction.')
        setLoading(false)

        return // Stop if validation fails
      }

      if (!validationData.robotsTxt.allowsAIBots) {
        setErrorMessage('robots.txt disallows AI bots. Please update your robots.txt to allow crawlers.')
        setLoading(false)

        return // Stop if validation fails
      }

      if (!validationData.seoPractices.properHtml) {
        setErrorMessage('Basic SEO practices not met (e.g., no proper HTML structure). Please ensure your page has valid HTML.')
        setLoading(false)

        return // Stop if validation fails
      }

      // If validation passes, proceed with AI analysis
      setLoadingMessage('Analyzing AI visibility and generating insights...')

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
            const message = errorData.message || 'Analysis failed'

            setErrorMessage(message)
            throw new Error(message)
        }

        const data = await response.json()

        if (data.success && data.data) {
            // Calculate Technical Readiness Score from validation results
            let technicalScore = 0

            if (validationResults) {
                const checks = [
                    validationResults.urlAccessibility.isPubliclyAccessible,
                    validationResults.urlAccessibility.noLoginWall,
                    validationResults.urlAccessibility.noIpRestriction,
                    validationResults.urlAccessibility.noAggressiveBotBlocking,
                    validationResults.robotsTxt.allowsAIBots,
                    validationResults.seoPractices.properHtml,
                    validationResults.seoPractices.semanticTags,
                    validationResults.seoPractices.sitemapXml,
                    validationResults.seoPractices.cleanUrls
                ]

                const passed = checks.filter(Boolean).length

                technicalScore = Math.round((passed / checks.length) * 100)
            }

            setMetrics({
                ...data.data.metrics,
                technicalReadiness: technicalScore
            })
            setPlatformData(data.data.platformData)
            setTips(data.data.tips)
            setAnalyzed(true)
        }
    } catch (error: any) {
        console.error('Error analyzing brand:', error)
        setErrorMessage(error.message || 'An unexpected error occurred')

        // Fallback or error handling could go here
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
                  Enter a URL above to analyze its AI visibility and get optimization tips.
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
                    {metrics ? `Analysis complete! Your brand achieved a visibility score of ${metrics.visibilityScore}%.` : 'Analysis complete!'}
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
