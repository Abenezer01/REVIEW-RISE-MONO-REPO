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
import { useTheme } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'

import { toast } from 'react-toastify'

import CustomChip from '@core/components/mui/Chip'
import CustomTextField from '@core/components/mui/TextField'

import { updateReviewReply, regenerateAISuggestion } from '@/app/actions/review'
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
  const theme = useTheme()
  const [reply, setReply] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [currentReview, setCurrentReview] = useState<any>(null)
  const [tonePreset, setTonePreset] = useState('Professional')
  const [tonePresets, setTonePresets] = useState(DEFAULT_TONE_PRESETS)
  const [variations, setVariations] = useState<string[]>([])
  const [activeVariationIndex, setActiveVariationIndex] = useState(0)

  useEffect(() => {
    if (review) {
      setCurrentReview(review)
      setReply(review.response || '')
      
      // Load variations from aiSuggestions if available
      if (review.aiSuggestions?.variations) {
        setVariations(review.aiSuggestions.variations)
      } else if (review.aiSuggestions?.suggestedReply) {
        setVariations([review.aiSuggestions.suggestedReply])
      } else {
        setVariations([])
      }

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

  const sentimentColorMap: Record<string, any> = {
    Positive: 'success',
    Neutral: 'warning',
    Negative: 'error'
  }

  const sentiment = currentReview.sentiment || (currentReview.rating >= 4 ? 'Positive' : currentReview.rating <= 2 ? 'Negative' : 'Neutral')

  const handleSaveReply = async () => {
    if (!reply.trim()) {
      toast.error('Please enter a reply')

      return
    }

    setIsSubmitting(true)

    const res = await updateReviewReply(currentReview.id, reply)

    setIsSubmitting(false)

    if (res.success) {
      toast.success('Reply saved successfully')
      if (onSuccess) onSuccess(res.data)
    } else {
      toast.error(res.error || 'Failed to save reply')
    }
  }

  const handleUseVariation = (index: number) => {
    setActiveVariationIndex(index)
    setReply(variations[index])
  }

  const handleRegenerateAI = async () => {
    setIsRegenerating(true)

    const res = await regenerateAISuggestion(currentReview.id, { tonePreset })

    setIsRegenerating(false)

    if (res.success && res.data) {
      toast.success('AI suggestions regenerated')
      
      const updatedReview = res.data as any
      
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
      toast.error(res.error || 'Failed to regenerate suggestions')
    }
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 500 } } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 4 }}>
        <Typography variant='h6'>Review Details</Typography>
        <IconButton size='small' onClick={onClose}>
          <i className='tabler-x' />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
        {/* Header: Author & Rating */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant='h5' sx={{ mb: 1 }}>{currentReview.author}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating value={currentReview.rating} readOnly />
                <Typography variant='body2' color='text.secondary'>
                  ({currentReview.rating}.0)
                </Typography>
              </Box>
            </Box>
            <CustomChip
              round='true'
              size='small'
              variant='tonal'
              color={sentimentColorMap[sentiment] || 'secondary'}
              label={sentiment}
            />
          </Box>
          <Typography variant='caption' color='text.secondary'>
            Published on {new Date(currentReview.publishedAt).toLocaleString()}
          </Typography>
        </Box>

        <Divider />

        {/* Content */}
        <Box>
          <Typography variant='subtitle2' sx={{ mb: 2, textTransform: 'uppercase', color: 'text.disabled' }}>
            Review Text
          </Typography>
          <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
            {currentReview.content || 'No content provided.'}
          </Typography>
        </Box>

        {/* Metadata: Source & Tags */}
        <Box sx={{ display: 'flex', gap: 6 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle2' sx={{ mb: 1, textTransform: 'uppercase', color: 'text.disabled' }}>
              Source
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <i className={currentReview.platform === 'gbp' ? 'tabler-brand-google' : 'tabler-world'} />
              <Typography variant='body2' sx={{ textTransform: 'uppercase' }}>
                {currentReview.platform}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle2' sx={{ mb: 1, textTransform: 'uppercase', color: 'text.disabled' }}>
              Internal Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {currentReview.tags && currentReview.tags.length > 0 ? (
                currentReview.tags.map((tag: string) => (
                  <Chip key={tag} label={tag} size='small' variant='outlined' />
                ))
              ) : (
                <Typography variant='caption' color='text.secondary'>No tags</Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* AI Suggestions (Placeholders) */}
        <Box sx={{ p: 4, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <i className='tabler-robot' style={{ color: theme.palette.primary.main }} />
            <Typography variant='subtitle1' color='primary' sx={{ fontWeight: 600 }}>
              AI Smart Suggestions
            </Typography>
          </Box>
          
          <Typography variant='subtitle2' sx={{ mb: 1 }}>Analysis</Typography>
          <Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
            {currentReview.aiSuggestions?.analysis || 'AI analysis is being generated... This review shows ' + sentiment.toLowerCase() + ' sentiment regarding the service quality.'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant='subtitle2'>Suggested Replies</Typography>
            <CustomTextField
              select
              size='small'
              value={tonePreset}
              onChange={(e) => setTonePreset(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              {tonePresets.map((preset: { value: string; label: string }) => (
                <MenuItem key={preset.value} value={preset.value}>
                  {preset.label}
                </MenuItem>
              ))}
            </CustomTextField>
          </Box>

          {variations.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {variations.map((variation, index) => (
                <Box 
                  key={index}
                  onClick={() => handleUseVariation(index)}
                  sx={{ 
                    p: 3, 
                    bgcolor: activeVariationIndex === index ? (theme) => `rgba(${theme.palette.primary.mainChannel} / 0.08)` : 'background.paper', 
                    color: 'text.primary',
                    border: '1px solid', 
                    borderColor: activeVariationIndex === index ? 'primary.main' : 'divider', 
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: activeVariationIndex === index ? (theme) => `rgba(${theme.palette.primary.mainChannel} / 0.12)` : 'action.hover'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip label={tonePreset} size='small' variant='tonal' color='primary' sx={{ height: 20, fontSize: '0.65rem' }} />
                    {activeVariationIndex === index && (
                      <i className='tabler-check text-primary' style={{ fontSize: '1rem' }} />
                    )}
                  </Box>
                  <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
                    {variation}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ p: 3, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', borderRadius: 1, mb: 3 }}>
              <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
                {'Dear ' + currentReview.author + ', thank you so much for your ' + currentReview.rating + '-star review! We appreciate your feedback and hope to see you again soon.'}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant='tonal'
              size='small'
              startIcon={isRegenerating ? <i className='tabler-loader spin' /> : <i className='tabler-refresh' />}
              onClick={handleRegenerateAI}
              disabled={isRegenerating}
            >
              {variations.length > 0 ? 'Regenerate' : 'Generate AI Replies'}
            </Button>
            <Button
              fullWidth
              variant='contained'
              size='small'
              startIcon={<i className='tabler-copy' />}
              onClick={() => {
                if (variations[activeVariationIndex]) {
                  setReply(variations[activeVariationIndex])
                } else {
                  setReply(`Dear ${currentReview.author}, thank you so much for your ${currentReview.rating}-star review! We appreciate your feedback and hope to see you again soon.`)
                }
              }}
            >
              Use Suggestion
            </Button>
          </Box>
        </Box>

        <Divider />

        {/* Reply Editor */}
        <Box>
          <Typography variant='subtitle2' sx={{ mb: 2, textTransform: 'uppercase', color: 'text.disabled' }}>
            Your Reply
          </Typography>
          <CustomTextField
            fullWidth
            multiline
            rows={4}
            placeholder='Write your reply here...'
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            sx={{ mb: 4 }}
          />
          <Button
            fullWidth
            variant='contained'
            onClick={handleSaveReply}
            disabled={isSubmitting}
            startIcon={isSubmitting && <i className='tabler-loader spin' />}
          >
            {currentReview.response ? 'Update Reply' : 'Post Reply'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default ReviewDetailDrawer
