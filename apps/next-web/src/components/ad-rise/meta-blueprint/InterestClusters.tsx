import { alpha, Box, Card, CardContent, Chip, Typography, useTheme, Grid } from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { MetaInterestCluster } from '@platform/contracts'
import { useTranslation } from '@/hooks/useTranslation'

interface Props {
    data: MetaInterestCluster[]
}

export default function InterestClusters({ data }: Props) {
    const theme = useTheme()
    const t = useTranslation('ad-rise')

    return (
        <Grid container spacing={3}>
            {data.map((cluster, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: index === 0 ? alpha(theme.palette.primary.main, 0.1) : 'action.hover',
                                        color: index === 0 ? 'primary.main' : 'text.primary'
                                    }}>
                                        <VerifiedIcon fontSize="small" />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {cluster.theme}
                                        </Typography>
                                        {cluster.predictedIntentScore && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                                <Typography variant="caption" color="success.main" fontWeight="600">
                                                    {t('meta.results.interests.intentScore', { score: cluster.predictedIntentScore })}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                                <Chip
                                    label={t('meta.results.interests.interestsCount', { count: cluster.interests.length })}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {cluster.interests.map((interest, i) => (
                                        <Chip
                                            key={i}
                                            label={interest}
                                            size="small"
                                            sx={{
                                                bgcolor: index === 0 ? alpha(theme.palette.primary.main, 0.1) : 'action.selected',
                                                color: index === 0 ? 'primary.dark' : 'text.primary',
                                                fontWeight: 500
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {cluster.exclusions && cluster.exclusions.length > 0 && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="caption" color="error.main" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                                        {t('meta.results.interests.exclusions')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {cluster.exclusions.map((exclusion, i) => (
                                            <Chip
                                                key={i}
                                                label={exclusion}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    borderColor: alpha(theme.palette.error.main, 0.3),
                                                    color: 'error.main'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    )
}
