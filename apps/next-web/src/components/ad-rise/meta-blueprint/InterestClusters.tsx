import { Box, Card, CardContent, Chip, Grid, Typography, useTheme, alpha } from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import { MetaInterestCluster } from '@platform/contracts'
import { useTranslation } from '@/hooks/useTranslation'

interface Props {
    data: MetaInterestCluster[]
}

export default function InterestClusters({ data }: Props) {
    const theme = useTheme()
    const t = useTranslation('blueprint')

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.map((cluster, index) => (
                <Card key={index} variant="outlined">
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: index === 0 ? alpha(theme.palette.primary.main, 0.1) : 'action.hover',
                                    color: index === 0 ? 'primary.main' : 'text.primary'
                                }}>
                                    <VerifiedIcon fontSize="small" />
                                </Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {cluster.name}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {t('meta.results.interests.interestsCount', { count: cluster.interests.length })}
                                </Typography>
                                <Typography variant="caption" color={index === 0 ? 'primary.main' : 'text.secondary'} fontWeight="600">
                                    {index === 0 ? t('meta.results.interests.primary') : t('meta.results.interests.secondary')}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                {t('meta.results.interests.includedInterests')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {cluster.interests.slice(0, 8).map((interest, i) => (
                                    <Chip
                                        key={i}
                                        label={interest}
                                        size="small"
                                        sx={{
                                            bgcolor: index === 0 ? 'primary.main' : 'action.selected',
                                            color: index === 0 ? 'common.white' : 'text.primary',
                                            fontWeight: 500
                                        }}
                                    />
                                ))}
                                {cluster.interests.length > 8 && (
                                    <Chip
                                        label={t('meta.results.interests.more', { count: cluster.interests.length - 8 })}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                    />
                                )}
                            </Box>
                        </Box>

                        {cluster.exclusions && cluster.exclusions.length > 0 && (
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    {t('meta.results.interests.exclusions')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {cluster.exclusions.map((exclusion, i) => (
                                        <Chip
                                            key={i}
                                            label={exclusion}
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            ))}
        </Box>
    )
}
