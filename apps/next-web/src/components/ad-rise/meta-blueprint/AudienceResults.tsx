import { useTranslation } from '@/hooks/useTranslation';
import { alpha, Box, Card, CardContent, Grid, LinearProgress, Stack, Typography, useTheme, Chip } from '@mui/material';
import type { MetaAudience } from '@platform/contracts';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';

interface Props {
    prospecting: MetaAudience[];
    retargeting: MetaAudience[];
}

export default function AudienceResults({ prospecting, retargeting }: Props) {
    const theme = useTheme();
    const t = useTranslation('blueprint');

    const renderAudienceCard = (audience: MetaAudience, color: string) => (
        <Card variant="outlined" sx={{ height: '100%', borderColor: alpha(color, 0.3), position: 'relative', overflow: 'visible' }}>
            <Box
                sx={{
                    position: 'absolute',
                    top: -10,
                    right: 16,
                    bgcolor: color,
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 10,
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    boxShadow: 2
                }}
            >
                {t(`meta.results.stages.${audience.funnelStage}`)}
            </Box>
            <CardContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {audience.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip label={audience.type} size="small" variant="outlined" sx={{ borderColor: color, color: color, fontWeight: 500, height: 20, fontSize: '0.65rem' }} />
                        {audience.priorityScore && (
                            <Chip label={`${t('meta.results.audiences.predictedValue')}: ${audience.priorityScore}`} size="small" sx={{ bgcolor: alpha(color, 0.1), color: color, fontWeight: 600, height: 20, fontSize: '0.65rem' }} />
                        )}
                    </Box>
                </Box>

                <Stack spacing={2}>
                    {/* Geo */}
                    {audience.geo && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <LocationOnIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">{t('meta.results.audiences.geo')}</Typography>
                                <Typography variant="body2" fontWeight="500">
                                    {audience.geo.city} ({audience.geo.radius} {audience.geo.unit})
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Interests / Targeting */}
                    {audience.interests && audience.interests.length > 0 && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>{t('meta.results.audiences.interests')}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {audience.interests.slice(0, 5).map((cluster, i) => (
                                    <Chip key={i} label={cluster.theme} size="small" sx={{ fontSize: '0.7rem' }} />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Retargeting Specifics */}
                    {audience.retargeting && (
                        <Box>
                            <Typography variant="caption" color="text.secondary">{t('meta.results.audiences.retargetingSource')}</Typography>
                            <Typography variant="body2" fontWeight="500">
                                {audience.retargeting.source} • {audience.retargeting.windowDays} Days • {audience.retargeting.engagementType || t('common.all')}
                            </Typography>
                        </Box>
                    )}

                    {/* Size & Value */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', color: 'text.secondary', mb: 0.5 }}>
                                    <PeopleIcon sx={{ fontSize: 14 }} />
                                    <Typography variant="caption">{t('meta.results.audiences.size')}</Typography>
                                </Box>
                                <Typography variant="body2" fontWeight="bold">
                                    {audience.audienceSizeEstimate ? audience.audienceSizeEstimate.toLocaleString() : 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>{t('meta.results.audiences.predictedValue')}</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min((audience.predictedValue || 0) / 20, 100)} // Normalize mock value
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: alpha(color, 0.1),
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: color
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {t('meta.results.audiences.prospecting')}
                    <Chip label={prospecting.length} size="small" color="primary" />
                </Typography>
            </Grid>
            {prospecting.map((audience, i) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={`prospecting-${i}`}>
                    {renderAudienceCard(audience, theme.palette.primary.main)}
                </Grid>
            ))}

            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                <Typography variant="h6" color="info.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {t('meta.results.audiences.retargeting')}
                    <Chip label={retargeting.length} size="small" color="info" />
                </Typography>
            </Grid>
            {retargeting.map((audience, i) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={`retargeting-${i}`}>
                    {renderAudienceCard(audience, theme.palette.info.main)}
                </Grid>
            ))}
        </Grid>
    );
}
