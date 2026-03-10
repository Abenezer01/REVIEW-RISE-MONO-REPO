/* eslint-disable import/no-unresolved */
/* eslint-disable react/jsx-no-literals */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LinkIcon from '@mui/icons-material/Link'
import NotesIcon from '@mui/icons-material/Notes'
import RefreshIcon from '@mui/icons-material/Refresh'
import TimelineIcon from '@mui/icons-material/Timeline'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import { alpha, useTheme } from '@mui/material/styles'

import { SERVICES_CONFIG } from '@/configs/services'
import apiClient from '@/lib/apiClient'

type LifecycleState = 'DRAFT' | 'SAVED' | 'APPLIED' | 'REJECTED'

type SuggestionItem = {
  id: string
  title: string
  description: string
  source: string | null
  lifecycleState: LifecycleState
  contentType?: string | null
  auditSnapshotId: string | null
  auditFindingCodes: string[]
  appliedAt: string | null
  appliedNotes: string | null
  updatedAt: string
  generatedAt: string
  reAuditGuidance?: string | null
}

type GbpProfileSummary = {
  description?: string | null
  category?: string | null
}

type ActivityItem = {
  id: string
  recommendationId: string
  action: string
  notes?: string | null
  details?: any
  createdAt: string
  user?: {
    id: string
    name?: string | null
    email?: string | null
  } | null
}

type ApplyProfileField = {
  key: string
  label: string
  enabled: boolean
  value: string
}

type Props = {
  locationId: string
  onError: (message: string) => void
}

const GBP_API_URL = SERVICES_CONFIG.gbp.url

const lifecycleLabel: Record<LifecycleState, string> = {
  DRAFT: 'Draft',
  SAVED: 'Saved',
  APPLIED: 'Applied',
  REJECTED: 'Rejected'
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A'

  return new Date(value).toLocaleString()
}

const stateColor = (state: LifecycleState): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  if (state === 'APPLIED') return 'success'
  if (state === 'REJECTED') return 'error'
  if (state === 'SAVED') return 'primary'

  return 'warning'
}

const stateBorderColor = (theme: any, state: LifecycleState) => {
  if (state === 'APPLIED') return alpha(theme.palette.success.main, 0.5)
  if (state === 'REJECTED') return alpha(theme.palette.error.main, 0.5)
  if (state === 'SAVED') return alpha(theme.palette.primary.main, 0.5)

  return alpha(theme.palette.warning.main, 0.5)
}

const activityLabel = (action: string) => action.replaceAll('_', ' ').toUpperCase()

const sourceLabel = (source?: string | null) => {
  if (!source || source.trim().length === 0) return 'Unknown'

  return source
    .split('_')
    .filter(Boolean)
    .map((chunk) => {
      if (chunk.toLowerCase() === 'ai') return 'AI'

      return chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase()
    })
    .join(' ')
}

