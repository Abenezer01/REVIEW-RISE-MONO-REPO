import { Box, Paper, TextField, Typography } from '@mui/material';
import type { BlueprintInput } from '@platform/contracts';

export interface LandingPageSectionProps {
    formData: BlueprintInput;
    setFormData: (data: BlueprintInput | ((prev: BlueprintInput) => BlueprintInput)) => void;
    t: (key: string) => string;
}

export function LandingPageSection({
    formData,
    setFormData,
    t
}: LandingPageSectionProps) {
    return (
        <Paper
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 3
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                {t('form.landingPage')}
            </Typography>

            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t('form.landingPageUrl')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    {t('form.landingPageHelp')}
                </Typography>
                <TextField
                    fullWidth
                    placeholder={t('form.landingPagePlaceholder')}
                    value={formData.landingPageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, landingPageUrl: e.target.value })}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.default'
                        }
                    }}
                />
            </Box>
        </Paper>
    );
}
