import { Box, Button, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { META_QUICK_TEMPLATES, type MetaQuickTemplate } from '../data/meta-quick-templates';

interface MetaQuickTemplatesSectionProps {
    onSelectTemplate: (template: MetaQuickTemplate) => void;
    t: (key: string) => string;
}

export function MetaQuickTemplatesSection({ onSelectTemplate, t }: MetaQuickTemplatesSectionProps) {
    const theme = useTheme();

    return (
        <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {t('meta.quickTemplates.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('meta.quickTemplates.subtitle')}
            </Typography>
            <Stack spacing={1.5}>
                {META_QUICK_TEMPLATES.map((template) => {
                    const center = template.data.geoTargeting?.center;
                    const radius = template.data.geoTargeting?.radius;
                    const unit = template.data.geoTargeting?.unit;

                    return (
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
                                            {t(`meta.form.templates.${template.id}`)}
                                        </Typography>
                                    </Stack>
                                    {center && (
                                        <Typography variant="caption" color="text.secondary">
                                            {center}
                                            {radius && unit && ` • ${radius} ${t(`meta.form.radiusUnit.${unit}`)}`}
                                        </Typography>
                                    )}
                                </Box>
                                <Button size="small" variant="text" sx={{ minWidth: 'auto', px: 1 }}>
                                    {t('blueprint.preview.useArrow')}
                                </Button>
                            </Stack>
                        </Paper>
                    );
                })}
            </Stack>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}
            >
                {t('blueprint.preview.clickTemplateHelp')}
            </Typography>
        </Box>
    );
}
