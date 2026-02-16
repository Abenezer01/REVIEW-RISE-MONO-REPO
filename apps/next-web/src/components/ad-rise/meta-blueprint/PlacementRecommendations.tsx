import LightbulbIcon from '@mui/icons-material/Lightbulb'
import { alpha, Box, Card, CardContent, Chip, Stack, Typography, useTheme } from '@mui/material'
import type { MetaAdSet } from '@platform/contracts'

import { useTranslation } from '@/hooks/useTranslation'

interface Props {
    adSets: MetaAdSet[]
}

export default function PlacementRecommendations({ adSets }: Props) {
    const theme = useTheme()
    const t = useTranslation('blueprint')

    const formatPlacementName = (p: string) => {
        return p.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    return (
        <Stack spacing={2}>
            {adSets.map((adSet, index) => (
                <Card
                    key={index}
                    variant="outlined"
                >
                    <CardContent>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {adSet.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {adSet.optimizationGoal} • {adSet.budget.strategy}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {adSet.placements.map((placement, i) => (
                                <Chip
                                    key={i}
                                    label={formatPlacementName(placement)}
                                    size="small"
                                    icon={placement.includes('facebook') ? <Box component="span" sx={{ ml: 1 }}>F</Box> : <Box component="span" sx={{ ml: 1 }}>I</Box>}
                                />
                            ))}
                        </Box>

                        {/* Rationale Placeholder - Ideally comes from backend */}
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5
                        }}>
                            <LightbulbIcon fontSize="small" color="primary" />
                            <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
                                <strong>{t('meta.results.placements.strategyLabel')}</strong> {t('meta.results.placements.strategyText', { goal: adSet.optimizationGoal.toLowerCase() })}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    )
}
