/* eslint-disable import/no-unresolved */
'use client'

import { useState, useEffect, useCallback } from 'react'

import { useParams, useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Rating from '@mui/material/Rating'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import { useTheme, alpha } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'

import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'

import { SystemMessageCode } from '@platform/contracts'

import { useTranslations, useFormatter } from 'next-intl'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

import CustomChip from '@core/components/mui/Chip'
import CustomTextField from '@core/components/mui/TextField'

import SentimentBadge from '@/components/shared/reviews/SentimentBadge'
import EmotionChips from '@/components/shared/reviews/EmotionChips'

import { updateReviewReply, regenerateAISuggestion, rejectReviewReply, getReviewWithHistory } from '@/app/actions/review'
import { getBrandProfileByBusinessId } from '@/app/actions/brand-profile'

const DEFAULT_TONE_PRESETS = [
  { value: 'Professional', label: 'Professional' },
  { value: 'Friendly', label: 'Friendly' },
  { value: 'Empathetic', label: 'Empathetic' },
  { value: 'Humorous', label: 'Humorous' },
  { value: 'Concise', label: 'Concise' }
]

const ReviewDetailPage = () => {
  const t = useTranslations('dashboard')
  const tc = useTranslations('common')
  const format = useFormatter()
  const { notify } = useSystemMessages()
  const theme = useTheme()
  const params = useParams()
  const router = useRouter()
  const { id } = params
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [reply, setReply] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [currentReview, setCurrentReview] = useState<any>(null)
  const [tonePreset, setTonePreset] = useState('Professional')
  const [tonePresets, setTonePresets] = useState(DEFAULT_TONE_PRESETS)
  const [variations, setVariations] = useState<string[]>([])
  const [activeVariationIndex, setActiveVariationIndex] = useState(0)

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fetchReview = useCallback(async () => {
    if (!id) return
    
    setLoading(true)
    setError('')
    
    try {
      const res = await getReviewWithHistory(id as string)
      
      if (res.success && res.data) {
        setCurrentReview(res.data)
      } else {
        setError(res.error || 'Failed to fetch review')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchReview()
  }, [fetchReview])

  useEffect(() => {
    if (currentReview) {
      setReply(currentReview.response || '')
      
      // Load variations from aiSuggestions if available
      if (currentReview.aiSuggestions?.variations) {
        setVariations(currentReview.aiSuggestions.variations)
      } else if (currentReview.aiSuggestions?.suggestedReply) {
        setVariations([currentReview.aiSuggestions.suggestedReply])
      } else {
        setVariations([])
      }

      // Fetch brand profile for tone descriptors
      if (currentReview.businessId) {
        getBrandProfileByBusinessId(currentReview.businessId).then(res => {
          if (res.success && res.data?.tone) {
            const tone = res.data.tone as any

            if (tone.descriptors && Array.isArray(tone.descriptors)) {
              const descriptors = tone.descriptors as string[]

              if (descriptors.length > 0) {
                const newPresets = descriptors.map(d => ({ value: d, label: d }))

                setTonePresets(newPresets)
                setTonePreset(newPresets[0].value)
              }
            }
          }
        })
      }
    }
  }, [currentReview])

  const sentiment = currentReview?.sentiment || (currentReview?.rating >= 4 ? 'Positive' : currentReview?.rating <= 2 ? 'Negative' : 'Neutral')

  const handleSaveReply = async () => {
    if (!reply.trim()) {
      notify(SystemMessageCode.REVIEWS_REPLY_EMPTY)

      return
    }

    setIsSubmitting(true)

    const res = await updateReviewReply(currentReview.id, reply)

    setIsSubmitting(false)

    if (res.success) {
      notify(SystemMessageCode.REVIEWS_REPLY_POSTED)

      // Update local state
      setCurrentReview(res.data)
    } else {
      notify(SystemMessageCode.GENERIC_ERROR)
    }
  }

  const handleRejectReply = async () => {
    setIsSubmitting(true)

    const res = await rejectReviewReply(currentReview.id)

    setIsSubmitting(false)

    if (res.success) {
      notify(SystemMessageCode.REVIEWS_REPLY_REJECTED)

      // Update local state
      setCurrentReview(res.data)
    } else {
      notify(SystemMessageCode.GENERIC_ERROR)
    }
  }

  const handleUseVariation = (index: number) => {
    setActiveVariationIndex(index)
    setReply(variations[index])
  }

  const handleAnalyzeReview = async () => {
    setIsRegenerating(true)

    // Dynamically import to avoid server/client issues
    const { analyzeSingleReview } = await import('@/app/actions/review')
    const analysisRes = await analyzeSingleReview(currentReview.id)

    if (analysisRes.success) {
      notify(SystemMessageCode.SUCCESS)

      // Update with analysis result first
      setCurrentReview(analysisRes.data)
    } else {
      notify(SystemMessageCode.GENERIC_ERROR)
      setIsRegenerating(false)

      return
    } 

    const suggestionRes = await regenerateAISuggestion(currentReview.id, { tonePreset })

    setIsRegenerating(false)

    if (suggestionRes.success && suggestionRes.data) {
      notify(SystemMessageCode.SUCCESS)
      
      const updatedReview = suggestionRes.data as any
      
      setCurrentReview(updatedReview)
      
      if (updatedReview.aiSuggestions?.variations) {
        setVariations(updatedReview.aiSuggestions.variations)

        if (updatedReview.aiSuggestions.variations.length > 0) {
          setReply(updatedReview.aiSuggestions.variations[0])
          setActiveVariationIndex(0)
        }
      }
    } else {
      notify(SystemMessageCode.GENERIC_ERROR)
    }
  }

  // Handle Regenerate button also calling the same analysis
  const handleRegenerateAI = handleAnalyzeReview

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={200} height={40} />
            </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Grid>
      </Grid>
    )
  }

  if (error || !currentReview) {
    return (
        <Box sx={{ p: 5 }}>
            <Alert severity="error">{error || t('reviews.smart.detail.notFound')}</Alert>
            <Button variant="outlined" onClick={() => router.back()} sx={{ mt: 2 }}>
                {tc('common.back')}
            </Button>
        </Box>
    )
  }

  return (
    <Grid container spacing={6}>
        {/* Header */}
        <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IconButton onClick={() => router.back()} sx={{ bgcolor: 'background.paper' }}>
                        <i className='tabler-arrow-left' />
                    </IconButton>
                    <Box>
                        <Typography variant='h4' fontWeight={700}>{t('reviews.smart.detail.title')}</Typography>
                        <Typography variant='body2' color='text.secondary'>{t('reviews.smart.detail.subtitle')}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button 
                        variant="outlined" 
                        color="primary"
                        startIcon={isRegenerating ? <i className='tabler-loader spin' /> : <i className="tabler-wand" />}
                        onClick={handleAnalyzeReview}
                        disabled={isRegenerating}
                        size="small"
                    >
                        {t('reviews.smart.runSentiment')}
                    </Button>
                    <CustomChip 
                        label={currentReview.response ? tc('status.replied') : t('overview.pendingReviews')}
                        color={currentReview.response ? 'success' : 'warning'}
                        variant='tonal'
                    />
                </Box>
            </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
            <Card>
                <CardContent>
                    {/* Author & Rating */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6 }}>
                        <Stack direction="row" spacing={4} alignItems="center">
                        <Avatar 
                            sx={{ 
                            width: 64, 
                            height: 64, 
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                            }}
                        >
                            {currentReview.author ? currentReview.author.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                        <Box>
                            <Typography variant='h5' fontWeight={700} sx={{ mb: 0.5 }}>{currentReview.author}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Rating value={currentReview.rating} readOnly />
                            <Typography variant='body1' fontWeight={600} color='text.primary'>
                                {currentReview.rating}.0
                            </Typography>
                            </Box>
                        </Box>
                        </Stack>
                        <SentimentBadge
                        sentiment={sentiment?.toLowerCase() as any}
                        size='medium'
                        />
                    </Box>
                    
                    <Stack direction="row" spacing={8} sx={{ mb: 6 }}>
                        <Box>
                        <Typography variant='caption' color='text.disabled' sx={{ textTransform: 'uppercase', fontWeight: 700, mb: 1, display: 'block' }}>
                            {t('reviews.smart.detail.publishedDate')}
                        </Typography>
                        <Typography variant='body1' fontWeight={500}>
                            {isMounted ? format.dateTime(new Date(currentReview.publishedAt), {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : ''}
                        </Typography>
                        </Box>
                        <Box>
                        <Typography variant='caption' color='text.disabled' sx={{ textTransform: 'uppercase', fontWeight: 700, mb: 1, display: 'block' }}>
                            {t('reviews.smart.detail.source')}
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <i className={currentReview.platform === 'gbp' ? 'tabler-brand-google text-primary' : 'tabler-world text-primary'} style={{ fontSize: '1.25rem' }} />
                            <Typography variant='body1' fontWeight={600} sx={{ textTransform: 'uppercase' }}>
                            {currentReview.platform === 'gbp' ? tc('channel.google') : currentReview.platform}
                            </Typography>
                        </Stack>
                        </Box>
                    </Stack>

                    <Divider sx={{ my: 6 }} />

                    {/* Content */}
                    <Typography variant='subtitle2' sx={{ mb: 3, textTransform: 'uppercase', color: 'text.disabled', fontWeight: 700, letterSpacing: '0.5px' }}>
                        {t('reviews.smart.detail.reviewContent')}
                    </Typography>
                    <Box sx={{ 
                        p: 4, 
                        bgcolor: (theme) => alpha(theme.palette.background.default, 0.6), 
                        borderRadius: 2, 
                        border: theme => `1px solid ${theme.palette.divider}`,
                        mb: 6
                    }}>
                        <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '1.1rem', color: 'text.primary' }}>
                        {currentReview.content || t('reviews.smart.detail.noContent')}
                        </Typography>
                    </Box>
                    
                    {(currentReview.tags?.length > 0 || currentReview.aiSuggestions?.topics?.length > 0) && (
                        <Grid container spacing={4}>
                            {currentReview.tags?.length > 0 && (
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant='caption' color='text.disabled' sx={{ textTransform: 'uppercase', fontWeight: 700, mb: 2, display: 'block' }}>
                                        {t('reviews.smart.detail.extractedEmotions')}
                                    </Typography>
                                    <EmotionChips emotions={currentReview.tags} />
                                </Grid>
                            )}
                            
                            {currentReview.aiSuggestions?.topics?.length > 0 && (
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant='caption' sx={{ color: 'text.disabled', textTransform: 'uppercase', fontWeight: 700, display: 'block', mb: 2 }}>
                                        {t('reviews.smart.detail.keyTopics')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {currentReview.aiSuggestions.topics.map((topic: string) => (
                                            <Chip key={topic} label={topic} size='small' variant='outlined' />
                                        ))}
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    )}

                    <Divider sx={{ my: 6 }} />

                    {/* Reply Editor */}
                    <Box>
                        <Typography variant='subtitle2' sx={{ mb: 3, textTransform: 'uppercase', color: 'text.disabled', fontWeight: 700, letterSpacing: '0.5px' }}>
                            {t('reviews.smart.detail.yourReply')}
                        </Typography>
                        <CustomTextField
                            id="review-reply-editor"
                            fullWidth
                            multiline
                            rows={6}
                            placeholder={t('reviews.smart.detail.writeReply')}
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            sx={{ 
                            mb: 4,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                            }
                            }}
                        />
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button
                                variant='tonal'
                                color='error'
                                size="large"
                                onClick={handleRejectReply}
                                disabled={isSubmitting}
                                startIcon={isSubmitting ? <i className='tabler-loader spin' /> : <i className='tabler-trash' />}
                                sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
                            >
                                {t('reviews.smart.detail.reject')}
                            </Button>
                            <Button
                                variant='contained'
                                size="large"
                                onClick={handleSaveReply}
                                disabled={isSubmitting}
                                startIcon={isSubmitting ? <i className='tabler-loader spin' /> : <i className='tabler-send' />}
                                sx={{ 
                                    borderRadius: 2, 
                                    fontWeight: 700,
                                    px: 5,
                                    boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
                                }}
                            >
                                {currentReview.response ? t('reviews.smart.detail.updateReply') : t('reviews.smart.detail.postReply')}
                            </Button>
                        </Stack>
                    </Box>

                    {currentReview.replies && currentReview.replies.length > 0 && ( 
                    <> 
                        <Box sx={{ p: 6, bgcolor: theme => theme.palette.mode === 'light' ? alpha(theme.palette.secondary.main, 0.02) : 'transparent' }}> 
                        <Typography variant='subtitle2' sx={{ mb: 4, textTransform: 'uppercase', color: 'text.disabled', fontWeight: 700, letterSpacing: '0.5px' }}> 
                            {t('reviews.smart.detail.replyHistory')}
                        </Typography> 
                        <Timeline sx={{ 
                            p: 0, 
                            m: 0, 
                            [`& .MuiTimelineItem-root:before`]: { display: 'none' } 
                        }}> 
                            {currentReview.replies.map((historyReply: any, index: number) => ( 
                            <TimelineItem key={historyReply.id} sx={{ minHeight: 60 }}> 
                                <TimelineSeparator> 
                                <TimelineDot 
                                    color={historyReply.status === 'posted' ? 'success' : historyReply.status === 'failed' ? 'error' : 'primary'} 
                                    variant="tonal" 
                                    sx={{ boxShadow: 'none', mt: 1 }} 
                                > 
                                    <i className={historyReply.status === 'posted' ? 'tabler-check' : historyReply.status === 'failed' ? 'tabler-x' : 'tabler-history'} style={{ fontSize: '0.8rem' }} /> 
                                </TimelineDot> 
                                {index !== currentReview.replies.length - 1 && <TimelineConnector />} 
                                </TimelineSeparator> 
                                <TimelineContent sx={{ pr: 0, pt: 0, pb: 6 }}> 
                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}> 
                                    <Box> 
                                    <Typography variant='body2' fontWeight={700}> 
                                        {historyReply.authorType === 'auto' ? t('reviews.smart.detail.aiAutoReply') : (historyReply.user?.name || t('reviews.smart.detail.teamMember'))}
                                    </Typography> 
                                    <Typography variant='caption' color='text.disabled'> 
                                        {isMounted ? format.dateTime(new Date(historyReply.createdAt), {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : ''} 
                                    </Typography> 
                                    </Box> 
                                    <Stack direction="row" spacing={2} alignItems="center"> 
                                    {historyReply.status === 'posted' && ( 
                                        <CustomChip 
                                        label={t('reviews.smart.detail.live')}
                                        size='small' 
                                        variant='tonal' 
                                        color='success' 
                                        icon={<i className='tabler-brand-google' style={{ fontSize: '0.8rem' }} />} 
                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} 
                                        /> 
                                    )} 
                                    <CustomChip 
                                        label={historyReply.sourceType} 
                                        size='small' 
                                        variant='outlined' 
                                        color='secondary' 
                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }} 
                                    /> 
                                    </Stack> 
                                </Box> 
                                <Box sx={{ 
                                    p: 3, 
                                    bgcolor: 'background.paper', 
                                    borderRadius: 2, 
                                    border: theme => `1px solid ${theme.palette.divider}`, 
                                }}> 
                                    <Typography variant='body2' sx={{ color: 'text.primary', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}> 
                                    {historyReply.content} 
                                    </Typography> 
                                </Box> 
                                </TimelineContent> 
                            </TimelineItem> 
                            ))} 
                        </Timeline> 
                        </Box> 
                        <Divider /> 
                    </> 
                    )}
                </CardContent>
            </Card>
        </Grid>

        {/* AI Suggestions Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ 
                bgcolor: (theme) => theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.primary.main, 0.08), 
                border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative element */}
                <Box sx={{ 
                    position: 'absolute', 
                    top: -40, 
                    right: -40, 
                    width: 150, 
                    height: 150, 
                    borderRadius: '50%', 
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                    zIndex: 0
                }} />

                <CardContent sx={{ position: 'relative', zIndex: 1, p: 5 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                        <Avatar 
                        sx={{ 
                            bgcolor: 'primary.main', 
                            width: 32, 
                            height: 32,
                            boxShadow: theme => `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                        }}
                        >
                        <i className='tabler-robot' style={{ fontSize: '1.1rem', color: 'white' }} />
                        </Avatar>
                        <Typography variant='h6' color='primary' sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                            {t('reviews.smart.detail.aiSuggestions')}
                        </Typography>
                    </Stack>
                    
                    <Box sx={{ mb: 5 }}>
                        <Typography variant='caption' color='text.disabled' sx={{ textTransform: 'uppercase', fontWeight: 700, mb: 1, display: 'block' }}>
                            {t('reviews.smart.detail.aiAnalysis')}
                        </Typography>
                        <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                            {currentReview.aiSuggestions?.analysis || t('reviews.smart.detail.noAnalysis')}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4, borderColor: alpha(theme.palette.primary.main, 0.1) }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant='subtitle2' fontWeight={700}>{t('reviews.smart.detail.suggestedReplies')}</Typography>
                        <CustomTextField
                        id="tone-preset-select"
                        select
                        size='small'
                        value={tonePreset}
                        onChange={(e) => setTonePreset(e.target.value)}
                        sx={{ minWidth: 140 }}
                        SelectProps={{
                            sx: { borderRadius: 2, bgcolor: 'background.paper' }
                        }}
                        >
                        {tonePresets.map((preset: { value: string; label: string }) => (
                            <MenuItem key={preset.value} value={preset.value}>
                            {preset.label}
                            </MenuItem>
                        ))}
                        </CustomTextField>
                    </Box>

                    {variations.length > 0 ? (
                        <Stack spacing={3}>
                        {variations.map((variation, index) => (
                            <Box 
                            key={index}
                            onClick={() => handleUseVariation(index)}
                            sx={{ 
                                p: 3, 
                                bgcolor: activeVariationIndex === index ? 'background.paper' : alpha(theme.palette.background.paper, 0.5), 
                                border: '1px solid', 
                                borderColor: activeVariationIndex === index ? 'primary.main' : 'divider', 
                                borderRadius: 2,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: activeVariationIndex === index ? theme => theme.shadows[2] : 'none',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-2px)',
                                    boxShadow: theme => theme.shadows[1]
                                }
                            }}
                            >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <CustomChip 
                                label={tonePreset} 
                                size='small' 
                                variant='tonal' 
                                color='primary' 
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, borderRadius: 1 }} 
                                />
                                {activeVariationIndex === index && (
                                <Avatar sx={{ bgcolor: 'primary.main', width: 20, height: 20 }}>
                                    <i className='tabler-check' style={{ fontSize: '0.8rem', color: 'white' }} />
                                </Avatar>
                                )}
                            </Box>
                            <Typography variant='body2' sx={{ fontStyle: 'italic', color: 'text.primary', lineHeight: 1.5, fontSize: '0.9rem' }}>
                                &quot;{variation}&quot;
                            </Typography>
                            </Box>
                        ))}
                        </Stack>
                    ) : (
                        <Box sx={{ 
                        p: 4, 
                        bgcolor: 'background.paper', 
                        border: '1px dashed', 
                        borderColor: 'divider', 
                        borderRadius: 2, 
                        mb: 3,
                        textAlign: 'center'
                        }}>
                        <Typography variant='body2' sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            {t('reviews.smart.detail.defaultReply', { author: currentReview.author, rating: currentReview.rating })}
                        </Typography>
                        </Box>
                    )}

                    <Stack direction="row" spacing={2} sx={{ mt: 5 }}>
                        <Button
                            fullWidth
                            variant='tonal'
                            size='medium'
                            startIcon={isRegenerating ? <i className='tabler-loader spin' /> : <i className='tabler-refresh' />}
                            onClick={handleRegenerateAI}
                            disabled={isRegenerating}
                            sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                            {variations.length > 0 ? t('reviews.smart.detail.regenerate') : t('reviews.smart.detail.generateAI')}
                        </Button>
                        <Button
                            fullWidth
                            variant='contained'
                            size='medium'
                            startIcon={<i className='tabler-copy' />}
                            onClick={() => {
                                if (variations[activeVariationIndex]) {
                                    setReply(variations[activeVariationIndex])
                                } else {
                                    setReply(t('reviews.smart.detail.defaultReply', { author: currentReview.author, rating: currentReview.rating }))
                                }
                            }}
                            sx={{ borderRadius: 2, fontWeight: 600, boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}` }}
                        >
                            {t('reviews.smart.detail.useThis')}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Grid>
    </Grid>
  )
}

export default ReviewDetailPage
