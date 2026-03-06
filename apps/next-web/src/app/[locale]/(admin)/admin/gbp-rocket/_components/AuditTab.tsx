'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ErrorIcon from '@mui/icons-material/Error'
import InfoIcon from '@mui/icons-material/Info'
import WarningIcon from '@mui/icons-material/Warning'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

// MUI Components
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { alpha, useTheme, styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Fade from '@mui/material/Fade'
import Zoom from '@mui/material/Zoom'

// Configs & API
import { SERVICES_CONFIG } from '@/configs/services'
import apiClient from '@/lib/apiClient'
import ScoreBreakdown from './ScoreBreakdown'

const GBP_API_URL = SERVICES_CONFIG.gbp.url
const AI_API_URL = SERVICES_CONFIG.ai.url

// --- Types ---

export interface AIRecommendation {
  category: string
  title: string
  description: string
  why: string[]
  steps: string[]
  impact: 'low' | 'medium' | 'high' | 'critical'
  effort: 'low' | 'medium' | 'high'
  confidence: number
  kpiTarget?: {
    metric: string
    target: number | string
    timeframe: string
  }
}

export interface AuditIssue {
  code: string
  severity: 'critical' | 'warning' | 'opportunity'
  title: string
  whyItMatters: string
  recommendation: string
  impactWeight: number
  suggestedCategories?: string[]
  recommendedPlacement?: string[]
  nextAction?: string
}

export interface AuditBreakdown {
  completeness: number
  description: number
  media: number
  freshness: number
  categories: number
  photoQuality: number
  keywordOptimization: number
}

export interface KeywordGapSummary {
  missingCount: number
  topPriorityKeywords: string[]
  extractedKeywords: string[]
}

export interface CategoryIntelligence {
  primaryCategory: string
  isGeneric: boolean
  suggestedAlternatives: string[]
}

export interface PhotoQualityDetails {
  totalPhotos: number
  hasCoverPhoto: boolean
  hasLogo: boolean
  recency: {
    last30Days: number
    last30To90Days: number
    older: number
  }
}

export interface GroupedIssues {
  critical: AuditIssue[]
  warning: AuditIssue[]
  opportunity: AuditIssue[]
}

export interface AuditResult {
  snapshotId: string
  totalScore: number
  breakdown: AuditBreakdown
  groupedIssues: GroupedIssues
  issues: AuditIssue[]
  keywordGapSummary?: KeywordGapSummary
  categoryIntelligence?: CategoryIntelligence
  photoQualityDetails?: PhotoQualityDetails
  photoImprovementPlan?: string[]
  createdAt: string
}



interface AuditTabProps {
  locationId: string
  snapshotId: string
}

// --- Styled Components ---

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px 0 rgba(0,0,0,0.1)',
  },
}))

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  border: 0,
  borderRadius: 8,
  boxShadow: `0 3px 5px 2px ${alpha(theme.palette.primary.main, 0.3)}`,
  color: 'white',
  height: 48,
  padding: '0 30px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 6px 10px 4px ${alpha(theme.palette.primary.main, 0.3)}`,
    transform: 'scale(1.02)',
  },
}))

const ScoreCircle = styled(Box)(() => ({
  position: 'relative',
  display: 'inline-flex',
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
  },
}))

// --- Component ---

