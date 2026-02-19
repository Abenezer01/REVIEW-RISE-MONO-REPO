import { Box, Button, Divider, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { QUICK_TEMPLATES, type QuickTemplate } from '../data/quick-templates';

export interface PreviewStats {
    keywordClusters: string;
    adGroups: string;
    rsaHeadlines: string;
    descriptions: string;
    negativeKeywords: string;
}

export interface BlueprintPreviewPanelProps {
    getPreviewStats: () => PreviewStats;
    onSelectTemplate: (template: QuickTemplate) => void;
    t: any;
}

export function BlueprintPreviewPanel({ getPreviewStats, onSelectTemplate, t }: BlueprintPreviewPanelProps) {
    const theme = useTheme();
    const stats = getPreviewStats();

    return (
        <Paper
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 3,
                position: 'sticky',
                top: 24
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.contrastText'
                    }}
                >
                    <Typography variant="h6">{t('icons.preview')}</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t('preview.title')}
                </Typography>
            </Stack>

            <Stack spacing={2}>
                {[
                    { label: t('preview.keywordClusters'), value: stats.keywordClusters },
                    { label: t('preview.adGroups'), value: stats.adGroups },
                    { label: t('preview.rsaHeadlines'), value: stats.rsaHeadlines },
                    { label: t('preview.descriptions'), value: stats.descriptions },
                    { label: t('preview.negativeKeywords'), value: stats.negativeKeywords }
                ].map((item, index) => (
                    <Stack
                        key={index}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                            p: 1.5,
                            bgcolor: 'background.default',
                            borderRadius: 1
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {item.label}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {item.value}
                        </Typography>
                    </Stack>
                ))}
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Paper
                sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                    borderRadius: 1,
                    p: 2
                }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'warning.main' }}>
                    {t('preview.whatYouGet')}
                </Typography>
                <Stack spacing={0.5}>
                    {[
                        t('preview.benefits.intentBased'),
                        t('preview.benefits.matchType'),
                        t('preview.benefits.negativeKeywords'),
                        t('preview.benefits.compliantCopy'),
                        t('preview.benefits.landingPageTips'),
                        t('preview.benefits.exportable')
                    ].map((item, index) => (
                        <Stack key={index} direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" color="success.main">✓</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {item}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </Paper>

            <Divider sx={{ my: 3 }} />

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    {t('icons.lightning')} {t('preview.quickStart')}
                </Typography>
                <Stack spacing={1.5}>
                    {QUICK_TEMPLATES.slice(0, 4).map((template) => (
                        <Paper
                            key={template.id}
                            onClick={() => onSelectTemplate(template)}
                            sx={{
                                p: 1.5,
                                bgcolor: 'background.default',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                    borderColor: 'primary.main',
                                    transform: 'translateX(4px)'
                                }
                            }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                        <Typography variant="body1">{template.icon}</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {template.name}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('icons.currency')}{(template.data.budget || 0).toLocaleString()} • {template.data.services?.length || 0} {t('preview.services')}
                                    </Typography>
                                </Box>
                                <Button size="small" variant="text" sx={{ minWidth: 'auto', px: 1 }}>
                                    {t('preview.useArrow')}
                                </Button>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>
                    {t('preview.clickTemplateHelp')}
                </Typography>
            </Box>
        </Paper>
    );
}
