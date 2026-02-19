import LightbulbIcon from '@mui/icons-material/Lightbulb'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { alpha, Box, Card, CardContent, Chip, Stack, Typography, useTheme } from '@mui/material'
import type { MetaAdSet } from '@platform/contracts'

interface Props {
    adSets: MetaAdSet[]
}

export default function PlacementRecommendations({ adSets }: Props) {
    const theme = useTheme()

    const formatPlacementName = (p: string) =>
        p.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

    const isRetargeting = (name: string) => name.toLowerCase().includes('retargeting')

    return (
        <Stack spacing={3}>
            {adSets.map((adSet, index) => {
                const color = isRetargeting(adSet.name)
                    ? theme.palette.warning.main
                    : theme.palette.primary.main

                return (
                    <Card key={index} variant="outlined" sx={{ borderColor: alpha(color, 0.3) }}>
                        <CardContent>
                            {/* Header */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {adSet.name}
                                </Typography>
                                {adSet.placementStrategy && (
                                    <Chip
                                        label={adSet.placementStrategy}
                                        size="small"
                                        sx={{ mt: 0.5, bgcolor: alpha(color, 0.1), color: color, fontWeight: 600, fontSize: '0.7rem' }}
                                    />
                                )}
                            </Box>

                            {/* Placement Chips */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {adSet.placements.map((placement, i) => (
                                    <Chip
                                        key={i}
                                        label={formatPlacementName(placement)}
                                        size="small"
                                        variant="outlined"
                                        sx={{ borderColor: alpha(color, 0.4), color: 'text.primary', fontSize: '0.7rem' }}
                                        icon={
                                            <Box component="span" sx={{ ml: 1, fontSize: '0.65rem', color: color }}>
                                                {placement.includes('facebook') ? 'FB' : 'IG'}
                                            </Box>
                                        }
                                    />
                                ))}
                            </Box>

                            {/* Rationale — from backend */}
                            {adSet.placementRationale && (
                                <Box sx={{
                                    p: 1.5, borderRadius: 1,
                                    bgcolor: alpha(color, 0.06),
                                    display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2
                                }}>
                                    <LightbulbIcon fontSize="small" sx={{ color, mt: 0.2, flexShrink: 0 }} />
                                    <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
                                        {adSet.placementRationale}
                                    </Typography>
                                </Box>
                            )}

                            {/* Actionable Notes */}
                            {adSet.placementNotes && adSet.placementNotes.length > 0 && (
                                <Stack spacing={1}>
                                    {adSet.placementNotes.map((note, i) => {
                                        const isWarning = note.includes('⚠️') || note.toLowerCase().includes('pause') || note.toLowerCase().includes('cap')
                                        return (
                                            <Box key={i} sx={{
                                                display: 'flex', alignItems: 'flex-start', gap: 1,
                                                p: 1, borderRadius: 1,
                                                bgcolor: isWarning
                                                    ? alpha(theme.palette.warning.main, 0.06)
                                                    : alpha(theme.palette.info.main, 0.04)
                                            }}>
                                                {isWarning
                                                    ? <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main', mt: 0.3, flexShrink: 0 }} />
                                                    : <InfoOutlinedIcon sx={{ fontSize: 14, color: 'info.main', mt: 0.3, flexShrink: 0 }} />
                                                }
                                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                                    {note}
                                                </Typography>
                                            </Box>
                                        )
                                    })}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </Stack>
    )
}
