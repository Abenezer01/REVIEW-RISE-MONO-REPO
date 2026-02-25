/* eslint-disable import/no-unresolved */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslations } from 'next-intl'

import { SERVICES_CONFIG } from '@/configs/services'
import { useLocationFilter } from '@/hooks/useLocationFilter'
import apiClient from '@/lib/apiClient'

type GbpBusinessProfile = {
  description: string | null
  category: string | null
  phone: string | null
  address?: {
    formatted?: string | null
  }
  hours?: {
    weekdayDescriptions?: string[]
  }
  lastSynced: string | null
}

const GBP_API_URL = SERVICES_CONFIG.gbp.url

const uiText = {
  subtitle: 'Sync and normalize your Google Business Profile core fields for the selected location.',
  noLocation: 'Select a location to load GBP profile data.',
  sectionTitle: 'Normalized GBP Profile',
  syncNow: 'Sync Profile',
  syncing: 'Syncing...',
  stateReady: 'Profile Ready',
  statePending: 'Awaiting Sync',
  labelCategory: 'Category',
  labelPhone: 'Phone',
  labelAddress: 'Address',
  labelDescription: 'Description',
  labelHours: 'Business Hours',
  labelLastSynced: 'Last synced',
  notAvailable: 'N/A',
  never: 'Never'
}

const AdminGBPRocketPage = () => {
  const t = useTranslations('dashboard')
  const { locationId } = useLocationFilter()
  const theme = useTheme()

  const [profile, setProfile] = useState<GbpBusinessProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const pageTitle = `${t('navigation.gbp-rocket')}™`
  const hasProfile = Boolean(profile?.category || profile?.phone || profile?.address?.formatted || profile?.description)

  const lastSyncedText = useMemo(() => {
    if (!profile?.lastSynced) return uiText.never

    return new Date(profile.lastSynced).toLocaleString()
  }, [profile?.lastSynced])

  const extractErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
      const apiMessage = (error.response?.data as any)?.message;

      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
      }
    }

    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return fallback;
  };

  const fetchProfile = useCallback(async () => {
    if (!locationId) {
      setProfile(null)
      setErrorMessage(null)

      return
    }

    try {
      setLoading(true)
      setErrorMessage(null)

      const response = await apiClient.get<GbpBusinessProfile>(
        `${GBP_API_URL}/locations/${locationId}/business-profile`,
        { headers: { 'x-skip-system-message': '1' } }
      )

      setProfile(response.data || null)
    } catch (error) {
      console.error('Failed to fetch GBP profile:', error)
      setProfile(null)
      setErrorMessage(extractErrorMessage(error, 'Failed to fetch GBP profile'))
    } finally {
      setLoading(false)
    }
  }, [locationId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSync = async () => {
    if (!locationId) return

    try {
      setSyncing(true)
      setErrorMessage(null)
      await apiClient.post(
        `${GBP_API_URL}/locations/${locationId}/business-profile/sync`,
        undefined,
        { headers: { 'x-skip-system-message': '1' } }
      )
      await fetchProfile()
    } catch (error) {
      console.error('Failed to sync GBP profile:', error)
      setErrorMessage(extractErrorMessage(error, 'Failed to sync GBP profile'))
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            background: `linear-gradient(140deg, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.info.main, 0.12)} 100%)`
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent='space-between'>
            <Box>
              <Typography variant='h3' className='mbe-2'>
                {pageTitle}
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                {uiText.subtitle}
              </Typography>
            </Box>
            <Stack direction='row' spacing={1}>
              <Chip color={hasProfile ? 'success' : 'default'} variant='tonal' label={hasProfile ? uiText.stateReady : uiText.statePending} />
              <Chip variant='tonal' label={`${uiText.labelLastSynced}: ${lastSyncedText}`} />
            </Stack>
          </Stack>
        </Box>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            {!locationId ? (
              <Alert severity='info'>{uiText.noLocation}</Alert>
            ) : (
              <Stack spacing={3}>
                {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant='h6'>{uiText.sectionTitle}</Typography>
                  <Button variant='contained' color='warning' onClick={handleSync} disabled={syncing}>
                    {syncing ? uiText.syncing : uiText.syncNow}
                  </Button>
                </Box>

                <Divider />

                {loading ? (
                  <Stack spacing={1}>
                    <Skeleton height={40} />
                    <Skeleton height={40} />
                    <Skeleton height={88} />
                    <Skeleton height={120} />
                  </Stack>
                ) : (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card variant='outlined'>
                        <CardContent>
                          <Typography variant='caption' color='text.secondary'>{uiText.labelCategory}</Typography>
                          <Typography variant='body1' fontWeight={600}>{profile?.category || uiText.notAvailable}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card variant='outlined'>
                        <CardContent>
                          <Typography variant='caption' color='text.secondary'>{uiText.labelPhone}</Typography>
                          <Typography variant='body1' fontWeight={600}>{profile?.phone || uiText.notAvailable}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Card variant='outlined'>
                        <CardContent>
                          <Typography variant='caption' color='text.secondary'>{uiText.labelAddress}</Typography>
                          <Typography variant='body2'>{profile?.address?.formatted || uiText.notAvailable}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Card variant='outlined'>
                        <CardContent>
                          <Typography variant='caption' color='text.secondary'>{uiText.labelDescription}</Typography>
                          <Typography variant='body2'>{profile?.description || uiText.notAvailable}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Card variant='outlined'>
                        <CardContent>
                          <Typography variant='caption' color='text.secondary'>{uiText.labelHours}</Typography>
                          <Stack spacing={0.5} sx={{ mt: 1 }}>
                            {(profile?.hours?.weekdayDescriptions || []).length > 0 ? (
                              (profile?.hours?.weekdayDescriptions || []).map((line, index) => (
                                <Typography key={`${line}-${index}`} variant='body2'>{line}</Typography>
                              ))
                            ) : (
                              <Typography variant='body2'>{uiText.notAvailable}</Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AdminGBPRocketPage
