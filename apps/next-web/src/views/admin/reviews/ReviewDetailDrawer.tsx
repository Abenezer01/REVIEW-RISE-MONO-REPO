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
import { toast } from 'react-toastify'

import CustomChip from '@core/components/mui/Chip'
import CustomTextField from '@core/components/mui/TextField'
import { updateReviewReply } from '@/app/actions/review'
import SentimentBadge from '@/components/shared/reviews/SentimentBadge'
import EmotionChips from '@/components/shared/reviews/EmotionChips'

interface ReviewDetailDrawerProps {
  open: boolean
  onClose: () => void
  review: any
  onSuccess?: (updatedReview?: any) => void
}

const ReviewDetailDrawer = ({ open, onClose, review, onSuccess }: ReviewDetailDrawerProps) => {
  const theme = useTheme()
  const [reply, setReply] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [currentReview, setCurrentReview] = useState<any>(null)

  useEffect(() => {
    if (review) {
      setCurrentReview(review)
      setReply(review.response || '')
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

  const handleUseAI = () => {
    const aiReply = currentReview.aiSuggestions?.suggestedReply || 
      `Dear ${currentReview.author}, thank you so much for your ${currentReview.rating}-star review! We appreciate your feedback and hope to see you again soon.`

    setReply(aiReply)
  }

  const handleAnalyzeReview = async () => {
    setIsRegenerating(true)

    // Dynamically import to avoid server/client issues
    const { analyzeSingleReview } = await import('@/app/actions/review')
    const res = await analyzeSingleReview(currentReview.id)

    setIsRegenerating(false)

    if (res.success) {
      toast.success('Review analysis completed')
      setCurrentReview(res.data)
      if (onSuccess) onSuccess(res.data)
    } else {
      toast.error(res.error || 'Failed to analyze review')
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
            <SentimentBadge 
              sentiment={sentiment?.toLowerCase() as any}
              size='medium'
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
          <Box sx={{ mb: 4 }}>
             {currentReview.aiSuggestions?.reasoning ? (
               <>
                 <Typography variant='body2' sx={{ mb: 1, color: 'text.primary' }}>
                   {currentReview.aiSuggestions.reasoning}
                 </Typography>
                 <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {currentReview.aiSuggestions.confidence && (
                      <CustomChip 
                         label={`Confidence: ${currentReview.aiSuggestions.confidence}%`}
                         size='small'
                         color={currentReview.aiSuggestions.confidence > 80 ? 'success' : 'warning'}
                         variant='tonal'
                      />
                    )}
                    {currentReview.aiSuggestions?.primaryEmotion && (
                      <Typography variant='caption' color='text.secondary'>
                        Primary Emotion: <strong>{currentReview.aiSuggestions.primaryEmotion}</strong>
                      </Typography>
                    )}
                 </Box>
               </>
             ) : (
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    This review has not yet been analyzed by AI.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={handleAnalyzeReview}
                    disabled={isRegenerating}
                    startIcon={isRegenerating ? <i className='tabler-loader' /> : <i className='tabler-wand' />}
                    sx={{ width: 'fit-content' }}
                  >
                    {isRegenerating ? 'Analyzing...' : 'Analyze Sentiment'}
                  </Button>
               </Box>
             )}
          </Box>

          <Typography variant='subtitle2' sx={{ mb: 1 }}>Suggested Reply</Typography>
          <Box sx={{ p: 3, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', borderRadius: 1, mb: 3 }}>
            <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
              {currentReview.aiSuggestions?.suggestedReply || 'Dear ' + currentReview.author + ', thank you so much for your ' + currentReview.rating + '-star review! We appreciate your feedback and hope to see you again soon.'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant='contained' size='small' startIcon={<i className='tabler-copy' />} onClick={handleUseAI}>
              Use Suggestion
            </Button>
            <Button 
              variant='outlined' 
              size='small' 
              disabled={isRegenerating}
              startIcon={isRegenerating ? <i className='tabler-loader' /> : (currentReview.aiSuggestions?.reasoning ? <i className='tabler-refresh' /> : <i className='tabler-wand' />)} 
              onClick={handleRegenerateAI}
            >
              {currentReview.aiSuggestions?.reasoning ? 'Regenerate' : 'Analyze with AI'}
            </Button>
          </Box>
        </Box>

        <Divider />

        {/* Reply Section */}
        <Box>
          <Typography variant='subtitle2' sx={{ mb: 2, textTransform: 'uppercase', color: 'text.disabled' }}>
            {currentReview.response ? 'Reply History' : 'Write a Reply'}
          </Typography>
          
          {currentReview.response && (
             <Box sx={{ pl: 4, borderLeft: '2px solid', borderColor: 'divider', mb: 4 }}>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                  Last response on {new Date(currentReview.respondedAt).toLocaleDateString()}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {currentReview.response}
                </Typography>
             </Box>
          )}

          <CustomTextField
            fullWidth
            multiline
            rows={4}
            placeholder="Type your response here..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            sx={{ mb: 4 }}
          />

          <Button 
            variant='contained' 
            fullWidth 
            disabled={isSubmitting}
            onClick={handleSaveReply}
            startIcon={isSubmitting ? <i className='tabler-loader' /> : <i className='tabler-send' />}
          >
            {review.response ? 'Update Reply' : 'Save & Send Reply'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default ReviewDetailDrawer
