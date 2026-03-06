/* eslint-disable import/no-unresolved */
'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Stack from '@mui/material/Stack'

import CustomTextField from '@core/components/mui/TextField'

import { createBusinessOnboarding } from '@/app/actions/onboarding'

type OnboardingProps = {
  modalOnly?: boolean
}

const Onboarding = ({ modalOnly = false }: OnboardingProps) => {
  const router = useRouter()
  const [state, dispatch, isPending] = useActionState(createBusinessOnboarding, null)

  const labels = {
    title: 'Create Your Business',
    modalContent: 'Complete setup to access your workspace.',
    mainContent: 'Your email is verified. Create your business workspace to continue.',
    businessNameLabel: 'Business Name',
    businessNamePlaceholder: 'Acme Marketing LLC',
    creating: 'Creating...',
    createBusiness: 'Create Business'
  }

  useEffect(() => {
    if (state?.success) {
      router.replace('/admin')
      router.refresh()
    }
  }, [state, router])

  const content = (
    <form action={dispatch}>
      <Stack spacing={3} sx={{ mt: 1 }}>
        <CustomTextField
          fullWidth
          name='businessName'
          label={labels.businessNameLabel}
          placeholder={labels.businessNamePlaceholder}
          error={!!state?.errors?.businessName}
          helperText={state?.errors?.businessName?.[0]}
        />

        {state?.success === false && state?.message ? (
          <Typography color='error.main' variant='body2'>
            {state.message}
          </Typography>
        ) : null}

        <DialogActions sx={{ px: 0 }}>
          <Button type='submit' variant='contained' disabled={isPending}>
            {isPending ? labels.creating : labels.createBusiness}
          </Button>
        </DialogActions>
      </Stack>
    </form>
  )

  if (modalOnly) {
    return (
      <Dialog open fullWidth maxWidth='sm' disableEscapeKeyDown>
        <DialogTitle sx={{ pb: 1 }}>{labels.title}</DialogTitle>
        <DialogContent>
          <Typography color='text.secondary' sx={{ mb: 1 }}>
            {labels.modalContent}
          </Typography>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open fullWidth maxWidth='sm' disableEscapeKeyDown>
      <DialogTitle sx={{ pb: 1 }}>{labels.title}</DialogTitle>
      <DialogContent>
        <Typography color='text.secondary' sx={{ mb: 1 }}>
          {labels.mainContent}
        </Typography>
        {content}
      </DialogContent>
    </Dialog>
  )
}

export default Onboarding
