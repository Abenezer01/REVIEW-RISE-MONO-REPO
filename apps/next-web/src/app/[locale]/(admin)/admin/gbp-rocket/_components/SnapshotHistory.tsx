'use client'

import { useEffect, useState, useMemo } from 'react'

import { useTranslations } from 'next-intl'

import Box from '@mui/material/Box'
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
import Zoom from '@mui/material/Zoom'
import Fade from '@mui/material/Fade'

import HistoryIcon from '@mui/icons-material/History'
import SyncIcon from '@mui/icons-material/Sync'
import PersonIcon from '@mui/icons-material/Person'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import InfoIcon from '@mui/icons-material/Info'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'

import AuditTab from './AuditTab'

// --- Types ---
export type GbpSnapshotItem = {
    id: string
    captureType: string
    capturedAt: string
    changedFields: string[]
}

export type GbpSnapshotDetail = GbpSnapshotItem & {
    snapshot: {
        fields?: Record<string, unknown>
    }
}

interface SnapshotHistoryProps {
    locationId: string
    snapshots: GbpSnapshotItem[]
    selectedSnapshot: GbpSnapshotDetail | null
    loading: boolean
    onSelectSnapshot: (id: string) => void
}

const uiText = {
    snapshotVersion: 'Snapshot',
    snapshotAt: 'Captured',
    snapshotFieldsChangedCount: 'fields changed',
    snapshotDetailTitle: 'Snapshot Detail',
    snapshotCaptureType: 'Capture type',
    snapshotTypeSync: 'System Sync',
    snapshotTypeManual: 'Manual Capture',
    snapshotFieldSummary: 'Field Summary',
    snapshotMetaTitle: 'Snapshot Info',
    snapshotChangedTitle: 'Changed Fields',
    snapshotRawJson: 'Raw Snapshot JSON',
    snapshotRawHint: 'Scrollable view for full payload',
    snapshotTabSummary: 'Overview & Fields',
    snapshotTabRaw: 'Raw JSON',
    snapshotTabAudit: 'Audit',
    notAvailable: 'N/A',
    snapshotSelectHint: 'Select a snapshot to view details.',
    emptySnapshots: 'No snapshots yet.',
}

