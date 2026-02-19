import { Box, Button, Grid, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { META_QUICK_TEMPLATES, type MetaQuickTemplate } from '../data/meta-quick-templates';

interface MetaQuickTemplatesSectionProps {
    onSelectTemplate: (template: MetaQuickTemplate) => void;
    t: (key: string) => string;
}

export function MetaQuickTemplatesSection({ onSelectTemplate, t }: MetaQuickTemplatesSectionProps) {
    const theme = useTheme();

    return (
        <Paper
            sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                borderRadius: 2,
                p: 3,
                mb: 3,
                border: `1px dashed ${theme.palette.primary.main}`
            }}
        >
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {t('meta.quickTemplates.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('meta.quickTemplates.subtitle')}
                    </Typography>
                </Box>

                <Grid container spacing={1.5}>
                    {META_QUICK_TEMPLATES.map((template) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={template.id}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => onSelectTemplate(template)}
                                sx={{
                                    p: 1.5,
                                    height: '100%',
                                    flexDirection: 'column',
                                    gap: 0.5,
                                    borderColor: theme.palette.divider,
                                    '&:hover': {
                                        borderColor: theme.palette.primary.main,
                                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                                    }
                                }}
                            >
                                <Typography variant="h5">{template.icon}</Typography>
                                <Typography variant="caption" fontWeight={500} textAlign="center">
                                    {t(`meta.form.templates.${template.id}`)}
                                </Typography>
                            </Button>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{
                    p: 1.5,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}>
                    <Typography variant="caption" color="info.main">
                        💡 <strong>{t('meta.quickTemplates.tip')}</strong> {t('meta.quickTemplates.tipText')}
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
}
