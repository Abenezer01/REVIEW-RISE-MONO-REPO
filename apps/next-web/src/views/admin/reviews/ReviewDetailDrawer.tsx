/* eslint-disable import/no-unresolved */
'use client'

import { useState, useEffect } from 'react'

import Drawer from '@mui/material/Drawer'
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

import { useSystemMessages } from '@platform/shared-ui'
import { SystemMessageCode } from '@platform/contracts'

import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'

import CustomChip from '@core/components/mui/Chip'
import CustomTextField from '@core/components/mui/TextField'
import SentimentBadge from '@/components/shared/reviews/SentimentBadge'
import EmotionChips from '@/components/shared/reviews/EmotionChips'

import { updateReviewReply, regenerateAISuggestion, rejectReviewReply, getReviewWithHistory } from '@/app/actions/review'
import { getBrandProfileByBusinessId } from '@/app/actions/brand-profile'

interface ReviewDetailDrawerProps {
  open: boolean
  onClose: () => void
  review: any
  onSuccess?: (updatedReview?: any, shouldClose?: boolean) => void
}

const DEFAULT_TONE_PRESETS = [
  { value: 'Professional', label: 'Professional' },
  { value: 'Friendly', label: 'Friendly' },
  { value: 'Empathetic', label: 'Empathetic' },
  { value: 'Humorous', label: 'Humorous' },
  { value: 'Concise', label: 'Concise' }
]