const AuditTab = ({ locationId, snapshotId }: AuditTabProps) => {
  const t = useTranslations('gbpRocket')
  const theme = useTheme()

  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([])
  const [generatingAi, setGeneratingAi] = useState(false)

  const fetchAudit = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get<AuditResult>(
        `${GBP_API_URL}/locations/${locationId}/business-profile/snapshots/${snapshotId}/audit`
      )

      setAudit(response.data)
    } catch (err: any) {
      console.error('Failed to fetch audit:', err)
      setError(err.message || t('audit.failedToLoad'))
    } finally {
      setLoading(false)
    }
  }, [locationId, snapshotId, t])

  const runAudit = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post<AuditResult>(
        `${GBP_API_URL}/locations/${locationId}/business-profile/snapshots/${snapshotId}/audit`
      )

      setAudit(response.data)
      setAiRecommendations([]) // Reset AI recommendations when new audit is run
    } catch (err: any) {
      console.error('Failed to run audit:', err)
      setError(err.message || t('audit.failedToRun'))
    } finally {
      setLoading(false)
    }
  }, [locationId, snapshotId, t])

  const handleGenerateAiInsights = async () => {
    if (!audit) return

    try {
      setGeneratingAi(true)

      // Call AI Service
      const response = await apiClient.post<{ recommendations: AIRecommendation[] }>(
        `${AI_API_URL}/generate-recommendations`,
        {
          category: 'audit',
          context: {
            auditFindings: audit,

            // We could add brandDNA here if we had it contextually
          }
        }
      )

      if (response.data && response.data.recommendations) {
        setAiRecommendations(response.data.recommendations)
      }
    } catch (err) {
      console.error('Failed to generate AI insights:', err)

      // Optional: show error toast
    } finally {
      setGeneratingAi(false)
    }
  }

  useEffect(() => {
    fetchAudit()
  }, [fetchAudit])

  // --- Helpers ---

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error
      case 'warning': return theme.palette.warning
      case 'opportunity': return theme.palette.info
      default: return theme.palette.primary
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main
    if (score >= 70) return theme.palette.warning.main

    return theme.palette.error.main
  }

  // --- Sub-components ---

  const IssueCard = ({ issue }: { issue: AuditIssue }) => {
    const [expanded, setExpanded] = useState(false)
    const color = getSeverityColor(issue.severity)

    return (
      <Zoom in={true} style={{ transitionDelay: '100ms' }}>
        <Box sx={{ mb: 1 }}>
          <Box
            sx={{
              p: 2,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              bgcolor: expanded ? alpha(theme.palette.background.default, 0.5) : 'transparent',
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              borderLeft: `3px solid ${color.main}`,
              borderRadius: expanded ? '8px 8px 0 0' : 2,
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: alpha(theme.palette.background.default, 0.5) }
            }}
            onClick={() => setExpanded(!expanded)}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                {issue.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: '600px' }}>
                {issue.whyItMatters}
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Chip
                label={issue.impactWeight > 7 ? 'High Impact' : issue.impactWeight > 4 ? 'Medium Impact' : 'Low Impact'}
                size="small"
                sx={{ bgcolor: alpha(color.main, 0.1), color: color.main, fontSize: 10, fontWeight: 600, height: 20 }}
              />
              <IconButton size="small" sx={{ p: 0 }}>
                {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Stack>
          </Box>

          <Collapse in={expanded}>
            <Box sx={{
              p: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              borderTop: 'none',
              borderLeft: `3px solid ${color.main}`,
              borderRadius: '0 0 8px 8px'
            }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">{t('audit.whyItMattersLabel')}</Typography>
                  <Typography variant="caption">{issue.whyItMatters}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">{t('audit.recommendedAction')}</Typography>
                  <Typography variant="caption">{issue.recommendation}</Typography>
                </Box>
                {issue.nextAction && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">{t('audit.toDo')}</Typography>
                    <Typography variant="caption">{issue.nextAction}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Collapse>
        </Box>
      </Zoom>
    )
  }

  // --- Render Helpers ---


  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <Skeleton variant="rounded" height={220} sx={{ borderRadius: 4 }} />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />
            </Grid>
          </Grid>
        </Stack>
      </Box>
    )
  }

  if (!audit) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, textAlign: 'center' }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            {error}
          </Alert>
        )}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            border: '1px dashed',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box
            sx={{
              mb: 1,
              p: 2.5,
              borderRadius: '50%',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main'
            }}
          >
            <AutoAwesomeIcon fontSize="large" />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            {t('audit.noResults')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
            {t('audit.runAuditDescription')}
          </Typography>
          <GradientButton
            onClick={runAudit}
            startIcon={<AutoAwesomeIcon />}
            sx={{ mt: 1 }}
          >
            {t('audit.runNow')}
          </GradientButton>
        </Paper>
      </Box>
    )
  }


  const renderIssuesList = (issues: AuditIssue[]) => {
    if (!issues || issues.length === 0) {
      return (
        <Box sx={{ p: 6, textAlign: 'center', bgcolor: alpha(theme.palette.action.hover, 0.05), borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" gutterBottom>{t('audit.noIssues')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('audit.noIssuesDescription')}</Typography>
        </Box>
      )
    }

    return (
      <Box sx={{ mt: 1 }}>
        {issues.map((issue, index) => (
          <IssueCard key={`${issue.code}-${index}`} issue={issue} />
        ))}
      </Box>
    )
  }

  const renderSeveritySection = (issues: AuditIssue[], severity: 'critical' | 'warning' | 'opportunity') => {
    if (!issues || issues.length === 0) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{
          p: 1.5,
          px: 2,
          mb: 1.5,
          borderRadius: 2,
          bgcolor: alpha(getSeverityColor(severity).main, 0.08),
          color: getSeverityColor(severity).main
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {severity === 'critical' ? <ErrorIcon fontSize="small" /> : severity === 'warning' ? <WarningIcon fontSize="small" /> : <InfoIcon fontSize="small" />}
            <Typography variant="subtitle2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
              {severity}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2" fontWeight="bold">{issues.length}</Typography>
            <ExpandMoreIcon fontSize="small" sx={{ opacity: 0.5 }} />
          </Stack>
        </Stack>
        {renderIssuesList(issues)}
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1600, margin: '0 auto', p: { xs: 2, md: 3 } }}>

      {error && (
        <Alert severity='warning' sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={runAudit}>
            {t('audit.errorRetry')}
          </Button>
        }>
          {error}{' - '}{t('audit.mockDataNote')}
        </Alert>
      )}

      {/* 1. Hero / Score Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ md: 8, xs: 12 }}>
          <StyledCard sx={{ p: 0, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Score Circle Area */}
            <Box sx={{
              p: 4,
              width: { xs: '100%', md: '30%' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: { md: `1px solid ${theme.palette.divider}` },
              borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: 'none' }
            }}>
              <ScoreCircle>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={140}
                  thickness={6}
                  sx={{ color: theme.palette.action.hover, position: 'absolute' }}
                />
                <CircularProgress
                  variant="determinate"
                  value={audit.totalScore}
                  size={140}
                  thickness={6}
                  sx={{
                    color: getScoreColor(audit.totalScore),
                    animation: 'progress 1s ease-out forwards',
                    '@keyframes progress': { '0%': { strokeDasharray: '0 100' } }
                  }}
                />
                <Box
                  sx={{
                    top: 0, left: 0, bottom: 0, right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h3" fontWeight="bold" color="text.primary" sx={{ lineHeight: 1 }}>
                    {audit.totalScore}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{t('audit.outOf100')}</Typography>
                </Box>
              </ScoreCircle>
              <Typography variant="subtitle1" fontWeight="bold" align="center" sx={{ mt: 3, mb: 1, lineHeight: 1.2 }}>
                {t('audit.overallOptimization')}<br />{t('audit.score')}
              </Typography>
              <Typography variant="caption" color="text.secondary" align="center">
                {audit.totalScore >= 90 ? t('audit.healthExcellent') : audit.totalScore >= 70 ? t('audit.healthGood') : t('audit.healthNeedsWork')}
              </Typography>
            </Box>

            {/* Score Breakdown Bars */}
            <Box sx={{ width: { xs: '100%', md: '70%' }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <ScoreBreakdown audit={audit} />
            </Box>
          </StyledCard>
        </Grid>

        {/* AI Action Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <StyledCard sx={{
            p: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            textAlign: 'center'
          }}>
            <Box sx={{
              mb: 3,
              p: 2,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main
            }}>
              <AutoAwesomeIcon fontSize="large" />
            </Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {t('audit.aiInsights')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('audit.aiInsightsDescription')}
            </Typography>
            <GradientButton
              fullWidth
              startIcon={generatingAi ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
              onClick={handleGenerateAiInsights}
              disabled={generatingAi}
            >
              {generatingAi ? t('audit.generatingAiInsights') : aiRecommendations.length > 0 ? t('audit.regenerateAiInsights') : t('audit.generateAiInsights')}
            </GradientButton>
            {aiRecommendations.length > 0 && (
              <Fade in={true}>
                <Typography variant="caption" sx={{ mt: 2, color: 'success.main', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                  {t('audit.aiInsightsReady')}
                </Typography>
              </Fade>
            )}
          </StyledCard>
        </Grid>
      </Grid>

      {/* 2. AI Strategic Plan (Collapsible) */}
      <Collapse in={aiRecommendations.length > 0}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" />{' '}{t('audit.aiStrategicPlan')}
          </Typography>
          <Grid container spacing={3}>
            {aiRecommendations.map((rec, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <StyledCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ height: 6, width: '100%', bgcolor: rec.impact === 'critical' ? 'error.main' : 'primary.main' }} />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Chip
                        label={rec.impact.toUpperCase()}
                        size="small"
                        color={rec.impact === 'critical' ? 'error' : 'primary'}
                        sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}
                      />
                      {rec.kpiTarget && (
                        <Chip
                          label={`Target: ${rec.kpiTarget.target} ${rec.kpiTarget.metric}`}
                          variant="outlined"
                          size="small"
                          sx={{ fontSize: '0.65rem' }}
                        />
                      )}
                    </Stack>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '1.1rem', lineHeight: 1.3 }}>
                      {rec.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {rec.description}
                    </Typography>

                    <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 2 }}>
                      <Typography variant="caption" fontWeight="bold" display="block" gutterBottom color="text.primary">
                        {t('audit.whyItMatters')}
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {rec.why.slice(0, 2).map((w, idx) => (
                          <li key={idx}><Typography variant="caption" color="text.secondary">{w}</Typography></li>
                        ))}
                      </ul>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Collapse>

      {/* 3. Main Content & Sidebar Layout */}
      <Grid container spacing={4}>
        {/* Left Column: Issues List */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">{t('audit.issuesAndRecommendations')}</Typography>
            <Chip label={`${audit.issues.length} issues found`} size="small" variant="tonal" />
          </Stack>

          <Box sx={{ minHeight: 400 }}>
            {renderSeveritySection(audit.groupedIssues.critical, 'critical')}
            {renderSeveritySection(audit.groupedIssues.warning, 'warning')}
            {renderSeveritySection(audit.groupedIssues.opportunity, 'opportunity')}
          </Box>
        </Grid>

        {/* Right Column: Sidebar Widgets */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>

            {/* Category Intelligence Widget */}
            {audit.categoryIntelligence && (
              <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>{t('audit.categoryIntelligence')}</Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="caption" color="text.secondary">{t('audit.primaryCategory')}</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">{audit.categoryIntelligence.primaryCategory}</Typography>
                  {audit.categoryIntelligence.isGeneric && (
                    <Chip label={t('audit.genericChip')} size="small" color="warning" sx={{ height: 20, fontSize: 10, bgcolor: alpha(theme.palette.warning.main, 0.1) }} />
                  )}
                </Stack>

                {audit.categoryIntelligence.suggestedAlternatives.length > 0 && (
                  <>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{t('audit.suggestedAlternatives')}</Typography>
                    <Stack spacing={1} sx={{ mb: 3 }}>
                      {audit.categoryIntelligence.suggestedAlternatives.slice(0, 3).map((cat, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon color="success" sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{cat}</Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Button fullWidth variant="contained" color="primary" disableElevation sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.main, borderRadius: 2 }}>
                      {t('audit.changeTo')}{' '}{audit.categoryIntelligence.suggestedAlternatives[0]}
                    </Button>
                  </>
                )}
              </Paper>
            )}

            {/* Photo Quality Widget */}
            {audit.photoQualityDetails && (
              <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>{t('audit.photoQuality')}</Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">{t('audit.totalPhotos')}</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">{audit.photoQualityDetails.totalPhotos}{' '}{t('audit.outOf20Plus')}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">{t('audit.coverPhoto')}</Typography>
                    <Chip label={audit.photoQualityDetails.hasCoverPhoto ? t('audit.photoSet') : t('audit.photoMissing')} size="small" color={audit.photoQualityDetails.hasCoverPhoto ? 'success' : 'error'} sx={{ height: 20, fontSize: 10, bgcolor: alpha(audit.photoQualityDetails.hasCoverPhoto ? theme.palette.success.main : theme.palette.error.main, 0.1) }} />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">{t('audit.logoPhoto')}</Typography>
                    <Chip label={audit.photoQualityDetails.hasLogo ? t('audit.photoSet') : t('audit.photoMissing')} size="small" color={audit.photoQualityDetails.hasLogo ? 'success' : 'error'} sx={{ height: 20, fontSize: 10, bgcolor: alpha(audit.photoQualityDetails.hasLogo ? theme.palette.success.main : theme.palette.error.main, 0.1) }} />
                  </Stack>
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{t('audit.photoRecency')}</Typography>
                <Stack direction="row" sx={{ height: 6, borderRadius: 3, overflow: 'hidden', mb: 1 }}>
                  <Box sx={{ width: `${Math.max(5, (audit.photoQualityDetails.recency.last30Days / Math.max(1, audit.photoQualityDetails.totalPhotos)) * 100)}%`, bgcolor: theme.palette.success.main }} />
                  <Box sx={{ width: `${Math.max(5, (audit.photoQualityDetails.recency.last30To90Days / Math.max(1, audit.photoQualityDetails.totalPhotos)) * 100)}%`, bgcolor: theme.palette.warning.main }} />
                  <Box sx={{ width: `${Math.max(5, (audit.photoQualityDetails.recency.older / Math.max(1, audit.photoQualityDetails.totalPhotos)) * 100)}%`, bgcolor: theme.palette.error.main }} />
                </Stack>
                <Stack spacing={0.5} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.success.main }} /><Typography variant="caption" color="text.secondary">{t('audit.last30Days', { count: audit.photoQualityDetails.recency.last30Days })}</Typography></Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.warning.main }} /><Typography variant="caption" color="text.secondary">{t('audit.last30To90Days', { count: audit.photoQualityDetails.recency.last30To90Days })}</Typography></Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.error.main }} /><Typography variant="caption" color="text.secondary">{t('audit.olderThan90Days', { count: audit.photoQualityDetails.recency.older })}</Typography></Box>
                </Stack>

                {audit.photoImprovementPlan && audit.photoImprovementPlan.length > 0 && (
                  <>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{t('audit.improvementChecklist')}</Typography>
                    <Stack spacing={1}>
                      {audit.photoImprovementPlan.map((plan, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {i === 0 || i === 1 ? <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${theme.palette.divider}` }} /> : <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />}
                          <Typography variant="caption" sx={{ color: i === 0 || i === 1 ? 'text.secondary' : 'success.main', fontWeight: i >= 2 ? 600 : 400 }}>{plan}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </>
                )}
              </Paper>
            )}

            {/* Keyword Optimization Widget */}
            {audit.keywordGapSummary && (
              <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>{t('audit.keywordOptimization')}</Typography>
                <Divider sx={{ mb: 3 }} />

                {audit.keywordGapSummary.extractedKeywords && audit.keywordGapSummary.extractedKeywords.length > 0 && (
                  <>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{t('audit.extractedKeywords')}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {audit.keywordGapSummary.extractedKeywords.slice(0, 8).map((kw, i) => (
                        <Chip key={i} label={kw} size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, fontWeight: 600, fontSize: 11 }} />
                      ))}
                    </Box>
                  </>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{t('audit.missingTargetKeywords')}</Typography>
                <Stack spacing={1.5}>
                  {audit.keywordGapSummary.topPriorityKeywords.map((kw, i) => {
                    const issue = audit.issues.find(iss => iss.code.includes(`kw_gap_`) && iss.title.toLowerCase().includes(kw));

                    return (
                      <Box key={i} sx={{ p: 1.5, border: `1px solid ${alpha(theme.palette.divider, 0.4)}`, borderRadius: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold">{kw}</Typography>
                          <AddCircleOutlineIcon color="primary" sx={{ fontSize: 16, opacity: 0.6 }} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {issue ? issue.whyItMatters : t('audit.attractsSearches')}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                            {t('audit.suggestedPlacement')}
                          </Typography>
                          {issue?.recommendedPlacement ? (
                            issue.recommendedPlacement.slice(0, 2).map((place, pIdx) => (
                              <Chip key={pIdx} label={place} size="small" sx={{ height: 16, fontSize: 9, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }} />
                            ))
                          ) : (
                            <Chip label="Description" size="small" sx={{ height: 16, fontSize: 9, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }} />
                          )}
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AuditTab
