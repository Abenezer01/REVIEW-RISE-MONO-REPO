import LightbulbIcon from '@mui/icons-material/Lightbulb'
import { alpha, Box, Card, CardContent, Chip, Stack, Typography, useTheme } from '@mui/material'
import type { PlacementRecommendation } from '@platform/contracts'

import { useTranslation } from '@/hooks/useTranslation'

interface Props {
    data: PlacementRecommendation[]
}

export default function PlacementRecommendations({ data }: Props) {
    const theme = useTheme()
    const t = useTranslation('blueprint')

    return (
        <Stack spacing={2}>
            {data.map((placement, index) => (
                <Card
                    key={index}
                    variant="outlined"
                    sx={{
                        borderColor: placement.recommended ? alpha(theme.palette.success.main, 0.5) : undefined,
                        bgcolor: placement.recommended ? alpha(theme.palette.success.main, 0.02) : undefined
                    }}
                >
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {placement.platform} {placement.format}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {placement.rationale?.slice(0, 60)}...
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {placement.recommended && (
                                    <Chip
                                        label={t('meta.results.placements.highImpact')}
                                        size="small"
                                        color="warning"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                )}
                                <Chip
                                    label={t(`meta.results.placements.objectives.${placement.objective}`)}
                                    size="small"
                                    color="success"
                                />
                            </Box>
                        </Box>

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
                                <strong>{t('meta.results.placements.why')}:</strong> {placement.rationale}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    )
}