const ReviewDetailDrawer = ({ open, onClose, review, onSuccess }: ReviewDetailDrawerProps) => {
  const { notify } = useSystemMessages()
  const theme = useTheme()
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

  useEffect(() => {
    if (review) {
      // Fetch full review with history
      getReviewWithHistory(review.id).then(res => {
        if (res.success && res.data) {
          const fetchedReview = res.data as any

          setCurrentReview(fetchedReview)
          setReply(fetchedReview.response || '')
          
          // Clear variations on load to ensure user must click "Generate"
          setVariations([])
        } else {
          setCurrentReview(review)
          setReply(review.response || '')
        }
      })
      
      // Fetch brand profile for tone descriptors
      if (review.businessId) {
        getBrandProfileByBusinessId(review.businessId).then(res => {
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
  }, [review])

  if (!currentReview) return null


  const sentiment = currentReview.sentiment || (currentReview.rating >= 4 ? 'Positive' : currentReview.rating <= 2 ? 'Negative' : 'Neutral')

  const handleSaveReply = async () => {
    if (!reply.trim()) {
      notify(SystemMessageCode.REVIEWS_REPLY_EMPTY)

      return
    }

    setIsSubmitting(true)

    const isAISuggestionUsed = variations.includes(reply)

    const res = await updateReviewReply(currentReview.id, reply, {
      sourceType: isAISuggestionUsed ? 'ai' : 'manual',
      authorType: 'user'
    })

    setIsSubmitting(false)

    if (res.success) {
      notify(SystemMessageCode.REVIEWS_REPLY_POSTED)
      
      if (res.data) {
        setCurrentReview(res.data as any)
      }
      
      if (onSuccess) onSuccess(res.data)
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
      if (onSuccess) onSuccess(res.data)
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
      if (onSuccess) onSuccess(analysisRes.data, false)
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
      
      if (onSuccess) onSuccess(updatedReview, false)
    } else {
      notify(SystemMessageCode.GENERIC_ERROR)
    }
  }

  // Handle Regenerate button also calling the same analysis
  const handleRegenerateAI = handleAnalyzeReview

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 550 } } }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        px: 5, 
        py: 4,
        bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'background.default',
        borderBottom: theme => `1px solid ${theme.palette.divider}`
      }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar 
            variant="rounded"
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              width: 38,
              height: 38,
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
            }}
          >
            <i className='tabler-message-2' style={{ fontSize: '1.25rem' }} />
          </Avatar>
          <Box>
            <Typography variant='h6' fontWeight={700}>Review Details</Typography>
            <Typography variant='caption' color='text.secondary'>View and manage customer feedback</Typography>
          </Box>
        </Stack>
        <IconButton 
          size='small' 
          onClick={onClose}
          sx={{ 
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            boxShadow: theme => theme.shadows[1],
            '&:hover': { bgcolor: 'background.paper', boxShadow: theme => theme.shadows[2] }
          }}
        >
          <i className='tabler-x' />
        </IconButton>
      </Box>

      <Box sx={{ p: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%' }}>
        {/* Header: Author & Rating */}
        <Box sx={{ p: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Stack direction="row" spacing={4} alignItems="center">
              <Avatar 
                sx={{ 
                  width: 50, 
                  height: 50, 
                  fontSize: '1.25rem',
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
                  <Rating value={currentReview.rating} readOnly size="small" />
                  <Typography variant='body2' fontWeight={600} color='text.primary'>
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
          
          <Stack direction="row" spacing={6} sx={{ mb: 0 }}>
            <Box>
              <Typography variant='caption' color='text.disabled' sx={{ textTransform: 'uppercase', fontWeight: 700, mb: 1, display: 'block' }}>
                Published Date
              </Typography>
              <Typography variant='body2' fontWeight={500}>
                {isMounted ? new Date(currentReview.publishedAt).toLocaleDateString('en-US', { 
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
                Source
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <i className={currentReview.platform === 'gbp' ? 'tabler-brand-google text-primary' : 'tabler-world text-primary'} style={{ fontSize: '1.1rem' }} />
                <Typography variant='body2' fontWeight={600} sx={{ textTransform: 'uppercase' }}>
                  {currentReview.platform === 'gbp' ? 'Google' : currentReview.platform}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* Content */}
        <Box sx={{ p: 6, bgcolor: (theme) => theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.02) : 'transparent' }}>
          <Typography variant='subtitle2' sx={{ mb: 3, textTransform: 'uppercase', color: 'text.disabled', fontWeight: 700, letterSpacing: '0.5px' }}>
            Review Content
          </Typography>
          <Box sx={{ 
            p: 4, 
            bgcolor: 'background.paper', 
            borderRadius: 2, 
            border: theme => `1px solid ${theme.palette.divider}`,
            boxShadow: theme => theme.shadows[0]
          }}>
            <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'text.primary' }}>
              {currentReview.content || 'No content provided.'}
            </Typography>
          </Box>
          
          {currentReview.tags && currentReview.tags.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant='caption' color='text.disabled' sx={{ textTransform: 'uppercase', fontWeight: 700, mb: 2, display: 'block' }}>
                Internal Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {currentReview.tags.map((tag: string) => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    size='small' 
                    variant='outlined' 
                    sx={{ borderRadius: 1, fontWeight: 500 }} 
                  />
                ))}
              </Box>
            </Box>
          )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle2' sx={{ mb: 1, textTransform: 'uppercase', color: 'text.disabled' }}>
              Extracted Emotions & Topics
            </Typography>
            {currentReview.tags && currentReview.tags.length > 0 ? (
              <EmotionChips emotions={currentReview.tags} maxDisplay={5} />
            ) : (
              <Typography variant='caption' color='text.secondary'>No analysis available</Typography>
            )}
            
            {currentReview.aiSuggestions?.topics && currentReview.aiSuggestions.topics.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block', mb: 0.5 }}>
                  Key Topics
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentReview.aiSuggestions.topics.map((topic: string) => (
                     <Chip key={topic} label={topic} size='small' variant='outlined' />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>



        {/* Reply History Timeline */}
        {currentReview.replies && currentReview.replies.length > 0 && (
          <>
            <Box sx={{ p: 6, bgcolor: theme => theme.palette.mode === 'light' ? alpha(theme.palette.secondary.main, 0.02) : 'transparent' }}>
              <Typography variant='subtitle2' sx={{ mb: 4, textTransform: 'uppercase', color: 'text.disabled', fontWeight: 700, letterSpacing: '0.5px' }}>
                Reply History
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
                            {historyReply.authorType === 'auto' ? 'AI Auto-Reply' : (historyReply.user?.name || 'Team Member')}
                          </Typography>
                          <Typography variant='caption' color='text.disabled'>
                            {isMounted ? new Date(historyReply.createdAt).toLocaleString('en-US', { 
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
                              label="Live" 
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

        {/* AI Suggestions */}
        <Box sx={{ p: 6 }}>
          <Box sx={{ 
            p: 5, 
            bgcolor: (theme) => theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.primary.main, 0.08), 
            borderRadius: 3,
            border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative element */}
            <Box sx={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
              zIndex: 0
            }} />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
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
                <Typography variant='subtitle1' color='primary' sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                  AI Smart Suggestions
                </Typography>
              </Stack>
              
              <Box sx={{ mb: 5 }}>
                <Typography variant='caption' color='text.disabled' sx={{ textTransform: 'uppercase', fontWeight: 700, mb: 1, display: 'block' }}>
                  AI Analysis
                </Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                  {currentReview.aiSuggestions?.analysis || 'AI analysis is being generated... This review shows ' + sentiment.toLowerCase() + ' sentiment regarding the service quality.'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant='subtitle2' fontWeight={700}>Suggested Replies</Typography>
                <CustomTextField
                  id="tone-preset-select"
                  select
                  size='small'
                  value={tonePreset}
                  onChange={(e) => setTonePreset(e.target.value)}
                  sx={{ minWidth: 150 }}
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
                        p: 4, 
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
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
                      <Typography variant='body2' sx={{ fontStyle: 'italic', color: 'text.primary', lineHeight: 1.5 }}>
                        &quot;{variation}&quot;
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ 
                  p: 8, 
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02), 
                  border: '1px dashed', 
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.2), 
                  borderRadius: 3, 
                  mb: 3,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), 
                      color: 'primary.main',
                      width: 48,
                      height: 48
                    }}
                  >
                    <i className='tabler-sparkles' style={{ fontSize: '1.5rem' }} />
                  </Avatar>
                  <Box>
                    <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1 }}>
                      No Suggestions Yet
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ maxWidth: 250, display: 'block' }}>
                      Click the &quot;Generate AI&quot; button below to get 3 personalized reply variations for this review.
                    </Typography>
                  </Box>
                </Box>
              )}

              <Stack direction="row" spacing={3} sx={{ mt: 5 }}>
                <Button
                  fullWidth
                  variant='tonal'
                  size='medium'
                  startIcon={isRegenerating ? <i className='tabler-loader spin' /> : <i className='tabler-refresh' />}
                  onClick={() => handleRegenerateAI()}
                  disabled={isRegenerating}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  {variations.length > 0 ? 'Regenerate' : 'Generate AI'}
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
                      setReply(`Dear ${currentReview.author}, thank you so much for your ${currentReview.rating}-star review! We appreciate your feedback and hope to see you again soon.`)
                    }
                  }}
                  disabled={variations.length === 0}
                  sx={{ borderRadius: 2, fontWeight: 600, boxShadow: theme => variations.length > 0 ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}` : 'none' }}
                >
                  Use This
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Reply Editor */}
        <Box sx={{ p: 6, mb: 4 }}>
          <Typography variant='subtitle2' sx={{ mb: 3, textTransform: 'uppercase', color: 'text.disabled', fontWeight: 700, letterSpacing: '0.5px' }}>
            Your Reply
          </Typography>
          <CustomTextField
            id="review-reply-editor"
            fullWidth
            multiline
            rows={5}
            placeholder='Write your reply here...'
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            sx={{ 
              mb: 5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'background.paper'
              }
            }}
          />
          <Stack direction="row" spacing={4}>
            <Button
              fullWidth
              variant='tonal'
              color='error'
              size="large"
              onClick={handleRejectReply}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <i className='tabler-loader spin' /> : <i className='tabler-trash' />}
              sx={{ borderRadius: 2.5, fontWeight: 700 }}
            >
              Reject
            </Button>
            <Button
              fullWidth
              variant='contained'
              size="large"
              onClick={handleSaveReply}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <i className='tabler-loader spin' /> : <i className='tabler-send' />}
              sx={{ 
                borderRadius: 2.5, 
                fontWeight: 700,
                boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
              }}
            >
              {currentReview.response ? 'Update Reply' : 'Post Reply'}
            </Button>
          </Stack>
        </Box>
    </Drawer>
  )
}

export default ReviewDetailDrawer
