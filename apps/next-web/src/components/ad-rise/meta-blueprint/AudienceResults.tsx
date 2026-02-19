import { useTranslation } from '@/hooks/useTranslation';
import { alpha, Box, Card, CardContent, Chip, Grid, LinearProgress, Stack, Typography, useTheme } from '@mui/material';
import type { MetaAdSet, MetaAudience, MetaCampaign } from '@platform/contracts';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import TargetIcon from '@mui/icons-material/TrackChanges';
import WarmIcon from '@mui/icons-material/Whatshot';

interface Props {
    prospecting: MetaCampaign;
    retargeting: MetaCampaign;
}

export default function AudienceResults({ prospecting, retargeting }: Props) {
    const theme = useTheme();
    const t = useTranslation('blueprint');

    // Extract audiences from ad sets (the new structure)
    const prospectingAudiences = prospecting.adSets.map(a => a.audience);
    const retargetingAudiences = retargeting.adSets.map(a => a.audience);

    const renderAudienceCard = (audience: MetaAudience, adSet: MetaAdSet, color: string) => (
        <Card variant="outlined" sx={{ height: '100%', borderColor: alpha(color, 0.3), position: 'relative', overflow: 'visible' }}>
            {/* Funnel Stage Badge */}
            <Box sx={{
                position: 'absolute', top: -10, right: 16,
                bgcolor: color, color: 'white',
                px: 1.5, py: 0.5, borderRadius: 10,
                fontSize: '0.7rem', fontWeight: 'bold', boxShadow: 2
            }}>
                {audience.funnelStage}
            </Box>

            <CardContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ pr: 6 }}>
                        {audience.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip
                            label={audience.type}
                            size="small" variant="outlined"
                            sx={{ borderColor: color, color: color, fontWeight: 500, height: 20, fontSize: '0.65rem' }}
                        />
                        {audience.priorityScore && (
                            <Chip
                                label={`Priority: ${audience.priorityScore}`}
                                size="small"
                                sx={{ bgcolor: alpha(color, 0.1), color: color, fontWeight: 600, height: 20, fontSize: '0.65rem' }}
                            />
                        )}
                        {adSet.budget.amount > 0 && (
                            <Chip
                                label={`$${adSet.budget.amount}/day`}
                                size="small"
                                sx={{ bgcolor: alpha(color, 0.08), color: color, height: 20, fontSize: '0.65rem' }}
                            />
                        )}
                    </Box>
                </Box>

                <Stack spacing={2}>
                    {/* Geo */}
                    {audience.geo && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <LocationOnIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">Geo Target</Typography>
                                <Typography variant="body2" fontWeight="500">
                                    {audience.geo.city} ({audience.geo.radius} {audience.geo.unit})
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Interest Clusters */}
                    {audience.interests && audience.interests.length > 0 && audience.interests[0].interests.length > 0 && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                Interest Cluster: {audience.interests[0].theme}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {audience.interests[0].interests.slice(0, 5).map((interest, i) => (
                                    <Chip key={i} label={interest} size="small" sx={{ fontSize: '0.7rem' }} />
                                ))}
                            </Box>
                            {audience.exclusions && audience.exclusions.length > 0 && (
                                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                                    Excludes: {audience.exclusions.slice(0, 3).join(', ')}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Broad — no interests */}
                    {audience.type === 'Broad' && (!audience.interests || audience.interests.length === 0 || audience.interests[0].interests.length === 0) && (
                        <Box sx={{ p: 1.5, bgcolor: alpha(color, 0.06), borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                🎯 <strong>Algorithm-Led Targeting</strong> — No interest restrictions. Meta finds the buyers.
                            </Typography>
                        </Box>
                    )}

                    {/* Retargeting Specifics */}
                    {audience.retargeting && (
                        <Box>
                            <Typography variant="caption" color="text.secondary">Retargeting Source</Typography>
                            <Typography variant="body2" fontWeight="500">
                                {audience.retargeting.source} • {audience.retargeting.windowDays} Days
                                {audience.retargeting.engagementType ? ` • ${audience.retargeting.engagementType}` : ''}
                            </Typography>
                            {audience.retargeting.minAudienceSize && (
                                <Typography variant="caption" color="warning.main">
                                    Min audience: {audience.retargeting.minAudienceSize.toLocaleString()} (pauses if below)
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Size */}
                    {audience.audienceSizeEstimate && (
                        <Box sx={{ mt: 1, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', color: 'text.secondary', mb: 0.5 }}>
                                <PeopleIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption">Est. Audience Size</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="bold">
                                ~{audience.audienceSizeEstimate.toLocaleString()}
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );

    return (
        <Grid container spacing={3}>
            {/* Prospecting Section */}
            <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <TargetIcon color="primary" />
                    <Typography variant="h6" color="primary" fontWeight="bold">
                        Prospecting Campaign — {prospecting.budgetOptimization}
                    </Typography>
                    <Chip label={`${prospecting.adSets.length} Ad Set${prospecting.adSets.length !== 1 ? 's' : ''}`} size="small" color="primary" />
                    <Chip label={`$${prospecting.totalBudget.toFixed(0)}/mo`} size="small" variant="outlined" color="primary" />
                </Box>
            </Grid>
            {prospecting.adSets.map((adSet, i) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={`prospecting-${i}`}>
                    {renderAudienceCard(adSet.audience, adSet, theme.palette.primary.main)}
                </Grid>
            ))}

            {/* Retargeting Section */}
            {retargeting.adSets.length > 0 && (
                <>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <WarmIcon sx={{ color: theme.palette.warning.main }} />
                            <Typography variant="h6" sx={{ color: 'warning.main' }} fontWeight="bold">
                                Retargeting Campaign — ABO (Always)
                            </Typography>
                            <Chip label={`${retargeting.adSets.length} Ad Set${retargeting.adSets.length !== 1 ? 's' : ''}`} size="small" color="warning" />
                            <Chip label={`$${retargeting.totalBudget.toFixed(0)}/mo`} size="small" variant="outlined" color="warning" />
                        </Box>
                    </Grid>
                    {retargeting.adSets.map((adSet, i) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={`retargeting-${i}`}>
                            {renderAudienceCard(adSet.audience, adSet, theme.palette.warning.main)}
                        </Grid>
                    ))}
                </>
            )}

            {/* No Retargeting — Budget Tier Message */}
            {retargeting.adSets.length === 0 && (
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ p: 2.5, bgcolor: alpha(theme.palette.warning.main, 0.08), borderRadius: 2, border: `1px dashed ${alpha(theme.palette.warning.main, 0.3)}` }}>
                        <Typography variant="body2" color="warning.dark" fontWeight="500">
                            🔒 Retargeting Locked — Requires $1,500+/mo
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            At your current budget, retargeting would cause audience burnout before generating enough signal. Increase budget to unlock full-funnel structure.
                        </Typography>
                    </Box>
                </Grid>
            )}
        </Grid>
    );
}
