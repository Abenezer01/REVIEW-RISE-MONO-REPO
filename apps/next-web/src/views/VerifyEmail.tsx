/* eslint-disable import/no-unresolved */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslations } from 'next-intl'

import Link from '@components/Link'
import CustomTextField from '@core/components/mui/TextField'
import Logo from '@components/layout/shared/Logo'

type VerifyStatus = 'idle' | 'verifying' | 'verified' | 'error'

const VerifyEmail = () => {
  const theme = useTheme()
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const initialEmail = searchParams.get('email') || ''

  const [status, setStatus] = useState<VerifyStatus>(token ? 'verifying' : 'idle')
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState(initialEmail)
  const [resending, setResending] = useState(false)
  const [resentMessage, setResentMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false

    const verify = async () => {
      setStatus('verifying')
      setError(null)

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const body = await response.json()

        if (!response.ok || body?.success === false) {
          throw new Error(body?.message || 'Verification failed')
        }

        if (!cancelled) {
          setStatus('verified')
        }
      } catch (err: any) {
        if (!cancelled) {
          setStatus('error')
          setError(err?.message || 'Verification failed')
        }
      }
    }

    verify()

    return () => {
      cancelled = true
    }
  }, [token])

  const canResend = useMemo(() => /\S+@\S+\.\S+/.test(email), [email])

  const statusConfig = {
    verified: {
      label: t('verifyEmail.verifiedTitle'),
      color: 'success' as const,
      icon: 'tabler-circle-check-filled',
      title: t('verifyEmail.verifiedTitle'),
      description: t('verifyEmail.verifiedDescription'),
      buttonLabel: t('verifyEmail.verifiedButtonLabel')
    },
    verifying: {
      label: t('verifyEmail.verifyingTitle'),
      color: 'primary' as const,
      icon: 'tabler-loader-2 animate-spin',
      title: t('verifyEmail.verifyingTitle'),
      description: t('verifyEmail.verifyingDescription')
    },
    error: {
      label: t('verifyEmail.errorTitle'),
      color: 'error' as const,
      icon: 'tabler-circle-x-filled',
      title: t('verifyEmail.errorTitle'),
      description: t('verifyEmail.errorDescription'),
      buttonLabel: t('verifyEmail.buttonLabel'),
      resendingLabel: t('verifyEmail.resendingLabel')
    },
    idle: {
      label: t('verifyEmail.title'),
      color: 'warning' as const,
      icon: 'tabler-mail-fast',
      title: t('verifyEmail.title'),
      description: t('verifyEmail.description'),
      buttonLabel: t('verifyEmail.buttonLabel'),
      resendingLabel: t('verifyEmail.resendingLabel')
    },
    dividerLabel: t('verifyEmail.dividerLabel'),
    alreadyVerifiedLabel: t('verifyEmail.alreadyVerified'),
    backToLoginLabel: t('verifyEmail.backToLogin')
  } as const

  const currentConfig = statusConfig[status]

  const handleResend = async () => {
    if (!canResend) return
    setResending(true)
    setError(null)
    setResentMessage(null)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const body = await response.json()

      if (!response.ok || body?.success === false) {
        throw new Error(body?.message || 'Failed to resend verification email')
      }

      setResentMessage(t('verifyEmail.resentMessage'))
    } catch (err: any) {
      setError(err?.message || t('verifyEmail.resendError'))
    } finally {
      setResending(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 4, md: 6 },
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 40%),
                     radial-gradient(circle at 100% 100%, ${alpha(theme.palette.info.main, 0.08)} 0%, transparent 40%),
                     ${theme.palette.background.default}`
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 480,
          position: 'relative',
          zIndex: 1,
          borderRadius: 6,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 32px 64px -12px ${alpha(theme.palette.common.black, 0.12)}`,
          backdropFilter: 'blur(20px)'
        }}
      >
        <CardContent sx={{ p: { xs: 6, sm: 8 }, textAlign: 'center' }}>
          <Box sx={{ mb: 8, display: 'flex', justifyContent: 'center' }}>
            <Logo />
          </Box>

          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              backgroundColor: alpha(theme.palette[currentConfig.color].main, 0.1),
              color: theme.palette[currentConfig.color].main
            }}
          >
            {status === 'verifying' ? (
              <CircularProgress size={32} color='primary' thickness={4} />
            ) : (
              <i className={`${currentConfig.icon} text-[32px]`} />
            )}
          </Box>

          <Typography variant='h4' sx={{ mb: 2, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {currentConfig.title}
          </Typography>

          <Typography color='text.secondary' sx={{ mb: 6, px: 2, lineHeight: 1.6 }}>
            {currentConfig.description}
          </Typography>

          {status === 'verified' ? (
            <Stack spacing={4}>
              <Button
                fullWidth
                size='large'
                variant='contained'
                onClick={() => router.push('/login')}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: `0 10px 20px -6px ${alpha(theme.palette.primary.main, 0.4)}`
                }}
              >
                {statusConfig.verified.buttonLabel}
              </Button>
            </Stack>
          ) : (
            <Stack spacing={4}>
              <Box sx={{ textAlign: 'left' }}>
                <CustomTextField
                  fullWidth
                  label={t('verifyEmail.emailLabel')}
                  placeholder={t('verifyEmail.emailPlaceholder')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={status === 'verifying' || resending}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.background.default, 0.5)
                    }
                  }}
                />
              </Box>

              <Button
                fullWidth
                size='large'
                variant='contained'
                onClick={handleResend}
                disabled={!canResend || resending || status === 'verifying'}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: resending ? 'none' : `0 10px 20px -6px ${alpha(theme.palette.primary.main, 0.4)}`
                }}
              >
                {resending ? statusConfig.idle.resendingLabel : statusConfig.idle.buttonLabel}
              </Button>
            </Stack>
          )}

          {resentMessage && (
            <Alert
              severity='success'
              variant='filled'
              sx={{ mt: 6, borderRadius: 3, textAlign: 'left' }}
              icon={<i className='tabler-mail-check' />}
            >
              {resentMessage}
            </Alert>
          )}

          {error && (
            <Alert
              severity='error'
              variant='filled'
              sx={{ mt: 6, borderRadius: 3, textAlign: 'left' }}
              icon={<i className='tabler-alert-circle' />}
            >
              {error}
            </Alert>
          )}

          <Divider sx={{ my: 8 }}>
            <Typography variant='caption' color='text.disabled' sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {statusConfig.dividerLabel}
            </Typography>
          </Divider>

          <Typography variant='body2' color='text.secondary'>
            {statusConfig.alreadyVerifiedLabel}{' '}
            <Link
              href='/login'
              className='font-semibold text-primary hover:underline'
            >
              {statusConfig.backToLoginLabel}
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default VerifyEmail