export default function SnapshotHistory({ locationId, snapshots, selectedSnapshot, loading, onSelectSnapshot }: SnapshotHistoryProps) {
    const theme = useTheme()
    const t = useTranslations('gbpRocket')
    const [tabIndex, setTabIndex] = useState(0)

    useEffect(() => {
        setTabIndex(0)
    }, [selectedSnapshot?.id])

    const formatFieldLabel = (key: string) => {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase()).trim()
    }

    const formatFieldValue = (value: unknown) => {
        if (value === null || value === undefined) return uiText.notAvailable
        if (typeof value === 'string' && value.trim().length === 0) return uiText.notAvailable
        if (typeof value === 'string') return value

        return JSON.stringify(value, null, 2)
    }

    const selectedSnapshotFields = useMemo(() => {
        return (selectedSnapshot?.snapshot?.fields || {}) as Record<string, unknown>
    }, [selectedSnapshot])

    if (loading) {
        return (
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack spacing={2}>
                        <Skeleton height={120} variant="rounded" sx={{ borderRadius: 3 }} />
                        <Skeleton height={120} variant="rounded" sx={{ borderRadius: 3 }} />
                        <Skeleton height={120} variant="rounded" sx={{ borderRadius: 3 }} />
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Skeleton height={600} variant="rounded" sx={{ borderRadius: 4 }} />
                </Grid>
            </Grid>
        )
    }

    if (snapshots.length === 0) {
        return (
            <Box sx={{ p: 6, textAlign: 'center', bgcolor: alpha(theme.palette.action.hover, 0.05), borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
                <HistoryIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5, color: 'text.secondary' }} />
                <Typography variant="h6" gutterBottom>{uiText.emptySnapshots}</Typography>
            </Box>
        )
    }

    return (
        <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
            {/* LEFT COLUMN: SNAPSHOT LIST */}
            <Grid size={{ xs: 12, lg: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>{t('snapshot.historyTimeline')}</Typography>
                <Stack spacing={2} sx={{ maxHeight: { xs: 400, lg: 800 }, overflowY: 'auto', pr: 1, pb: 1 }}>
                    {snapshots.map((snapshot, index) => {
                        const isSelected = selectedSnapshot?.id === snapshot.id
                        const isSync = snapshot.captureType === 'sync'

                        return (
                            <Box
                                key={snapshot.id}
                                onClick={() => onSelectSnapshot(snapshot.id)}
                                sx={{
                                    p: 2.5,
                                    cursor: 'pointer',
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.6),
                                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : theme.palette.background.paper,
                                    borderLeft: isSelected ? `6px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: theme.palette.primary.main,
                                        transform: 'translateY(-2px)',
                                        boxShadow: theme.shadows[2]
                                    }
                                }}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700} color={isSelected ? 'primary.main' : 'text.primary'}>
                                            {uiText.snapshotVersion}{' '}{snapshots.length - index}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <CalendarTodayIcon sx={{ fontSize: 12 }} />
                                            {new Date(snapshot.capturedAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        size="small"
                                        icon={isSync ? <SyncIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                                        label={isSync ? uiText.snapshotTypeSync : uiText.snapshotTypeManual}
                                        color={isSync ? 'info' : 'secondary'}
                                        variant={isSelected ? 'filled' : 'outlined'}
                                        sx={{ fontSize: '0.65rem', height: 24 }}
                                    />
                                </Stack>
                                <Divider sx={{ my: 1.5, opacity: 0.6 }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                                    {snapshot.changedFields?.length || 0}{' '}{uiText.snapshotFieldsChangedCount}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {(snapshot.changedFields || []).slice(0, 3).map((field) => (
                                        <Chip key={field} label={field} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                                    ))}
                                    {(snapshot.changedFields || []).length > 3 && (
                                        <Chip label={`+${(snapshot.changedFields || []).length - 3}`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                                    )}
                                </Box>
                            </Box>
                        )
                    })}
                </Stack>
            </Grid>

            {/* RIGHT COLUMN: DETAIL VIEW */}
            <Grid size={{ xs: 12, lg: 8 }} sx={{ position: { md: 'sticky' }, top: 24 }}>
                <Box>
                    {!selectedSnapshot ? (
                        <Box sx={{ p: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 4 }}>
                            <InfoIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body1" color="text.secondary">{uiText.snapshotSelectHint}</Typography>
                        </Box>
                    ) : (
                        <Fade in={true} key={selectedSnapshot.id}>
                            <Box sx={{ p: { xs: 2, md: 3 } }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold">{uiText.snapshotDetailTitle}</Typography>
                                        <Typography variant="body2" color="text.secondary">{t('snapshot.capturedAt')}{' '}{new Date(selectedSnapshot.capturedAt).toLocaleString()}</Typography>
                                    </Box>
                                    <Chip color="primary" label={`${selectedSnapshot.changedFields?.length || 0} Changes`} variant="tonal" />
                                </Stack>

                                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                    <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
                                        <Tab label={uiText.snapshotTabSummary} />
                                        <Tab label={uiText.snapshotTabAudit} />
                                        <Tab label={uiText.snapshotTabRaw} />
                                    </Tabs>
                                </Box>

                                <Box sx={{ minHeight: 400 }}>
                                    {tabIndex === 0 && (
                                        <Zoom in={true}>
                                            <Grid container spacing={3}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.03) }}>
                                                        <CardContent>
                                                            <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <InfoIcon color="info" fontSize="small" />{' '}{uiText.snapshotMetaTitle}
                                                            </Typography>
                                                            <Stack spacing={1.5}>
                                                                <Box>
                                                                    <Typography variant="caption" color="text.secondary" display="block">{t('snapshot.captureTime')}</Typography>
                                                                    <Typography variant="body2" fontWeight={600}>{new Date(selectedSnapshot.capturedAt).toLocaleString()}</Typography>
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="caption" color="text.secondary" display="block">{t('snapshot.captureType')}</Typography>
                                                                    <Typography variant="body2" fontWeight={600} textTransform="capitalize">
                                                                        {selectedSnapshot.captureType === 'sync' ? uiText.snapshotTypeSync : uiText.snapshotTypeManual}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>

                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.03) }}>
                                                        <CardContent>
                                                            <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <AssignmentTurnedInIcon color="warning" fontSize="small" />{' '}{uiText.snapshotChangedTitle}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                                {(selectedSnapshot.changedFields || []).length > 0 ? (
                                                                    (selectedSnapshot.changedFields || []).map((field) => (
                                                                        <Chip key={`detail-${field}`} size="small" variant="outlined" label={field} sx={{ bgcolor: theme.palette.background.paper }} />
                                                                    ))
                                                                ) : (
                                                                    <Typography variant="body2" color="text.secondary">{uiText.notAvailable}</Typography>
                                                                )}
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>

                                                <Grid size={{ xs: 12 }}>
                                                    <Divider sx={{ my: 1 }} />
                                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1, mb: 1 }}>{uiText.snapshotFieldSummary}</Typography>
                                                </Grid>

                                                {Object.entries(selectedSnapshotFields).map(([key, value]) => (
                                                    <Grid key={key} size={{ xs: 12, md: 6 }}>
                                                        <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main' } }}>
                                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>
                                                                    {formatFieldLabel(key)}
                                                                </Typography>
                                                                <Box
                                                                    component="pre"
                                                                    sx={{
                                                                        m: 0,
                                                                        fontSize: (theme.typography.body2.fontSize as string) || '0.875rem',
                                                                        fontFamily: theme.typography.fontFamily,
                                                                        whiteSpace: 'pre-wrap',
                                                                        wordBreak: 'break-word',
                                                                        color: 'text.primary'
                                                                    }}
                                                                >
                                                                    {formatFieldValue(value)}
                                                                </Box>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Zoom>
                                    )}

                                    {tabIndex === 1 && locationId && selectedSnapshot && (
                                        <Box sx={{ mx: -1 }}>
                                            <AuditTab locationId={locationId} snapshotId={selectedSnapshot.id} />
                                        </Box>
                                    )}

                                    {tabIndex === 2 && (
                                        <Fade in={true}>
                                            <Box>
                                                <Stack direction="row" justifyContent="space-between" mb={1}>
                                                    <Typography variant="subtitle2">{uiText.snapshotRawJson}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{uiText.snapshotRawHint}</Typography>
                                                </Stack>
                                                <Box
                                                    component="pre"
                                                    sx={{
                                                        m: 0,
                                                        p: 2,
                                                        borderRadius: 2,
                                                        bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.5) : alpha(theme.palette.grey[900], 0.05),
                                                        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                                                        fontFamily: 'monospace',
                                                        fontSize: 13,
                                                        lineHeight: 1.5,
                                                        whiteSpace: 'pre',
                                                        overflow: 'auto',
                                                        maxHeight: 500,
                                                        color: theme.palette.text.primary
                                                    }}
                                                >
                                                    {JSON.stringify(selectedSnapshot.snapshot || {}, null, 2)}
                                                </Box>
                                            </Box>
                                        </Fade>
                                    )}
                                </Box>
                            </Box>
                        </Fade>
                    )}
                </Box>
            </Grid>
        </Grid>
    )
}
