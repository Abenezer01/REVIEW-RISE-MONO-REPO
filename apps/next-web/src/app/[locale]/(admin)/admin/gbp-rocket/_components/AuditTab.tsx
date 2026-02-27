import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
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
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import { alpha, useTheme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'

import { SERVICES_CONFIG } from '@/configs/services'
import apiClient from '@/lib/apiClient'

const GBP_API_URL = SERVICES_CONFIG.gbp.url

export interface AuditIssue {
  code: string
  severity: 'critical' | 'warning' | 'opportunity'
  title: string
  whyItMatters: string
  recommendation: string
  impactWeight: number
}

export interface AuditBreakdown {
  completeness: number
  description: number
  media: number
  freshness: number
  categories: number
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
  createdAt: string
}

interface AuditTabProps {
  locationId: string
  snapshotId: string
}

const AuditTab = ({ locationId, snapshotId }: AuditTabProps) => {
  const t = useTranslations('gbpRocket')
  const theme = useTheme()

  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)

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
    } catch (err: any) {
      console.error('Failed to run audit:', err)
      setError(err.message || t('audit.failedToRun'))
    } finally {
      setLoading(false)
    }
  }, [locationId, snapshotId, t])

  useEffect(() => {
    fetchAudit()
  }, [fetchAudit])

  if (loading && !audit) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity='error' action={
          <Button color="inherit" size="small" onClick={runAudit}>
            {t('audit.errorRetry')}
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    )
  }

  if (!audit) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='body1' sx={{ mb: 2 }}>{t('audit.noResults')}</Typography>
        <Button variant='contained' onClick={runAudit}>{t('audit.runNow')}</Button>
      </Box>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error'
      case 'warning': return 'warning'
      case 'opportunity': return 'info'
      default: return 'primary'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main
    if (score >= 70) return theme.palette.warning.main

    return theme.palette.error.main
  }

  const renderBreakdownItem = (label: string, value: number) => (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight="bold">{value}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        color={value >= 80 ? "success" : value >= 50 ? "warning" : "error"}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  )

  const IssueCard = ({ issue }: { issue: AuditIssue }) => {
    const [expanded, setExpanded] = useState(false)

    return (
      <Card variant="outlined" sx={{ mb: 2, position: 'relative' }}>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'flex-start',
            cursor: 'pointer',
            bgcolor: alpha((theme.palette[getSeverityColor(issue.severity) as keyof typeof theme.palette] as any).main, 0.04)
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={issue.severity.toUpperCase()}
                color={getSeverityColor(issue.severity) as any}
                size="small"
                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }}
              />
              <Typography variant="subtitle1" fontWeight="bold">
                {issue.title}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {issue.whyItMatters}
            </Typography>
          </Box>
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expanded}>
          <Divider />
          <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom>
              {t('audit.recommendation')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {issue.recommendation}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.disabled">
                {t('audit.impactWeight')} {issue.impactWeight}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                • {t('audit.code')} {issue.code}
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Card>
    )
  }

  const renderIssuesList = (issues: AuditIssue[]) => {
    if (!issues || issues.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography color="text.secondary">{t('audit.noIssues')}</Typography>
        </Box>
      )
    }

    return (
      <Box sx={{ mt: 2 }}>
        {issues.map((issue, index) => (
          <IssueCard key={`${issue.code}-${index}`} issue={issue} />
        ))}
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Left Column: Score & Breakdown */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Overall Score */}
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={140}
                  thickness={4}
                  sx={{ color: 'action.selected', position: 'absolute' }}
                />
                <CircularProgress
                  variant="determinate"
                  value={audit.totalScore}
                  size={140}
                  thickness={4}
                  sx={{ color: getScoreColor(audit.totalScore) }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h3" component="div" fontWeight="bold" color="text.primary">
                    {audit.totalScore}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{t('audit.outOf100')}</Typography>
                </Box>
              </Box>
              <Typography variant="h6" gutterBottom>{t('audit.profileHealthScore')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('audit.scoreDescription')}
              </Typography>
            </Card>

            {/* Detailed Breakdown */}
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {t('audit.scoreBreakdown')}
              </Typography>
              {renderBreakdownItem(t('audit.completenessLabel'), Number(audit.breakdown.completeness.toFixed(2)))}
              {renderBreakdownItem(t('audit.descriptionLabel'), Number(audit.breakdown.description.toFixed(2)))}
              {renderBreakdownItem(t('audit.mediaLabel'), Number(audit.breakdown.media.toFixed(2)))}
              {renderBreakdownItem(t('audit.freshnessLabel'), Number(audit.breakdown.freshness.toFixed(2)))}
              {renderBreakdownItem(t('audit.categoriesLabel'), Number(audit.breakdown.categories.toFixed(2)))}
            </Card>
          </Stack>
        </Grid>

        {/* Right Column: Grouped Issues */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="fullWidth"
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor:
                      activeTab === 0
                        ? 'error.main'
                        : activeTab === 1
                          ? 'warning.main'
                          : 'info.main',
                  },
                }}
              >
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {t('audit.critical')}
                      <Chip label={audit.groupedIssues.critical.length} size="small" color="error" />
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {t('audit.warning')}
                      <Chip label={audit.groupedIssues.warning.length} size="small" color="warning" />
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {t('audit.opportunity')}
                      <Chip label={audit.groupedIssues.opportunity.length} size="small" color="info" />
                    </Box>
                  }
                />
              </Tabs>
            </Box>
            <CardContent sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
              {activeTab === 0 && renderIssuesList(audit.groupedIssues.critical)}
              {activeTab === 1 && renderIssuesList(audit.groupedIssues.warning)}
              {activeTab === 2 && renderIssuesList(audit.groupedIssues.opportunity)}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AuditTab
