import { Box, Card, CardContent, Chip, Grid, LinearProgress, Typography, useTheme, alpha, Stack } from '@mui/material'
import { MetaAudienceSet } from '@platform/contracts'
import { useTranslations } from 'next-intl';

interface Props {
    data: MetaAudienceSet[]
}

export default function AudienceResults({ data }: Props) {
    const theme = useTheme();
    const t = useTranslations('blueprint')

    const prospecting = data.find(d => d.type === 'Prospecting')
    const retargeting = data.find(d => d.type === 'Retargeting')

    const renderAudienceCard = (audience: MetaAudienceSet, color: string) => (
        <Card variant="outlined" sx={{ height: '100%', borderColor: alpha(color, 0.3) }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {audience.type === 'Prospecting' ? t('meta.results.audiences.prospecting') : t('meta.results.audiences.retargeting')}
                    </Typography>
                </Box>

                <Stack spacing={2}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">{t('meta.results.audiences.demographics')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {audience.demographics.ageRange && `${t('meta.results.audiences.age')}: ${audience.demographics.ageRange}`}
                            {audience.demographics.gender && `, ${t('meta.results.audiences.gender')}: ${audience.demographics.gender}`}
                            {audience.demographics.languages && `, ${t('meta.results.audiences.languages')}: ${audience.demographics.languages.join(', ')}`}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary">{t('meta.results.audiences.geoLocations')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {audience.geoLocations.join(', ')}
                        </Typography>
                    </Box>

                    {audience.interests && audience.interests.length > 0 && (
                        <Box>
                            <Typography variant="caption" color="text.secondary">{t('meta.results.audiences.interests')}</Typography>
                            <Typography variant="body2">
                                {audience.interests.slice(0, 3).join(', ')}
                                {audience.interests.length > 3 && ` +${audience.interests.length - 3} more`}
                            </Typography>
                        </Box>
                    )}

                    {audience.customAudiences && audience.customAudiences.length > 0 && (
                        <Box>
                            <Typography variant="caption" color="text.secondary">{t('meta.results.audiences.customAudiences')}</Typography>
                            <Typography variant="body2">
                                {audience.customAudiences.join(', ')}
                            </Typography>
                        </Box>
                    )}

                    {audience.lookalikeSources && audience.lookalikeSources.length > 0 && (
                        <Box>
                            <Typography variant="caption" color="text.secondary">{t('meta.results.audiences.lookalikeSources')}</Typography>
                            <Typography variant="body2">
                                {audience.lookalikeSources.join(', ')}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">{t('meta.results.audiences.estimatedReach')}</Typography>
                            <Typography variant="caption" fontWeight="bold">
                                {audience.estimatedReach || 'N/A'}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={audience.type === 'Prospecting' ? 85 : 45}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: alpha(color, 0.1),
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: color
                                }
                            }}
                        />
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    )

    return (
        <Grid container spacing={3}>
            {prospecting && (
                <Grid size={{ xs: 12, md: 6 }}>
                    {renderAudienceCard(prospecting, theme.palette.primary.main)}
                </Grid>
            )}
            {retargeting && (
                <Grid size={{ xs: 12, md: 6 }}>
                    {renderAudienceCard(retargeting, theme.palette.info.main)}
                </Grid>
            )}
        </Grid>
    )
}
