import { Box, Button, Chip, Grid, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { QUICK_TEMPLATES, type QuickTemplate } from '../data/quick-templates';

interface QuickTemplatesSectionProps {
    onSelectTemplate: (template: QuickTemplate) => void;
    t: (key: string) => string;
}

export function QuickTemplatesSection({ onSelectTemplate, t }: QuickTemplatesSectionProps) {
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
                        ⚡ Quick Start Templates
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Get started faster with pre-filled industry examples
                    </Typography>
                </Box>

                <Grid container spacing={1.5}>
                    {QUICK_TEMPLATES.map((template) => (
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
                                    {template.name}
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
                        💡 <strong>Tip:</strong> Templates are just starting points - you can modify all fields after selecting one
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
}
