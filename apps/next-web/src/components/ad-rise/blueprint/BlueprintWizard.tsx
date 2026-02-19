'use client';

import { useState } from 'react';
import { Box, Button, Chip, Grid, Stack, Step, StepLabel, Stepper, Typography, useTheme } from '@mui/material';
import type { BlueprintOutput } from '@platform/contracts';
import { BlueprintService } from '@/services/ad-rise/blueprint.service';
import BlueprintResults from './BlueprintResults';
import { useBlueprintForm } from './hooks/useBlueprintForm';
import { BusinessInfoSection } from './sections/BusinessInfoSection';
import { TargetingSection } from './sections/TargetingSection';
import { LandingPageSection } from './sections/LandingPageSection';
import { GenerateSection } from './sections/GenerateSection';
import { BlueprintPreviewPanel } from './sections/BlueprintPreviewPanel';
import { useTranslations } from 'next-intl';

export default function BlueprintWizard() {
    const t = useTranslations('blueprint');
    const theme = useTheme();

    // Wizard state
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<BlueprintOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form logic from custom hook
    const formLogic = useBlueprintForm();

    const steps = [
        t('steps.details'),
        t('steps.generate'),
        t('steps.results')
    ];

    const handleNext = async () => {
        if (activeStep === 0) {
            if (!formLogic.validateStep(0)) {
                setError(t('form.required'));

                return;
            }

            setError(null);
            setActiveStep(1);
        } else if (activeStep === 1) {
            setLoading(true);
            setError(null);

            try {
                const payload = { ...formLogic.formData };

                if (payload.landingPageUrl && !payload.landingPageUrl.startsWith('http')) {
                    payload.landingPageUrl = `https://${payload.landingPageUrl}`;
                }

                console.log('Sending blueprint request:', payload);

                const data = await BlueprintService.generate(payload);

                console.log('Blueprint received:', data);
                setResults(data);
                trackWizardComplete({ type: 'google_blueprint', businessName: formLogic.formData.businessName });
                setActiveStep(2);
            } catch (err: any) {
                console.error('Failed to generate blueprint', err);
                setError(err.message || t('errors.generation'));
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
        setError(null);
    };

    const trackWizardComplete = (data: any) => {
        // Analytics tracking placeholder
        console.log('Wizard complete:', data);
    };

    const getPreviewStats = () => {
        return {
            keywordClusters: '4-6',
            adGroups: '5-8',
            rsaHeadlines: '15',
            descriptions: '4',
            negativeKeywords: '25-30'
        };
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header */}
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    px: 6,
                    py: 2
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {t('title')}
                    </Typography>
                    <Chip label={t('badge')} color="primary" />
                </Stack>
            </Box>

            {/* Stepper */}
            <Box sx={{ bgcolor: 'background.paper', px: 6, py: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Stepper activeStep={activeStep}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            {/* Content */}
            <Box sx={{ px: 6, py: 4 }}>
                {error && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                        <Typography color="error.dark">{error}</Typography>
                    </Box>
                )}

                <Grid container spacing={3}>
                    {/* Main Content */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        {activeStep === 0 && (
                            <>
                                <BusinessInfoSection
                                    formData={formLogic.formData}
                                    setFormData={formLogic.setFormData}
                                    serviceInput={formLogic.serviceInput}
                                    setServiceInput={formLogic.setServiceInput}
                                    onAddService={formLogic.handleAddService}
                                    onRemoveService={formLogic.handleRemoveService}
                                    t={t}
                                />
                                <TargetingSection
                                    formData={formLogic.formData}
                                    setFormData={formLogic.setFormData}
                                    painPointInput={formLogic.painPointInput}
                                    setPainPointInput={formLogic.setPainPointInput}
                                    onAddPainPoint={formLogic.handleAddPainPoint}
                                    onRemovePainPoint={formLogic.handleRemovePainPoint}
                                    t={t}
                                />
                                <LandingPageSection
                                    formData={formLogic.formData}
                                    setFormData={formLogic.setFormData}
                                    t={t}
                                />
                            </>
                        )}

                        {activeStep === 1 && (
                            <GenerateSection
                                loading={loading}
                                formData={formLogic.formData}
                                t={t}
                            />
                        )}

                        {activeStep === 2 && results && (
                            <BlueprintResults results={results} />
                        )}

                        {/* Navigation Buttons */}
                        {activeStep < 2 && (
                            <Box sx={{ mt: 4 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={handleNext}
                                    disabled={loading || (activeStep === 0 && !formLogic.validateStep(0))}
                                    startIcon={activeStep === 1 ? <span>{t('icons.lightning')}</span> : null}
                                    sx={{
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {activeStep === 1 ? t('generate.button') : t('generate.continue')}
                                </Button>
                                {activeStep > 0 && (
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={handleBack}
                                        disabled={loading}
                                        sx={{ mt: 2 }}
                                    >
                                        {t('common.back')}
                                    </Button>
                                )}
                            </Box>
                        )}
                    </Grid>

                    {/* Preview Panel */}
                    {activeStep < 2 && (
                        <Grid size={{ xs: 12, md: 4 }}>
                            <BlueprintPreviewPanel
                                getPreviewStats={getPreviewStats}
                                onSelectTemplate={formLogic.applyTemplate}
                                t={t}
                            />
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Box>
    );
}
