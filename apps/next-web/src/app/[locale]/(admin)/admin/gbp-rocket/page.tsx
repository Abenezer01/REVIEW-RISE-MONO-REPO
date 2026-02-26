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
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
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

type GbpSnapshotItem = {
  id: string
  captureType: string
  capturedAt: string
  changedFields: string[]
}

type GbpSnapshotDetail = GbpSnapshotItem & {
  snapshot: {
    fields?: Record<string, unknown>
  }
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
  snapshotTitle: 'Snapshot History',
  createSnapshot: 'Capture Snapshot',
  snapshotTypeSync: 'sync',
  snapshotTypeManual: 'manual',
  snapshotVersion: 'Snapshot',
  snapshotAt: 'Captured',
  snapshotFieldsChangedCount: 'fields changed',
  snapshotOpen: 'Open Snapshot',
  snapshotSelected: 'Selected',
  snapshotDetailTitle: 'Snapshot Detail',
  snapshotCaptureType: 'Capture type',
  snapshotFieldSummary: 'Field Summary',
  snapshotMetaTitle: 'Snapshot Info',
  snapshotChangedTitle: 'Changed Fields',
  snapshotRawJson: 'Raw Snapshot JSON',
  snapshotRawHint: 'Scrollable view for full payload',
  snapshotTabSummary: 'Overview & Fields',
  snapshotTabRaw: 'Raw JSON',
  tabProfile: 'Profile',
  tabSnapshots: 'Snapshots',
  refreshSnapshots: 'Refresh List',
  emptySnapshots: 'No snapshots yet.',
  snapshotSelectHint: 'Select a snapshot to view details.',
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
  const [snapshots, setSnapshots] = useState<GbpSnapshotItem[]>([])
  const [selectedSnapshot, setSelectedSnapshot] = useState<GbpSnapshotDetail | null>(null)
  const [loadingSnapshots, setLoadingSnapshots] = useState(false)
  const [capturingSnapshot, setCapturingSnapshot] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [snapshotDetailTab, setSnapshotDetailTab] = useState(0)

  const pageTitle = `${t('navigation.gbp-rocket')}™`
  const hasProfile = Boolean(profile?.category || profile?.phone || profile?.address?.formatted || profile?.description)

  const lastSyncedText = useMemo(() => {
    if (!profile?.lastSynced) return uiText.never

    return new Date(profile.lastSynced).toLocaleString()
  }, [profile?.lastSynced])

  const selectedSnapshotFields = useMemo(() => {
    return (selectedSnapshot?.snapshot?.fields || {}) as Record<string, unknown>
  }, [selectedSnapshot])

  const getCaptureTypeLabel = (captureType: string) => {
    return captureType === 'sync' ? uiText.snapshotTypeSync : uiText.snapshotTypeManual
  }

  const getSnapshotTitle = (position: number) => {
    return `${uiText.snapshotVersion} ${position}`
  }

  const getSnapshotCapturedText = (capturedAt: string) => {
    return `${uiText.snapshotAt}: ${new Date(capturedAt).toLocaleString()}`
  }

  const getSnapshotChangedCountText = (count: number) => {
    return `${count} ${uiText.snapshotFieldsChangedCount}`
  }

  const formatFieldLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
      .trim()
  }

  const formatFieldValue = (value: unknown) => {
    if (value === null || value === undefined) return uiText.notAvailable
    if (typeof value === 'string' && value.trim().length === 0) return uiText.notAvailable
    if (typeof value === 'string') return value

    return JSON.stringify(value, null, 2)
  }

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

  const loadSnapshotDetail = useCallback(async (snapshotId: string) => {
    if (!locationId) return null

    const response = await apiClient.get<GbpSnapshotDetail>(
      `${GBP_API_URL}/locations/${locationId}/business-profile/snapshots/${snapshotId}`,
      { headers: { 'x-skip-system-message': '1' } }
    )

    return response.data || null
  }, [locationId])

  const fetchSnapshots = useCallback(async () => {
    if (!locationId) {
      setSnapshots([])
      setSelectedSnapshot(null)

      return
    }

    try {
      setLoadingSnapshots(true)

      const response = await apiClient.get<{ items: GbpSnapshotItem[] }>(
        `${GBP_API_URL}/locations/${locationId}/business-profile/snapshots?limit=20&offset=0`,
        { headers: { 'x-skip-system-message': '1' } }
      )

      const items = response.data?.items || []

      setSnapshots(items)

      if (items[0]) {
        const latestDetail = await loadSnapshotDetail(items[0].id)

        setSelectedSnapshot(latestDetail)
      } else {
        setSelectedSnapshot(null)
      }
    } catch (error) {
      console.error('Failed to fetch GBP snapshots:', error)
      setSnapshots([])
      setSelectedSnapshot(null)
    } finally {
      setLoadingSnapshots(false)
    }
  }, [loadSnapshotDetail, locationId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    fetchSnapshots()
  }, [fetchSnapshots])

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
      await Promise.all([fetchProfile(), fetchSnapshots()])
    } catch (error) {
      console.error('Failed to sync GBP profile:', error)
      setErrorMessage(extractErrorMessage(error, 'Failed to sync GBP profile'))
    } finally {
      setSyncing(false)
    }
  }

  const handleCreateSnapshot = async () => {
    if (!locationId) return

    try {
      setCapturingSnapshot(true)
      await apiClient.post(
        `${GBP_API_URL}/locations/${locationId}/business-profile/snapshots`,
        {},
        { headers: { 'x-skip-system-message': '1' } }
      )
      await fetchSnapshots()
    } catch (error) {
      console.error('Failed to create GBP snapshot:', error)
      setErrorMessage(extractErrorMessage(error, 'Failed to create GBP snapshot'))
    } finally {
      setCapturingSnapshot(false)
    }
  }

  const handleOpenSnapshot = async (snapshotId: string) => {
    if (!locationId) return

    try {
      const snapshotDetail = await loadSnapshotDetail(snapshotId)

      setSelectedSnapshot(snapshotDetail)
      setSnapshotDetailTab(0)
    } catch (error) {
      console.error('Failed to fetch GBP snapshot detail:', error)
      setErrorMessage(extractErrorMessage(error, 'Failed to fetch GBP snapshot detail'))
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
                <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
                  <Tab label={uiText.tabProfile} />
                  <Tab label={uiText.tabSnapshots} />
                </Tabs>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant='h6'>{activeTab === 0 ? uiText.sectionTitle : uiText.snapshotTitle}</Typography>
                  {activeTab === 0 ? (
                    <Button variant='contained' color='warning' onClick={handleSync} disabled={syncing}>
                      {syncing ? uiText.syncing : uiText.syncNow}
                    </Button>
                  ) : (
                    <Stack direction='row' spacing={1}>
                      <Button variant='outlined' color='inherit' onClick={fetchSnapshots} disabled={loadingSnapshots}>
                        {uiText.refreshSnapshots}
                      </Button>
                      <Button variant='contained' color='secondary' onClick={handleCreateSnapshot} disabled={capturingSnapshot}>
                        {capturingSnapshot ? uiText.syncing : uiText.createSnapshot}
                      </Button>
                    </Stack>
                  )}
                </Box>

                <Divider />

                {activeTab === 0 ? (
                  loading ? (
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
                  )
                ) : loadingSnapshots ? (
                  <Skeleton height={88} />
                ) : (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Stack spacing={1}>
                        {snapshots.length > 0 ? (
                          snapshots.map((snapshot, index) => (
                            <Card
                              key={snapshot.id}
                              variant='outlined'
                              sx={{
                                borderColor: selectedSnapshot?.id === snapshot.id ? 'primary.main' : undefined,
                                bgcolor: selectedSnapshot?.id === snapshot.id ? alpha(theme.palette.primary.main, 0.08) : undefined
                              }}
                            >
                              <CardContent sx={{ py: 2 }}>
                                <Stack direction='row' justifyContent='space-between' alignItems='flex-start' spacing={1}>
                                  <Box>
                                    <Typography variant='body2' fontWeight={600}>
                                      {getSnapshotTitle(snapshots.length - index)}
                                    </Typography>
                                    <Typography variant='caption' color='text.secondary'>
                                      {getSnapshotCapturedText(snapshot.capturedAt)}
                                    </Typography>
                                  </Box>
                                  <Chip size='small' color={snapshot.captureType === 'sync' ? 'info' : 'secondary'} label={getCaptureTypeLabel(snapshot.captureType)} />
                                </Stack>
                                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                                  {getSnapshotChangedCountText(snapshot.changedFields?.length || 0)}
                                </Typography>
                                <Stack direction='row' spacing={1} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}>
                                  {(snapshot.changedFields || []).slice(0, 4).map((field) => (
                                    <Chip key={`${snapshot.id}-${field}`} size='small' variant='outlined' label={field} />
                                  ))}
                                </Stack>
                                <Button fullWidth size='small' sx={{ mt: 1.5 }} onClick={() => handleOpenSnapshot(snapshot.id)}>
                                  {selectedSnapshot?.id === snapshot.id ? uiText.snapshotSelected : uiText.snapshotOpen}
                                </Button>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <Typography variant='body2' color='text.secondary'>
                            {uiText.emptySnapshots}
                          </Typography>
                        )}
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 7 }}>
                      <Card variant='outlined'>
                        <CardContent>
                          {selectedSnapshot ? (
                            <Stack spacing={1.5}>
                              <Typography variant='subtitle1' fontWeight={700}>
                                {uiText.snapshotDetailTitle}
                              </Typography>
                              <Box sx={{ maxHeight: { xs: 'none', md: '72vh' }, overflowY: { xs: 'visible', md: 'auto' }, pr: { xs: 0, md: 1 } }}>
                                <Stack spacing={1.5}>
                                  <Tabs value={snapshotDetailTab} onChange={(_, value) => setSnapshotDetailTab(value)}>
                                    <Tab label={uiText.snapshotTabSummary} />
                                    <Tab label={uiText.snapshotTabRaw} />
                                  </Tabs>

                                  {snapshotDetailTab === 0 ? (
                                    <>
                                      <Grid container spacing={1.5}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                          <Card variant='outlined'>
                                            <CardContent>
                                              <Typography variant='subtitle2' sx={{ mb: 1 }}>{uiText.snapshotMetaTitle}</Typography>
                                              <Stack spacing={1}>
                                                <Chip size='small' color='primary' label={getSnapshotCapturedText(selectedSnapshot.capturedAt)} />
                                                <Chip size='small' color='secondary' label={`${uiText.snapshotCaptureType}: ${getCaptureTypeLabel(selectedSnapshot.captureType)}`} />
                                              </Stack>
                                            </CardContent>
                                          </Card>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                          <Card variant='outlined'>
                                            <CardContent>
                                              <Typography variant='subtitle2' sx={{ mb: 1 }}>{uiText.snapshotChangedTitle}</Typography>
                                              <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                                                {(selectedSnapshot.changedFields || []).length > 0 ? (
                                                  (selectedSnapshot.changedFields || []).map((field) => (
                                                    <Chip key={`detail-${field}`} size='small' variant='outlined' label={field} />
                                                  ))
                                                ) : (
                                                  <Typography variant='body2' color='text.secondary'>{uiText.notAvailable}</Typography>
                                                )}
                                              </Stack>
                                            </CardContent>
                                          </Card>
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                          <Typography variant='subtitle2'>{uiText.snapshotFieldSummary}</Typography>
                                        </Grid>
                                        {Object.entries(selectedSnapshotFields).map(([key, value]) => (
                                          <Grid key={key} size={{ xs: 12, md: 6 }}>
                                            <Card variant='outlined' sx={{ height: '100%' }}>
                                              <CardContent>
                                                <Typography variant='caption' color='text.secondary'>
                                                  {formatFieldLabel(key)}
                                                </Typography>
                                                <Box
                                                  component='pre'
                                                  sx={{
                                                    m: 0,
                                                    mt: 0.5,
                                                    fontSize: 12,
                                                    fontFamily: 'monospace',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word'
                                                  }}
                                                >
                                                  {formatFieldValue(value)}
                                                </Box>
                                              </CardContent>
                                            </Card>
                                          </Grid>
                                        ))}
                                      </Grid>
                                    </>
                                  ) : null}

                                  {snapshotDetailTab === 1 ? (
                                    <>
                                      <Typography variant='subtitle2'>{uiText.snapshotRawJson}</Typography>
                                      <Typography variant='caption' color='text.secondary'>
                                        {uiText.snapshotRawHint}
                                      </Typography>
                                      <Box
                                        component='pre'
                                        sx={{
                                          m: 0,
                                          p: 2,
                                          borderRadius: 1,
                                          bgcolor: 'action.hover',
                                          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                                          fontFamily: 'monospace',
                                          fontSize: 12,
                                          lineHeight: 1.55,
                                          whiteSpace: 'pre',
                                          overflowX: 'auto',
                                          overflowY: 'auto',
                                          maxHeight: 320
                                        }}
                                      >
                                        {JSON.stringify(selectedSnapshot.snapshot || {}, null, 2)}
                                      </Box>
                                    </>
                                  ) : null}
                                </Stack>
                              </Box>
                            </Stack>
                          ) : (
                            <Typography variant='body2' color='text.secondary'>
                              {uiText.snapshotSelectHint}
                            </Typography>
                          )}
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
