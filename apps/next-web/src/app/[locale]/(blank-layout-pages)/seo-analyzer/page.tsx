import { useState } from 'react'

import axios from 'axios'
import { useTranslations } from 'next-intl'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Divider from '@mui/material/Divider'

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import ErrorIcon from '@mui/icons-material/Error'

import { SERVICES_CONFIG } from '@/configs/services'

// Tabler Icons (Simple SVG Wrappers)
const IconWorld = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
)

const IconSparkles = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
)

interface SeoResult {
    url: string
    healthScore: number
    strategicRecommendations: Array<{
        id: string
        title: string
        description: string
        impact: 'High' | 'Medium' | 'Low'
        type: string
    }>
    recommendations: Array<{
        priority: 'high' | 'medium' | 'low'
        category: string
        issue: string
        recommendation: string
        impact: string
    }>
    categoryScores: Record<string, { score: number; percentage: number }>
    meta: {
        title: string
        description: string
        server: string
    }
}

export default function SeoAnalyzerPage() {
    const t = useTranslations('common.seoAnalyzer')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<SeoResult | null>(null)

    const handleAnalyze = async () => {
        if (!url) return
        setError(null)
        setLoading(true)
        setResult(null)

        try {
            // Ensure protocol
            const targetUrl = url.startsWith('http') ? url : `https://${url}`

            const response = await axios.post(`${SERVICES_CONFIG.seo.url}/seo/analyze`, {
                url: targetUrl
            })

            if (response.data && response.data.data) {
                setResult(response.data.data)
            } else {
                throw new Error('Invalid response format')
            }
        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.message || err.message || 'Analysis failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return '#4caf50' // Green
        if (score >= 70) return '#ff9800' // Orange

        return '#f44336' // Red
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #1a1f3a 0%, #0f1729 100%)',
                color: 'white',
                pb: 10
            }}
        >
            {/* Header / Input Section */}
            <Container maxWidth="lg">
                <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 4, md: 6 }, textAlign: 'center' }}>
                    <Chip
                        label={t('hero.badge') || "AI-Powered SEO Tool"}
                        sx={{
                            mb: 3,
                            bgcolor: 'rgba(255, 152, 0, 0.1)',
                            color: 'warning.main',
                            fontWeight: 600,
                            border: '1px solid rgba(255, 152, 0, 0.3)',
                        }}
                    />
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '2rem', md: '3.5rem' },
                            fontWeight: 700,
                            mb: 2,
                            background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {t('hero.title') || "Instant SEO Health Check"}
                    </Typography>

                    <Typography sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.7)', maxWidth: '600px', mx: 'auto' }}>
                        {t('hero.subtitle') || "Enter your URL to get a comprehensive standard audit plus AI-generated strategic insights."}
                    </Typography>

                    <Box sx={{ maxWidth: '700px', mx: 'auto', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <TextField
                            fullWidth
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder={t('hero.inputPlaceholder') || "example.com"}
                            disabled={loading}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><IconWorld /></InputAdornment>,
                                sx: { bgcolor: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, color: 'white' }
                            }}
                        />
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleAnalyze}
                            disabled={loading || !url}
                            sx={{
                                px: 5,
                                bgcolor: 'warning.main',
                                color: 'grey.900',
                                fontWeight: 700,
                                '&:hover': { bgcolor: 'warning.dark' },
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : (t('hero.ctaButton') || "Analyze")}
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mt: 3, maxWidth: '700px', mx: 'auto', bgcolor: 'rgba(244, 67, 54, 0.1)', color: '#ffcdd2' }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </Container>

            {loading && (
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>Analyzing {url}...</Typography>
                        <LinearProgress color="warning" sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />
                        <Typography variant="body2" sx={{ mt: 2, color: 'gray' }}>Checking meta tags, performance, security, and content quality...</Typography>
                    </Box>
                </Container>
            )}

            {/* Results Section */}
            {!loading && result && (
                <Container maxWidth="lg">
                    {/* 1. Score & High Level */}
                    <Grid container spacing={4} sx={{ mb: 6 }}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, border: `1px solid ${getScoreColor(result.healthScore)}` }}>
                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                                        <CircularProgress
                                            variant="determinate"
                                            value={100}
                                            size={120}
                                            sx={{ color: 'rgba(255,255,255,0.1)' }}
                                        />
                                        <CircularProgress
                                            variant="determinate"
                                            value={result.healthScore}
                                            size={120}
                                            sx={{ color: getScoreColor(result.healthScore), position: 'absolute', left: 0 }}
                                        />
                                        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="h3" fontWeight="bold">{result.healthScore}</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="h5">Overall Health Score</Typography>
                                    <Typography variant="body2" sx={{ color: 'gray', mt: 1 }}>
                                        {result.meta.title ? `"${result.meta.title}"` : 'No Title Detected'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }}>
                            {/* AI Insights - NEW FEATURE */}
                            <Card sx={{ height: '100%', bgcolor: 'rgba(103, 58, 183, 0.15)', borderRadius: 3, border: '1px solid rgba(103, 58, 183, 0.4)' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                        <IconSparkles />
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#d1c4e9' }}>AI Strategic Insights</Typography>
                                    </Box>
                                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />

                                    {result.strategicRecommendations?.map((rec) => (
                                        <Box key={rec.id} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>{rec.title}</Typography>
                                                <Chip label={rec.impact} size="small" color={rec.impact === 'High' ? 'error' : 'secondary'} variant="outlined" />
                                            </Box>
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                {rec.description}
                                            </Typography>
                                        </Box>
                                    ))}
                                    {(!result.strategicRecommendations || result.strategicRecommendations.length === 0) && (
                                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'gray' }}>No strategic insights available at this time.</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* 2. Detailed Recommendations */}
                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Audit Details</Typography>

                    {result.recommendations.length === 0 ? (
                        <Alert severity="success" sx={{ mb: 4, bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#a5d6a7' }}>
                            Great job! No critical issues found.
                        </Alert>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {result.recommendations.map((rec, index) => (
                                <Accordion key={index} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'white' }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                                            {rec.priority === 'high' && <ErrorIcon color="error" sx={{ mr: 2 }} />}
                                            {rec.priority === 'medium' && <WarningIcon color="warning" sx={{ mr: 2 }} />}
                                            {rec.priority === 'low' && <CheckCircleIcon color="success" sx={{ mr: 2 }} />}

                                            <Typography sx={{ flex: 1, fontWeight: 600 }}>{rec.issue}</Typography>
                                            <Chip label={rec.category.replace('_', ' ')} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }} />
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                                            <strong>Recommendation:</strong> {rec.recommendation}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    )}
                </Container>
            )}
        </Box>
    )
}
