import { alpha, Box, Button, Card, CardContent, Grid, IconButton, Stack, Tab, Tabs, Typography, useTheme, Chip } from '@mui/material'
import type { MetaCreative } from '@platform/contracts'
import { useState } from 'react'

import { useTranslation } from '@/hooks/useTranslation'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

interface CreativeWithContext {
    creative: MetaCreative;
    audienceName: string;
    stage: string;
}

interface Props {
    data: CreativeWithContext[]
}

export default function AdCopyVariations({ data }: Props) {
    const theme = useTheme()
    const t = useTranslation('ad-rise')
    const [tabIndex, setTabIndex] = useState(0)

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const currentItem = data[tabIndex]
    const currentCreative = currentItem?.creative;

    const PreviewBox = ({ label, text, limit }: { label: string, text: string, limit: number }) => {
        const charCount = text.length;
        const isNearLimit = charCount > limit * 0.9;
        const isOverLimit = charCount > limit;

        return (
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography
                        variant="caption"
                        color={isOverLimit ? 'error.main' : isNearLimit ? 'warning.main' : 'success.main'}
                        fontWeight="bold"
                    >
                        {t('meta.results.adCopy.chars', { count: charCount, limit })}
                    </Typography>
                </Box>
                <Box sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    '&:hover .copy-btn': { opacity: 1 }
                }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{text}</Typography>
                    <IconButton
                        className="copy-btn"
                        size="small"
                        onClick={() => handleCopy(text)}
                        sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            opacity: 0,
                            bgcolor: 'background.paper',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
        )
    }

    if (!data || data.length === 0) return null;

    return (
        <Grid container spacing={3}>
            {/* Input / Variations Side */}
            <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ mb: 2 }}>
                    <Tabs
                        value={tabIndex}
                        onChange={(_, v) => setTabIndex(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ minHeight: 40 }}
                    >
                        {data.map((d, i) => (
                            <Tab
                                key={i}
                                label={
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography variant="caption" display="block" color="text.secondary">{d.stage} - {d.audienceName.slice(0, 15)}...</Typography>
                                        <Typography variant="body2" fontWeight="bold">{t('meta.results.adCopy.variation')} {i + 1}</Typography>
                                    </Box>
                                }
                                sx={{ minHeight: 50, py: 1, alignItems: 'flex-start' }}
                            />
                        ))}
                    </Tabs>
                </Box>

                {currentItem && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            startIcon={<ContentCopyIcon />}
                            size="small"
                            onClick={() => handleCopy(`${currentCreative.primaryText[0]}\n\n${currentCreative.headlines[0]}\n\n${currentCreative.descriptions?.[0] || ''}`)}
                        >
                            {t('meta.results.adCopy.copyAll')}
                        </Button>
                    </Box>
                )}

                {currentCreative && (
                    <Card variant="outlined">
                        <CardContent>
                            <Box sx={{
                                mb: 3,
                                p: 2,
                                bgcolor: alpha(theme.palette.success.main, 0.05),
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.success.main, 0.2),
                                display: 'flex',
                                alignItems: 'center', gap: 2
                            }}>
                                <CheckCircleIcon color="success" />
                                <Box>
                                    <Typography variant="subtitle2" color="success.main" fontWeight="bold">{t('meta.results.adCopy.compliant')}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('meta.results.adCopy.guide.optimized')} {t('meta.results.adCopy.for')} {currentItem.stage}
                                    </Typography>
                                </Box>
                            </Box>

                            <PreviewBox label={t('meta.results.adCopy.primaryText')} text={currentCreative.primaryText[0]} limit={125} />

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <PreviewBox label={t('meta.results.adCopy.headline')} text={currentCreative.headlines[0]} limit={40} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <PreviewBox label={t('meta.results.adCopy.description')} text={currentCreative.descriptions?.[0] || ''} limit={25} />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">{t('meta.results.adCopy.callToAction')}</Typography>
                                <Chip label={currentCreative.callToAction} size="small" color="primary" />
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Grid>

            {/* Sidebar Guide */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ height: '100%', bgcolor: 'background.default' }}>
                    <CardContent>
                        <Typography variant="subtitle2" gutterBottom>{t('meta.results.adCopy.characterLimits')}</Typography>
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography color="primary" fontWeight="bold" variant="h6">Aa</Typography>
                                    <Typography variant="caption" fontWeight="bold">{t('meta.results.adCopy.primaryText')}: {t('meta.results.adCopy.charsLimit', { count: 125 })}</Typography>
                                </Stack>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {t('meta.results.adCopy.guide.primaryText')}
                                </Typography>
                            </Box>
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography color="primary" fontWeight="bold" variant="h6">Aa</Typography>
                                    <Typography variant="caption" fontWeight="bold">{t('meta.results.adCopy.headline')}: {t('meta.results.adCopy.charsLimit', { count: 40 })}</Typography>
                                </Stack>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {t('meta.results.adCopy.guide.headline')}
                                </Typography>
                            </Box>
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography color="primary" fontWeight="bold" variant="h6">Aa</Typography>
                                    <Typography variant="caption" fontWeight="bold">{t('meta.results.adCopy.description')}: {t('meta.results.adCopy.charsLimit', { count: 30 })}</Typography>
                                </Stack>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {t('meta.results.adCopy.guide.description')}
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}
