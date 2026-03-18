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
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslations } from 'next-intl'

import { SERVICES_CONFIG } from '@/configs/services'
import { useGbpPhotos, useSyncGbpPhotos } from '@/hooks/gbp/useGbpPhotos'
import { useLocationFilter } from '@/hooks/useLocationFilter'
import apiClient from '@/lib/apiClient'
import type { GbpSnapshotItem, GbpSnapshotDetail } from './_components/SnapshotHistory'
import SnapshotHistory from './_components/SnapshotHistory'
import GbpInsightsDashboard from './_components/GbpInsightsDashboard'
import AiContentGenerator from './_components/AiContentGenerator'
import SuggestionManager from './_components/SuggestionManager'

type GbpBusinessProfile = {
  description: string | null
  category: string | null
  phone: string | null
  website?: string | null
  address?: {
    formatted?: string | null
    addressLines?: string[]
    locality?: string | null
    administrativeArea?: string | null
    postalCode?: string | null
    countryCode?: string | null
  }
  hours?: {
    weekdayDescriptions?: string[]
    periods?: Array<{
      openDay?: string | null
      openTime?: string | null
      closeDay?: string | null
      closeTime?: string | null
    }>
  }
  lastSynced: string | null
  connectedAt?: string | null
  connectionStatus?: string | null
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
  labelWebsite: 'Website',
  labelHours: 'Business Hours',
  labelLastSynced: 'Last synced',
  labelConnection: 'Connection',
  missingLabel: 'Missing',
  photosTitle: 'Photos',
  photosSubtitle: 'Recent GBP photos for this location.',
  photosEmpty: 'No photos yet. Run a photo sync.',
  syncPhotos: 'Sync Photos',
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
  snapshotTabAudit: 'Audit',
  tabProfile: 'Profile',
  tabInsights: 'Insights',
  tabSnapshots: 'Snapshots',
  tabAiContent: 'AI Content',
  tabSuggestions: 'Suggestions',
  editProfile: 'Edit Profile',
  saveLocal: 'Save Draft',
  pushGoogle: 'Push to Google',
  cancelEdit: 'Cancel',
  editHint: 'Update fields locally or push changes to Google Business Profile.',
  labelAddressLines: 'Address lines',
  labelLocality: 'City / Locality',
  labelAdministrativeArea: 'State / Region',
  labelPostalCode: 'Postal code',
  labelCountryCode: 'Country code',
  labelWeekdayHours: 'Weekday hours',
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
  const [draftProfile, setDraftProfile] = useState<GbpBusinessProfile | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [pushingProfile, setPushingProfile] = useState(false)
  const [updateWarnings, setUpdateWarnings] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [snapshots, setSnapshots] = useState<GbpSnapshotItem[]>([])
  const [selectedSnapshot, setSelectedSnapshot] = useState<GbpSnapshotDetail | null>(null)
  const [loadingSnapshots, setLoadingSnapshots] = useState(false)
  const [capturingSnapshot, setCapturingSnapshot] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const pageTitle = `${t('navigation.gbp-rocket')}™`
  const hasProfile = Boolean(profile?.category || profile?.phone || profile?.address?.formatted || profile?.description)
  const isConnected = (profile?.connectionStatus || '').toLowerCase() === 'active'
  const { data: photosResult, isLoading: loadingPhotos } = useGbpPhotos(locationId || '', { skip: 0, take: 6 })
  const { mutate: syncPhotos, isPending: syncingPhotos } = useSyncGbpPhotos()
  const photos = photosResult?.data || []

  const lastSyncedText = useMemo(() => {
    if (!profile?.lastSynced) return uiText.never

    return new Date(profile.lastSynced).toLocaleString()
  }, [profile?.lastSynced])

  const isMissingValue = (value: unknown) => {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim().length === 0
    if (Array.isArray(value)) return value.length === 0

    return false
  }

  const buildDraft = useCallback((source: GbpBusinessProfile | null) => {
    if (!source) return null

    return {
      ...source,
      description: source.description || '',
      category: source.category || '',
      phone: source.phone || '',
      website: source.website || '',
      address: {
        addressLines: source.address?.addressLines || (source.address?.formatted ? [source.address.formatted] : []),
        locality: source.address?.locality || '',
        administrativeArea: source.address?.administrativeArea || '',
        postalCode: source.address?.postalCode || '',
        countryCode: source.address?.countryCode || '',
        formatted: source.address?.formatted || ''
      },
      hours: {
        periods: source.hours?.periods || [],
        weekdayDescriptions: source.hours?.weekdayDescriptions || []
      }
    }
  }, [])

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

  const isHttpStatus = (error: unknown, statusCode: number) => {
    return isAxiosError(error) && error.response?.status === statusCode
  }

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

      const nextProfile = response.data || null

      setProfile(nextProfile)

      if (!editingProfile) {
        setDraftProfile(buildDraft(nextProfile))
      }
    } catch (error) {
      setProfile(null)

      if (isHttpStatus(error, 404)) {
        setErrorMessage('Selected location was not found in GBP data. Choose another location and try again.')
      } else {
        console.error('Failed to fetch GBP profile:', error)
        setErrorMessage(extractErrorMessage(error, 'Failed to fetch GBP profile'))
      }
    } finally {
      setLoading(false)
    }
  }, [locationId, editingProfile, buildDraft])

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
      setSnapshots([])
      setSelectedSnapshot(null)

      if (isHttpStatus(error, 404)) {
        setErrorMessage('Snapshot history is not available for this location yet.')
      } else {
        console.error('Failed to fetch GBP snapshots:', error)
      }
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

  const updateDraft = (patch: Partial<GbpBusinessProfile>) => {
    setDraftProfile(prev => (prev ? { ...prev, ...patch } : prev))
  }

  const handleEditProfile = () => {
    setEditingProfile(true)
    setUpdateWarnings([])
    setDraftProfile(buildDraft(profile))
  }

  const handleCancelEdit = () => {
    setEditingProfile(false)
    setUpdateWarnings([])
    setDraftProfile(buildDraft(profile))
  }

  const buildUpdatePayload = (source: GbpBusinessProfile | null) => {
    if (!source) return {}

    return {
      description: source.description ?? null,
      category: source.category ?? null,
      phone: source.phone ?? null,
      website: source.website ?? null,
      address: {
        addressLines: source.address?.addressLines || [],
        locality: source.address?.locality ?? null,
        administrativeArea: source.address?.administrativeArea ?? null,
        postalCode: source.address?.postalCode ?? null,
        countryCode: source.address?.countryCode ?? null,
        formatted: source.address?.formatted ?? null
      },
      hours: {
        weekdayDescriptions: source.hours?.weekdayDescriptions || [],
        periods: source.hours?.periods || []
      }
    }
  }

  const handleSaveDraft = async () => {
    if (!locationId || !draftProfile) return

    try {
      setSavingDraft(true)
      setErrorMessage(null)
      setUpdateWarnings([])

      const response = await apiClient.patch(
        `${GBP_API_URL}/locations/${locationId}/business-profile`,
        buildUpdatePayload(draftProfile),
        { headers: { 'x-skip-system-message': '1' } }
      )

      const nextProfile = response.data?.profile || response.data || null

      setProfile(nextProfile)
      setDraftProfile(buildDraft(nextProfile))
      setEditingProfile(false)
      setUpdateWarnings(response.data?.warnings || [])
      await fetchSnapshots()
    } catch (error) {
      console.error('Failed to update GBP profile:', error)
      setErrorMessage(extractErrorMessage(error, 'Failed to update GBP profile'))
    } finally {
      setSavingDraft(false)
    }
  }

  const handlePushProfile = async () => {
    if (!locationId || !draftProfile) return

    try {
      setPushingProfile(true)
      setErrorMessage(null)
      setUpdateWarnings([])

      const response = await apiClient.post(
        `${GBP_API_URL}/locations/${locationId}/business-profile/push`,
        buildUpdatePayload(draftProfile),
        { headers: { 'x-skip-system-message': '1' } }
      )

      const nextProfile = response.data?.profile || response.data || null

      setProfile(nextProfile)
      setDraftProfile(buildDraft(nextProfile))
      setEditingProfile(false)
      setUpdateWarnings(response.data?.warnings || [])
      await Promise.all([fetchProfile(), fetchSnapshots()])
    } catch (error) {
      console.error('Failed to push GBP profile:', error)
      setErrorMessage(extractErrorMessage(error, 'Failed to push GBP profile'))
    } finally {
      setPushingProfile(false)
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
              <Chip color={isConnected ? 'success' : 'default'} variant='tonal' label={isConnected ? 'Connected' : 'Disconnected'} />
              <Chip color={hasProfile ? 'success' : 'warning'} variant='tonal' label={hasProfile ? uiText.stateReady : uiText.statePending} />
              <Chip variant='tonal' label={`${uiText.labelLastSynced}: ${lastSyncedText}`} />
            </Stack>
          </Stack>
        </Box>
      </Grid>

      <Grid size={{ xs: 12 }}>

        {!locationId ? (
          <Alert severity='info'>{uiText.noLocation}</Alert>
        ) : (
          <Stack spacing={3}>
            {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}
            <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
              <Tab label={uiText.tabProfile} />
              <Tab label={uiText.tabInsights} />
              <Tab label={uiText.tabSnapshots} />
              <Tab label={uiText.tabSuggestions} />
              <Tab label={uiText.tabAiContent} />
            </Tabs>

            {/* Header bar with title + action buttons — hidden on Insights tab */}
            {activeTab !== 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant='h6'>
                  {activeTab === 0
                    ? uiText.sectionTitle
                    : activeTab === 2
                      ? uiText.snapshotTitle
                      : activeTab === 3
                        ? uiText.tabSuggestions
                        : uiText.tabAiContent}
                </Typography>
                {activeTab === 0 ? (
                  <Stack direction='row' spacing={1}>
                    <Button variant='contained' color='warning' onClick={handleSync} disabled={syncing}>
                      {syncing ? uiText.syncing : uiText.syncNow}
                    </Button>
                    <Button
                      variant='outlined'
                      color='secondary'
                      onClick={() => locationId && syncPhotos(locationId)}
                      disabled={syncingPhotos}
                    >
                      {syncingPhotos ? uiText.syncing : uiText.syncPhotos}
                    </Button>
                  </Stack>
                ) : activeTab === 2 ? (
                  <Stack direction='row' spacing={1}>
                    <Button variant='outlined' color='inherit' onClick={fetchSnapshots} disabled={loadingSnapshots}>
                      {uiText.refreshSnapshots}
                    </Button>
                    <Button variant='contained' color='secondary' onClick={handleCreateSnapshot} disabled={capturingSnapshot}>
                      {capturingSnapshot ? uiText.syncing : uiText.createSnapshot}
                    </Button>
                  </Stack>
                ) : null}
              </Box>
            )}

            {activeTab !== 1 && <Divider />}

            {/* Tab 0: Profile */}
            {activeTab === 0 ? (
              loading ? (
                <Stack spacing={1}>
                  <Skeleton height={40} />
                  <Skeleton height={40} />
                  <Skeleton height={88} />
                  <Skeleton height={120} />
                </Stack>
              ) : (
                editingProfile ? (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Card variant='outlined'>
                        <CardContent>
                          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent='space-between' spacing={2}>
                            <Box>
                              <Typography variant='subtitle2'>{uiText.editProfile}</Typography>
                              <Typography variant='caption' color='text.secondary'>{uiText.editHint}</Typography>
                            </Box>
                            <Stack direction='row' spacing={1}>
                              <Button variant='outlined' color='inherit' onClick={handleCancelEdit}>
                                {uiText.cancelEdit}
                              </Button>
                              <Button variant='outlined' color='secondary' onClick={handleSaveDraft} disabled={savingDraft}>
                                {savingDraft ? uiText.syncing : uiText.saveLocal}
                              </Button>
                              <Button variant='contained' color='primary' onClick={handlePushProfile} disabled={pushingProfile}>
                                {pushingProfile ? uiText.syncing : uiText.pushGoogle}
                              </Button>
                            </Stack>
                          </Stack>

                          {updateWarnings.length > 0 && (
                            <Alert severity='warning' sx={{ mt: 2 }}>
                              {updateWarnings.map((warning) => (
                                <Typography key={warning} variant='body2'>{warning}</Typography>
                              ))}
                            </Alert>
                          )}

                          {draftProfile && (
                            <Stack spacing={2.5} sx={{ mt: 3 }}>
                              <TextField
                                fullWidth
                                label={uiText.labelDescription}
                                value={draftProfile.description || ''}
                                multiline
                                minRows={3}
                                onChange={(event) => updateDraft({ description: event.target.value })}
                              />
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    label={uiText.labelCategory}
                                    value={draftProfile.category || ''}
                                    onChange={(event) => updateDraft({ category: event.target.value })}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    label={uiText.labelPhone}
                                    value={draftProfile.phone || ''}
                                    onChange={(event) => updateDraft({ phone: event.target.value })}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    label={uiText.labelWebsite}
                                    value={draftProfile.website || ''}
                                    onChange={(event) => updateDraft({ website: event.target.value })}
                                  />
                                </Grid>
                              </Grid>
                              <TextField
                                fullWidth
                                label={uiText.labelAddressLines}
                                value={(draftProfile.address?.addressLines || []).join('\n')}
                                multiline
                                minRows={2}
                                onChange={(event) => {
                                  const lines = event.target.value.split('\n').map(line => line.trim()).filter(Boolean)

                                  updateDraft({
                                    address: {
                                      ...(draftProfile.address || {}),
                                      addressLines: lines
                                    }
                                  })
                                }}
                              />
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    label={uiText.labelLocality}
                                    value={draftProfile.address?.locality || ''}
                                    onChange={(event) => updateDraft({ address: { ...(draftProfile.address || {}), locality: event.target.value } })}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    label={uiText.labelAdministrativeArea}
                                    value={draftProfile.address?.administrativeArea || ''}
                                    onChange={(event) => updateDraft({ address: { ...(draftProfile.address || {}), administrativeArea: event.target.value } })}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    label={uiText.labelPostalCode}
                                    value={draftProfile.address?.postalCode || ''}
                                    onChange={(event) => updateDraft({ address: { ...(draftProfile.address || {}), postalCode: event.target.value } })}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    label={uiText.labelCountryCode}
                                    value={draftProfile.address?.countryCode || ''}
                                    onChange={(event) => updateDraft({ address: { ...(draftProfile.address || {}), countryCode: event.target.value } })}
                                  />
                                </Grid>
                              </Grid>
                              <TextField
                                fullWidth
                                label={uiText.labelWeekdayHours}
                                value={(draftProfile.hours?.weekdayDescriptions || []).join('\n')}
                                multiline
                                minRows={3}
                                onChange={(event) => {
                                  const lines = event.target.value.split('\n').map(line => line.trim()).filter(Boolean)

                                  updateDraft({
                                    hours: {
                                      ...(draftProfile.hours || {}),
                                      weekdayDescriptions: lines
                                    }
                                  })
                                }}
                              />
                            </Stack>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Card variant='outlined'>
                        <CardContent>
                          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent='space-between' spacing={2}>
                            <Box>
                              <Typography variant='subtitle2'>{uiText.editProfile}</Typography>
                              <Typography variant='caption' color='text.secondary'>{uiText.editHint}</Typography>
                            </Box>
                            <Button variant='outlined' onClick={handleEditProfile} disabled={!profile}>
                              {uiText.editProfile}
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant='outlined'>
                      <CardContent>
                        <Stack direction='row' alignItems='center' justifyContent='space-between'>
                          <Typography variant='caption' color='text.secondary'>{uiText.labelCategory}</Typography>
                          {isMissingValue(profile?.category) ? <Chip size='small' color='warning' label={uiText.missingLabel} /> : null}
                        </Stack>
                        <Typography variant='body1' fontWeight={600}>{profile?.category || uiText.notAvailable}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant='outlined'>
                      <CardContent>
                        <Stack direction='row' alignItems='center' justifyContent='space-between'>
                          <Typography variant='caption' color='text.secondary'>{uiText.labelPhone}</Typography>
                          {isMissingValue(profile?.phone) ? <Chip size='small' color='warning' label={uiText.missingLabel} /> : null}
                        </Stack>
                        <Typography variant='body1' fontWeight={600}>{profile?.phone || uiText.notAvailable}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant='outlined'>
                      <CardContent>
                        <Stack direction='row' alignItems='center' justifyContent='space-between'>
                          <Typography variant='caption' color='text.secondary'>{uiText.labelWebsite}</Typography>
                          {isMissingValue(profile?.website) ? <Chip size='small' color='warning' label={uiText.missingLabel} /> : null}
                        </Stack>
                        <Typography variant='body1' fontWeight={600}>{profile?.website || uiText.notAvailable}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant='outlined'>
                      <CardContent>
                        <Stack direction='row' alignItems='center' justifyContent='space-between'>
                          <Typography variant='caption' color='text.secondary'>{uiText.labelAddress}</Typography>
                          {isMissingValue(profile?.address?.formatted) ? <Chip size='small' color='warning' label={uiText.missingLabel} /> : null}
                        </Stack>
                        <Typography variant='body2'>{profile?.address?.formatted || uiText.notAvailable}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant='outlined'>
                      <CardContent>
                        <Stack direction='row' alignItems='center' justifyContent='space-between'>
                          <Typography variant='caption' color='text.secondary'>{uiText.labelDescription}</Typography>
                          {isMissingValue(profile?.description) ? <Chip size='small' color='warning' label={uiText.missingLabel} /> : null}
                        </Stack>
                        <Typography variant='body2'>{profile?.description || uiText.notAvailable}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant='outlined'>
                      <CardContent>
                        <Stack direction='row' alignItems='center' justifyContent='space-between'>
                          <Typography variant='caption' color='text.secondary'>{uiText.labelHours}</Typography>
                          {isMissingValue(profile?.hours?.weekdayDescriptions || []) ? <Chip size='small' color='warning' label={uiText.missingLabel} /> : null}
                        </Stack>
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
                  <Grid size={{ xs: 12 }}>
                    <Card variant='outlined'>
                      <CardContent>
                        <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1.5 }}>
                          <Box>
                            <Typography variant='subtitle2'>{uiText.photosTitle}</Typography>
                            <Typography variant='caption' color='text.secondary'>{uiText.photosSubtitle}</Typography>
                          </Box>
                          <Button
                            size='small'
                            variant='outlined'
                            onClick={() => locationId && syncPhotos(locationId)}
                            disabled={syncingPhotos}
                          >
                            {syncingPhotos ? uiText.syncing : uiText.syncPhotos}
                          </Button>
                        </Stack>
                        {loadingPhotos ? (
                          <Grid container spacing={1}>
                            {Array.from({ length: 6 }).map((_, index) => (
                              <Grid key={`photo-skeleton-${index}`} size={{ xs: 6, md: 4 }}>
                                <Skeleton variant='rounded' height={120} />
                              </Grid>
                            ))}
                          </Grid>
                        ) : photos.length > 0 ? (
                          <ImageList cols={3} gap={10}>
                            {photos.map((photo: any) => (
                              <ImageListItem key={photo.id}>
                                <Box
                                  component='img'
                                  src={photo.thumbnailUrl || photo.googleUrl}
                                  alt='GBP photo'
                                  sx={{ height: 130, width: '100%', objectFit: 'cover', borderRadius: 1.5 }}
                                />
                              </ImageListItem>
                            ))}
                          </ImageList>
                        ) : (
                          <Typography variant='body2' color='text.secondary'>
                            {uiText.photosEmpty}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                )
              )
            ) : activeTab === 1 ? (

              /* Tab 1: Insights */
              <GbpInsightsDashboard locationId={locationId} />
            ) : activeTab === 2 ? (

              /* Tab 2: Snapshots */
              <SnapshotHistory
                locationId={locationId}
                snapshots={snapshots}
                selectedSnapshot={selectedSnapshot}
                loading={loadingSnapshots}
                onSelectSnapshot={handleOpenSnapshot}
              />
            ) : activeTab === 3 ? (

              /* Tab 3: Suggestions */
              <SuggestionManager
                locationId={locationId}
                onError={(message) => setErrorMessage(message)}
              />
            ) : (

              /* Tab 4: AI Content */
              <AiContentGenerator
                locationId={locationId}
                profileCategory={profile?.category}
                onError={(message) => setErrorMessage(message)}
              />
            )}
          </Stack>
        )}
      </Grid>
    </Grid>
  )
}

export default AdminGBPRocketPage
