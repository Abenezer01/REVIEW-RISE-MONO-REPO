import { alpha, Box, Button, Card, CardContent, Grid, IconButton, Stack, Tab, Tabs, Typography, useTheme } from '@mui/material'
import type { MetaCopyVariation } from '@platform/contracts'
import { useState } from 'react'

import { useTranslation } from '@/hooks/useTranslation'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

interface Props {
    data: MetaCopyVariation[]
}

export default function AdCopyVariations({ data }: Props) {
    const theme = useTheme()
    const t = useTranslation('blueprint')
    const [tabIndex, setTabIndex] = useState(0)

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const current = data[tabIndex]

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

    return (
        <Grid container spacing={3}>
            {/* Input / Variations Side */}
            <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Tabs
                        value={tabIndex}
                        onChange={(_, v) => setTabIndex(v)}
                        sx={{ minHeight: 40 }}
                    >
                        {data.map((d, i) => (
                            <Tab key={d.id} label={`${t('meta.results.adCopy.variation')} ${i + 1}`} sx={{ minHeight: 40, py: 1 }} />
                        ))}
                    </Tabs>
                    <Button
                        startIcon={<ContentCopyIcon />}
                        size="small"
                        onClick={() => handleCopy(`${current.primaryText}\n\n${current.headline}\n\n${current.description}`)}
                    >
                        {t('meta.results.adCopy.copyAll')}
                    </Button>
                </Box>

                {current && (
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
                                alignItems: 'center',
                                gap: 2
                            }}>
                                <CheckCircleIcon color="success" />
                                <Box>
                                    <Typography variant="subtitle2" color="success.main" fontWeight="bold">{t('meta.results.adCopy.compliant')}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('meta.results.adCopy.guide.optimized')}
                                    </Typography>
                                </Box>
                            </Box>

                            <PreviewBox label={t('meta.results.adCopy.primaryText')} text={current.primaryText} limit={125} />

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <PreviewBox label={t('meta.results.adCopy.headline')} text={current.headline} limit={40} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <PreviewBox label={t('meta.results.adCopy.description')} text={current.description} limit={25} />
                                </Grid>
                            </Grid>
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
