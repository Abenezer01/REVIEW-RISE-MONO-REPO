import { Box, CircularProgress, LinearProgress, Paper, Typography, alpha, useTheme } from '@mui/material';
import type { BlueprintInput } from '@platform/contracts';

export interface GenerateSectionProps {
    loading: boolean;
    formData: BlueprintInput;
    t: any;
}

export function GenerateSection({ loading, formData, t }: GenerateSectionProps) {
    const theme = useTheme();

    return (
        <Paper
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 6,
                textAlign: 'center'
            }}
        >
            {loading ? (
                <>
                    <CircularProgress size={60} sx={{ mb: 3 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {t('generate.loadingTitle')}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {t('generate.loadingText')}
                    </Typography>
                    <LinearProgress sx={{ maxWidth: 400, mx: 'auto' }} />
                </>
            ) : (
                <>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3
                        }}
                    >
                        <Typography variant="h3">✓</Typography>
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                        {t('generate.readyTitle')}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                        {t('generate.readyText')}
                    </Typography>
                    <Paper
                        sx={{
                            bgcolor: alpha(theme.palette.info.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                            p: 2,
                            maxWidth: 500,
                            mx: 'auto',
                            textAlign: 'left'
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            <strong>{t('generate.businessName')}</strong> {formData.businessName}
                            <br />
                            <strong>{t('generate.service')}</strong> {formData.services.join(', ')}
                            <br />
                            <strong>{t('generate.offer')}</strong> {formData.offer}
                            <br />
                            <strong>{t('generate.vertical')}</strong> {formData.vertical}
                            <br />
                            <strong>{t('generate.location')}</strong> {formData.geo || 'None'}
                            <br />
                            <strong>{t('generate.budget')}</strong> {t('icons.currency')}{formData.budget}
                            <br />
                            <strong>{t('generate.objective')}</strong> {formData.objective}
                            <br />
                            <strong>{t('generate.painPoints')}</strong> {formData.painPoints?.length || 0}
                        </Typography>
                    </Paper>
                </>
            )}
        </Paper>
    );
}