export default function SuggestionManager({ locationId, onError }: Props) {
  const theme = useTheme()

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [stateFilter, setStateFilter] = useState<'ALL' | LifecycleState>('ALL')

  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newLinks, setNewLinks] = useState('')

  const [applyNotes, setApplyNotes] = useState<Record<string, string>>({})
  const [applyDate, setApplyDate] = useState<Record<string, string>>({})
  const [linkFields, setLinkFields] = useState<Record<string, string>>({})
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [applySuggestion, setApplySuggestion] = useState<SuggestionItem | null>(null)
  const [applyFields, setApplyFields] = useState<ApplyProfileField[]>([])
  const [applySubmitting, setApplySubmitting] = useState(false)
  const [applyPushToGoogle, setApplyPushToGoogle] = useState(true)
  const [applyMarkApplied, setApplyMarkApplied] = useState(true)
  const [profilePreview, setProfilePreview] = useState<GbpProfileSummary | null>(null)

  const parseCodes = (raw: string) => raw.split(',').map((v) => v.trim()).filter(Boolean)

  const extractPrefillValue = (text: string, label: string) => {
    const regex = new RegExp(`${label}\\s*[:\\-]\\s*(.+)`, 'i')
    const match = text.match(regex)
    return match?.[1]?.trim() || ''
  }

  const buildApplyFields = (item: SuggestionItem): ApplyProfileField[] => {
    const content = `${item.title}\n${item.description}`
    const normalizedType = (item.contentType || '').toLowerCase()
    const isCategorySuggestion = normalizedType === 'category' || item.title.toLowerCase().includes('category')
    const categoryGuess = extractPrefillValue(content, 'Category')
      || extractPrefillValue(content, 'Primary Category')
      || (isCategorySuggestion ? item.title : '')
    const descriptionGuess =
      extractPrefillValue(content, 'Description')
      || (normalizedType === 'description' ? item.description : (!isCategorySuggestion ? item.description : ''))

    return [
      { key: 'description', label: 'Business description', enabled: Boolean(descriptionGuess), value: descriptionGuess },
      { key: 'category', label: 'Category', enabled: Boolean(categoryGuess), value: categoryGuess }
    ]
  }

  const extractMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
      const message = (error.response?.data as any)?.message

      if (typeof message === 'string' && message.trim().length > 0) {
        return message
      }
    }

    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message
    }

    return fallback
  }

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)

      const lifecycleState = stateFilter === 'ALL' ? undefined : stateFilter

      const [suggestionsResponse, activityResponse] = await Promise.all([
        apiClient.get<{ items: SuggestionItem[] }>(`${GBP_API_URL}/locations/${locationId}/suggestions`, {
          params: lifecycleState ? { lifecycleState } : undefined,
          headers: { 'x-skip-system-message': '1' }
        }),
        apiClient.get<{ items: ActivityItem[] }>(`${GBP_API_URL}/locations/${locationId}/suggestions/activity`, {
          headers: { 'x-skip-system-message': '1' }
        })
      ])

      const nextSuggestions = suggestionsResponse.data?.items || []

      setSuggestions(nextSuggestions)
      setActivity(activityResponse.data?.items || [])

      const nextLinks: Record<string, string> = {}

      nextSuggestions.forEach((item) => {
        nextLinks[item.id] = (item.auditFindingCodes || []).join(', ')
      })

      setLinkFields(nextLinks)
    } catch (error) {
      onError(extractMessage(error, 'Failed to load suggestions'))
    } finally {
      setLoading(false)
    }
  }, [locationId, onError, stateFilter])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const createSuggestion = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      onError('Title and description are required')

      return
    }

    try {
      setSubmitting('create')
      await apiClient.post(
        `${GBP_API_URL}/locations/${locationId}/suggestions`,
        {
          title: newTitle.trim(),
          description: newDescription.trim(),
          source: 'manual',
          lifecycleState: 'DRAFT',
          auditFindingCodes: parseCodes(newLinks)
        },
        { headers: { 'x-skip-system-message': '1' } }
      )

      setNewTitle('')
      setNewDescription('')
      setNewLinks('')
      await fetchAll()
    } catch (error) {
      onError(extractMessage(error, 'Failed to create suggestion'))
    } finally {
      setSubmitting(null)
    }
  }

  const patchState = async (
    item: SuggestionItem,
    nextState: LifecycleState,
    options?: { notes?: string; appliedDate?: string; links?: string }
  ) => {
    try {
      setSubmitting(item.id)
      await apiClient.patch(
        `${GBP_API_URL}/locations/${locationId}/suggestions/${item.id}/state`,
        {
          lifecycleState: nextState,
          notes: options?.notes,
          appliedDate: options?.appliedDate || null,
          auditFindingCodes: options?.links ? parseCodes(options.links) : item.auditFindingCodes
        },
        { headers: { 'x-skip-system-message': '1' } }
      )

      await fetchAll()
    } catch (error) {
      onError(extractMessage(error, 'Failed to update suggestion'))
    } finally {
      setSubmitting(null)
    }
  }

  const openApplyDialog = (item: SuggestionItem) => {
    setApplySuggestion(item)
    setApplyFields(buildApplyFields(item))
    setApplyPushToGoogle(true)
    setApplyMarkApplied(true)
    setApplyDialogOpen(true)

    apiClient
      .get<GbpProfileSummary>(`${GBP_API_URL}/locations/${locationId}/business-profile`, {
        headers: { 'x-skip-system-message': '1' }
      })
      .then((response) => {
        setProfilePreview(response.data || null)
      })
      .catch(() => {
        setProfilePreview(null)
      })
  }

  const closeApplyDialog = () => {
    setApplyDialogOpen(false)
    setApplySuggestion(null)
    setApplyFields([])
    setProfilePreview(null)
  }

  const updateApplyField = (key: string, patch: Partial<ApplyProfileField>) => {
    setApplyFields((prev) => prev.map((field) => (field.key === key ? { ...field, ...patch } : field)))
  }

  const buildProfilePayload = () => {
    const payload: any = {}
    const getValue = (key: string) => applyFields.find((f) => f.key === key)

    const description = getValue('description')
    if (description?.enabled) payload.description = description.value || ''

    const category = getValue('category')
    if (category?.enabled) payload.category = category.value || ''

    return payload
  }

  const applyToProfile = async () => {
    if (!locationId || !applySuggestion) return

    const payload = buildProfilePayload()
    if (!Object.keys(payload).length) {
      onError('Select at least one field to apply')
      return
    }

    try {
      setApplySubmitting(true)
      const endpoint = applyPushToGoogle
        ? `${GBP_API_URL}/locations/${locationId}/business-profile/push`
        : `${GBP_API_URL}/locations/${locationId}/business-profile`

      await apiClient[applyPushToGoogle ? 'post' : 'patch'](
        endpoint,
        payload,
        { headers: { 'x-skip-system-message': '1' } }
      )

      if (applyMarkApplied) {
        await patchState(applySuggestion, 'APPLIED', {
          notes: `Applied to GBP profile${applyPushToGoogle ? ' and pushed to Google' : ''}.`,
          appliedDate: new Date().toISOString().split('T')[0],
          links: linkFields[applySuggestion.id]
        })
      } else {
        await fetchAll()
      }

      closeApplyDialog()
    } catch (error) {
      onError(extractMessage(error, 'Failed to apply suggestion to profile'))
    } finally {
      setApplySubmitting(false)
    }
  }

  const summary = useMemo(() => {
    const total = suggestions.length
    const applied = suggestions.filter((s) => s.lifecycleState === 'APPLIED').length
    const saved = suggestions.filter((s) => s.lifecycleState === 'SAVED').length
    const draft = suggestions.filter((s) => s.lifecycleState === 'DRAFT').length
    const rejected = suggestions.filter((s) => s.lifecycleState === 'REJECTED').length
    const completionRate = total > 0 ? Math.round((applied / total) * 100) : 0

    return { total, applied, saved, draft, rejected, completionRate }
  }, [suggestions])

  return (
    <Stack spacing={2.5}>
      <Card
        variant='outlined'
        sx={{
          borderColor: alpha(theme.palette.primary.main, 0.3),
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.info.main, 0.1)} 45%, ${alpha(theme.palette.success.main, 0.1)} 100%)`
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' gap={1.5}>
              <Box>
                <Typography variant='h6' fontWeight={800}>Suggestion Tracker</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Move GBP recommendations through a clear workflow and keep an auditable implementation trail.
                </Typography>
              </Box>
              <Button variant='outlined' startIcon={<RefreshIcon />} onClick={fetchAll} disabled={loading}>
                Refresh Data
              </Button>
            </Stack>

            <Box>
              <Stack direction='row' justifyContent='space-between' sx={{ mb: 0.5 }}>
                <Typography variant='caption' color='text.secondary'>Completion</Typography>
                <Typography variant='caption' color='text.secondary'>{summary.completionRate}% Applied</Typography>
              </Stack>
              <LinearProgress
                variant='determinate'
                value={summary.completionRate}
                color='success'
                sx={{ height: 8, borderRadius: 99, bgcolor: alpha(theme.palette.common.white, 0.3) }}
              />
            </Box>

            <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
              <Chip label={`Total ${summary.total}`} />
              <Chip color='warning' label={`Draft ${summary.draft}`} />
              <Chip color='primary' label={`Saved ${summary.saved}`} />
              <Chip color='success' label={`Applied ${summary.applied}`} />
              <Chip color='error' label={`Rejected ${summary.rejected}`} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card variant='outlined'>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', md: 'row' }} gap={1} alignItems={{ md: 'center' }} justifyContent='space-between'>
                  <Typography variant='subtitle1' fontWeight={700}>Create Suggestion</Typography>
                  <Select
                    size='small'
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value as 'ALL' | LifecycleState)}
                    sx={{ minWidth: 180 }}
                  >
                    <MenuItem value='ALL'>Show All States</MenuItem>
                    <MenuItem value='DRAFT'>Draft</MenuItem>
                    <MenuItem value='SAVED'>Saved</MenuItem>
                    <MenuItem value='APPLIED'>Applied</MenuItem>
                    <MenuItem value='REJECTED'>Rejected</MenuItem>
                  </Select>
                </Stack>

                <Grid container spacing={1.25}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField size='small' fullWidth label='Title' value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField size='small' fullWidth label='Description' value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      size='small'
                      fullWidth
                      label='Audit codes (comma)'
                      value={newLinks}
                      onChange={(e) => setNewLinks(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Stack direction='row' spacing={1}>
                  <Button variant='contained' onClick={createSuggestion} disabled={submitting === 'create'}>
                    {submitting === 'create' ? 'Saving...' : 'Save Suggestion'}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {loading ? <Alert severity='info'>Loading suggestions...</Alert> : null}
            {!loading && suggestions.length === 0 ? <Alert severity='info'>No suggestions yet.</Alert> : null}

            {suggestions.map((item) => {
              const linkValue = linkFields[item.id] ?? ''
              const notesValue = applyNotes[item.id] || ''
              const dateValue = applyDate[item.id] || ''

              return (
                <Card
                  key={item.id}
                  variant='outlined'
                  sx={{
                    borderLeft: `4px solid ${stateBorderColor(theme, item.lifecycleState)}`
                  }}
                >
                  <CardContent>
                    <Stack spacing={1.25}>
                      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' alignItems={{ md: 'center' }} gap={1}>
                        <Box>
                          <Typography variant='subtitle1' fontWeight={700}>{item.title}</Typography>
                          <Typography variant='body2' color='text.secondary'>{item.description}</Typography>
                        </Box>
                        <Stack direction='row' spacing={1}>
                          <Chip size='small' color={stateColor(item.lifecycleState)} label={lifecycleLabel[item.lifecycleState]} />
                          <Chip size='small' variant='outlined' label={sourceLabel(item.source)} />
                        </Stack>
                      </Stack>

                      <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap' alignItems='center'>
                        <Typography variant='caption' color='text.secondary'>Linked Findings:</Typography>
                        {(item.auditFindingCodes || []).length > 0
                          ? item.auditFindingCodes.map((code) => (
                            <Chip key={`${item.id}-${code}`} size='small' icon={<LinkIcon />} label={code} />
                          ))
                          : <Typography variant='caption' color='text.secondary'>None</Typography>}
                      </Stack>

                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12, md: 5 }}>
                          <TextField
                            size='small'
                            fullWidth
                            label='Update linked finding codes'
                            value={linkValue}
                            onChange={(e) => setLinkFields((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <TextField
                            size='small'
                            type='date'
                            fullWidth
                            label='Applied date'
                            InputLabelProps={{ shrink: true }}
                            value={dateValue}
                            onChange={(e) => setApplyDate((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            size='small'
                            fullWidth
                            label='Notes'
                            value={notesValue}
                            onChange={(e) => setApplyNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          />
                        </Grid>
                      </Grid>

                      <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
                        <Button
                          size='small'
                          variant='outlined'
                          onClick={() => openApplyDialog(item)}
                          disabled={submitting === item.id}
                        >
                          Apply to Profile
                        </Button>
                        <Button
                          size='small'
                          variant='contained'
                          color='success'
                          startIcon={<CheckCircleIcon />}
                          onClick={() => patchState(item, 'APPLIED', { notes: notesValue, appliedDate: dateValue, links: linkValue })}
                          disabled={submitting === item.id}
                        >
                          Mark Applied
                        </Button>
                        <Button
                          size='small'
                          variant='outlined'
                          onClick={() => patchState(item, 'SAVED', { notes: notesValue, links: linkValue })}
                          disabled={submitting === item.id}
                        >
                          Save
                        </Button>
                        <Button
                          size='small'
                          color='warning'
                          variant='outlined'
                          onClick={() => patchState(item, 'DRAFT', { notes: notesValue, links: linkValue })}
                          disabled={submitting === item.id}
                        >
                          Draft
                        </Button>
                        <Button
                          size='small'
                          color='error'
                          variant='outlined'
                          onClick={() => patchState(item, 'REJECTED', { notes: notesValue, links: linkValue })}
                          disabled={submitting === item.id}
                        >
                          Reject
                        </Button>
                      </Stack>

                      <Stack direction='row' spacing={2} useFlexGap flexWrap='wrap'>
                        <Stack direction='row' spacing={0.75} alignItems='center'>
                          <AccessTimeIcon fontSize='small' color='action' />
                          <Typography variant='caption' color='text.secondary'>Updated: {formatDateTime(item.updatedAt)}</Typography>
                        </Stack>
                        <Stack direction='row' spacing={0.75} alignItems='center'>
                          <NotesIcon fontSize='small' color='action' />
                          <Typography variant='caption' color='text.secondary'>Applied: {formatDateTime(item.appliedAt)}</Typography>
                        </Stack>
                      </Stack>

                      {item.reAuditGuidance ? <Alert severity='info'>{item.reAuditGuidance}</Alert> : null}
                    </Stack>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card variant='outlined' sx={{ position: { lg: 'sticky' }, top: { lg: 88 } }}>
            <CardContent>
              <Stack spacing={1.25}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <TimelineIcon fontSize='small' color='action' />
                  <Typography variant='subtitle1' fontWeight={700}>Activity Timeline</Typography>
                </Stack>
                <Typography variant='caption' color='text.secondary'>Who changed what and when</Typography>
                <Divider />

                {activity.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>No activity yet.</Typography>
                ) : (
                  activity.slice(0, 20).map((entry) => (
                    <Box
                      key={entry.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.25,
                        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                        bgcolor: alpha(theme.palette.background.default, 0.45)
                      }}
                    >
                      <Typography variant='body2' fontWeight={700}>{activityLabel(entry.action)}</Typography>
                      <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                        {formatDateTime(entry.createdAt)}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                        {entry.user?.name || entry.user?.email || 'System'} · {entry.recommendationId.slice(0, 8)}
                      </Typography>
                      {entry.notes ? <Typography variant='caption' sx={{ mt: 0.5, display: 'block' }}>{entry.notes}</Typography> : null}
                    </Box>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={applyDialogOpen} onClose={closeApplyDialog} fullWidth maxWidth='sm'>
        <DialogTitle>Apply Suggestion To GBP Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              Review which fields to apply from this suggestion before updating the profile.
            </Typography>
            {applyFields.map((field) => (
              <Box key={field.key} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.6)}`, borderRadius: 2, p: 2 }}>
                <Stack spacing={1}>
                  <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.enabled}
                          onChange={(event) => updateApplyField(field.key, { enabled: event.target.checked })}
                        />
                      }
                      label={field.label}
                    />
                  </Stack>
                  <TextField
                    fullWidth
                    size='small'
                    multiline
                    minRows={field.key === 'description' ? 3 : 3}
                    disabled={!field.enabled}
                    helperText={
                      field.key === 'description'
                        ? `Current GBP: ${profilePreview?.description || 'Empty'}`
                        : `Current GBP: ${profilePreview?.category || 'Empty'}`
                    }
                    value={field.value}
                    onChange={(event) => updateApplyField(field.key, { value: event.target.value })}
                  />
                </Stack>
              </Box>
            ))}

            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={applyPushToGoogle}
                    onChange={(event) => setApplyPushToGoogle(event.target.checked)}
                  />
                }
                label='Push changes to Google Business Profile'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={applyMarkApplied}
                    onChange={(event) => setApplyMarkApplied(event.target.checked)}
                  />
                }
                label='Mark suggestion as applied'
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant='text' onClick={closeApplyDialog}>
            Cancel
          </Button>
          <Button variant='contained' onClick={applyToProfile} disabled={applySubmitting}>
            {applySubmitting ? 'Applying...' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
