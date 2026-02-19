'use client'

import React, { useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import { useTranslations } from 'next-intl'

import { useAddCompetitor } from '@/hooks/reviews/useReviewAnalytics'

interface AddCompetitorDialogProps {
  open: boolean
  onClose: () => void
  businessId: string
  locationId?: string
}

const AddCompetitorDialog = ({ open, onClose, businessId, locationId }: AddCompetitorDialogProps) => {
  const t = useTranslations('dashboard.brandRise.competitors')
  const tc = useTranslations('common')
  const [competitorName, setCompetitorName] = useState('')
  const [averageRating, setAverageRating] = useState('4.0')
  const [totalReviews, setTotalReviews] = useState('0')
  
  const { mutate: addCompetitor, isPending } = useAddCompetitor()
  
  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault()
     if (!competitorName) return
     
     addCompetitor({
         businessId,
         locationId: locationId === 'all' ? undefined : locationId,
         competitorName,
         averageRating: parseFloat(averageRating),
         totalReviews: parseInt(totalReviews, 10),
         source: 'Manual'
     }, {
         onSuccess: () => {
             setCompetitorName('')
             setAverageRating('4.0')
             setTotalReviews('0')
             onClose()
         }
     })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t('addTitle')}</DialogTitle>
        <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={12}>
                    <TextField
                        autoFocus
                        label={t('nameLabel')}
                        fullWidth
                        required
                        value={competitorName}
                        onChange={(e) => setCompetitorName(e.target.value)}
                    />
                </Grid>
                <Grid size={6}>
                    <TextField
                        label={t('ratingLabel')}
                        type="number"
                        fullWidth
                        required
                        inputProps={{ min: 0, max: 5, step: 0.1 }}
                        value={averageRating}
                        onChange={(e) => setAverageRating(e.target.value)}
                    />
                </Grid>
                <Grid size={6}>
                    <TextField
                        label={t('totalReviewsLabel')}
                        type="number"
                        fullWidth
                        required
                        inputProps={{ min: 0 }}
                        value={totalReviews}
                        onChange={(e) => setTotalReviews(e.target.value)}
                    />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="inherit">{tc('common.cancel')}</Button>
            <Button 
                type="submit" 
                variant="contained" 
                disabled={isPending || !competitorName}
                startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : null}
            >
                {isPending ? t('adding') : t('addTitle')}
            </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddCompetitorDialog
