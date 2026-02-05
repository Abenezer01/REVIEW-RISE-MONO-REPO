'use client';

import React, { useState } from 'react';

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    Typography,
    alpha,
    useTheme
} from '@mui/material';

import type { BlueprintInput, BlueprintOutput } from '@platform/contracts';

import { useTranslation } from '@/hooks/useTranslation';
import { BlueprintService } from '@/services/ad-rise/blueprint.service';

import BlueprintResults from './BlueprintResults';

export default function BlueprintWizard() {
    const t = useTranslation('blueprint');
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<BlueprintOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const verticals = [
        { id: 'localService', value: 'Local Service', label: t('form.verticals.localService'), icon: t('icons.localService') },
        { id: 'ecommerce', value: 'E-commerce', label: t('form.verticals.ecommerce'), icon: t('icons.ecommerce') },
        { id: 'saas', value: 'SaaS', label: t('form.verticals.saas'), icon: t('icons.saas') },
        { id: 'healthcare', value: 'Healthcare', label: t('form.verticals.healthcare'), icon: t('icons.healthcare') }
    ];

    const steps = [
        { number: 1, label: t('steps.campaignDetails') },
        { number: 2, label: t('steps.generate') },
        { number: 3, label: t('steps.review') }
    ];

    const [formData, setFormData] = useState<BlueprintInput>({
        offerOrService: '',
        vertical: 'Local Service',
        geoTargeting: [],
        painPoints: [],
        landingPageUrl: '',
    });

    const [locationInput, setLocationInput] = useState('');
    const [painPointInput, setPainPointInput] = useState('');

    const handleNext = async () => {
        if (activeStep === 0) {
            if (!formData.offerOrService) {
                setError(t('form.required'));

                return;
            }

            setError(null);
            setActiveStep(1);
        } else if (activeStep === 1) {
            setLoading(true);
            setError(null);

            try {
                const payload = { ...formData };

                if (payload.landingPageUrl && !payload.landingPageUrl.startsWith('http')) {
                    payload.landingPageUrl = `https://${payload.landingPageUrl}`;
                }

                console.log('Sending blueprint request:', payload);

                const data = await BlueprintService.generate(payload);

                console.log('Blueprint received:', data);
                setResults(data);
                setActiveStep(2);
            } catch (err: any) {
                console.error('Failed to generate blueprint', err);
                setError(err.message || 'Generation failed. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
        setError(null);
    };

    const handleAddLocation = () => {
        if (locationInput.trim()) {
            setFormData(prev => ({ ...prev, geoTargeting: [...prev.geoTargeting, locationInput.trim()] }));
            setLocationInput('');
        }
    };

    const handleAddPainPoint = () => {
        if (painPointInput.trim()) {
            setFormData(prev => ({ ...prev, painPoints: [...prev.painPoints, painPointInput.trim()] }));
            setPainPointInput('');
        }
    };

    const handleRemoveLocation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            geoTargeting: prev.geoTargeting.filter((_, idx) => idx !== index)
        }));
    };

    const handleRemovePainPoint = (index: number) => {
        setFormData(prev => ({
            ...prev,
            painPoints: prev.painPoints.filter((_, idx) => idx !== index)
        }));
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
                    <Stack direction="row" alignItems="center" spacing={2}>
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
                            <Typography variant="h6">{t('icons.wizard')}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {t('title')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {t('subtitle')}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" size="small">
                            {t('header.history')}
                        </Button>
                        <Button variant="outlined" size="small">
                            {t('header.myBlueprints')}
                        </Button>
                        <Button variant="contained" size="small">
                            {t('header.account')}
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* Main Content */}
            <Box sx={{ px: 6, py: 4 }}>
                <Grid container spacing={4}>
                    {/* Left Side - Form */}
                    <Grid size={{ xs: 12, md: activeStep === 2 ? 12 : 8 }}>
                        {/* Step Indicator */}
                        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                            {steps.map((step, index) => (
                                <React.Fragment key={step.number}>
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: index <= activeStep ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                                                color: index <= activeStep ? 'primary.contrastText' : 'text.secondary',
                                                fontWeight: 600,
                                                fontSize: '1rem',
                                                transition: 'all 0.3s ease',
                                                border: index === activeStep ? `2px solid ${theme.palette.primary.main}` : 'none'
                                            }}
                                        >
                                            {step.number}
                                        </Box>
                                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: index <= activeStep ? 'text.primary' : 'text.secondary',
                                                    fontWeight: index === activeStep ? 600 : 400
                                                }}
                                            >
                                                {step.label}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    {index < steps.length - 1 && (
                                        <Box
                                            sx={{
                                                flex: 0.3,
                                                height: 2,
                                                bgcolor: index < activeStep ? 'primary.main' : alpha(theme.palette.primary.main, 0.2),
                                                alignSelf: 'center',
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </Stack>

                        {/* Error Alert */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {/* Step 1: Campaign Details */}
                        {activeStep === 0 && (
                            <Box>
                                {/* Business Information */}
                                <Paper
                                    sx={{
                                        bgcolor: 'background.paper',
                                        borderRadius: 2,
                                        p: 3,
                                        mb: 3
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {t('form.businessInfo')}
                                        </Typography>
                                        <Chip label={t('form.required')} color="primary" size="small" />
                                    </Stack>

                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {t('form.offerService')}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                                            {t('form.offerServiceHelp')}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            placeholder={t('form.offerServicePlaceholder')}
                                            value={formData.offerOrService}
                                            onChange={(e) => setFormData({ ...formData, offerOrService: e.target.value })}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    bgcolor: 'background.default'
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                            {t('form.industryVertical')}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {verticals.map((v) => (
                                                <Grid size={{ xs: 6, sm: 3 }} key={v.id}>
                                                    <Paper
                                                        elevation={0}
                                                        onClick={() => {
                                                            setFormData({ ...formData, vertical: v.value as any });
                                                        }}
                                                        sx={{
                                                            p: 2,
                                                            textAlign: 'center',
                                                            cursor: 'pointer',
                                                            border: `2px solid ${formData.vertical === v.value ? theme.palette.primary.main : theme.palette.divider}`,
                                                            borderRadius: 2,
                                                            bgcolor: formData.vertical === v.value ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                borderColor: theme.palette.primary.main,
                                                                transform: 'translateY(-2px)'
                                                            }
                                                        }}
                                                    >
                                                        <Typography variant="h4" sx={{ mb: 1 }}>
                                                            {v.icon}
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {v.label}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>

                                    </Box>
                                </Paper>

                                {/* Targeting & Keywords */}
                                <Paper
                                    sx={{
                                        bgcolor: 'background.paper',
                                        borderRadius: 2,
                                        p: 3,
                                        mb: 3
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                        {t('form.targetingKeywords')}
                                    </Typography>

                                    {/* Geographic Targeting */}
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {t('form.geoTargeting')}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                                            {t('form.geoTargetingHelp')}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder={t('form.geoTargetingPlaceholder')}
                                                value={locationInput}
                                                onChange={(e) => setLocationInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        bgcolor: 'background.default'
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="outlined"
                                                onClick={handleAddLocation}
                                                disabled={!locationInput.trim()}
                                                sx={{ minWidth: 80 }}
                                            >
                                                {t('form.add')}
                                            </Button>
                                        </Stack>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                            {formData.geoTargeting.map((loc, i) => (
                                                <Chip
                                                    key={i}
                                                    label={loc}
                                                    onDelete={() => handleRemoveLocation(i)}
                                                    sx={{
                                                        bgcolor: 'primary.main',
                                                        color: 'primary.contrastText',
                                                        '& .MuiChip-deleteIcon': {
                                                            color: 'primary.contrastText'
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>

                                    {/* Customer Pain Points */}
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {t('form.painPoints')}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                                            {t('form.painPointsHelp')}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            placeholder={t('form.painPointsPlaceholder')}
                                            value={painPointInput}
                                            onChange={(e) => setPainPointInput(e.target.value)}
                                            sx={{
                                                mb: 1.5,
                                                '& .MuiOutlinedInput-root': {
                                                    bgcolor: 'background.default'
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="outlined"
                                            onClick={handleAddPainPoint}
                                            disabled={!painPointInput.trim()}
                                            fullWidth
                                        >
                                            {t('form.addPainPoint')}
                                        </Button>
                                        {formData.painPoints.length > 0 && (
                                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                                                {formData.painPoints.map((pp, i) => (
                                                    <Chip
                                                        key={i}
                                                        label={pp}
                                                        onDelete={() => handleRemovePainPoint(i)}
                                                        color="secondary"
                                                    />
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                </Paper>

                                {/* Landing Page */}
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
                                        <Stack direction="row" spacing={1}>
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
                                            <Button
                                                variant="contained"
                                                color="success"
                                                sx={{ minWidth: 100 }}
                                            >
                                                {t('form.validate')}
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Paper>
                            </Box>
                        )}

                        {/* Step 2: Generate */}
                        {activeStep === 1 && (
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
                                                <strong>{t('generate.service')}</strong> {formData.offerOrService}
                                                <br />
                                                <strong>{t('generate.vertical')}</strong> {formData.vertical}
                                                <br />
                                                <strong>{t('generate.locations')}</strong> {formData.geoTargeting.length > 0 ? formData.geoTargeting.join(', ') : 'None'}
                                                <br />
                                                <strong>{t('generate.painPoints')}</strong> {formData.painPoints.length}
                                            </Typography>
                                        </Paper>
                                    </>
                                )}
                            </Paper>
                        )}

                        {/* Step 3: Results */}
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
                                    disabled={loading || (activeStep === 0 && !formData.offerOrService)}
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

                    {/* Right Side - Preview Panel */}
                    {
                        activeStep < 2 && (
                            <Grid size={{ xs: 12, md: 4 }}>
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
                                            { label: t('preview.keywordClusters'), value: getPreviewStats().keywordClusters },
                                            { label: t('preview.adGroups'), value: getPreviewStats().adGroups },
                                            { label: t('preview.rsaHeadlines'), value: getPreviewStats().rsaHeadlines },
                                            { label: t('preview.descriptions'), value: getPreviewStats().descriptions },
                                            { label: t('preview.negativeKeywords'), value: getPreviewStats().negativeKeywords }
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
                                            {t('preview.quickStart')}
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            {[
                                                { title: t('preview.templates.emergency'), desc: t('preview.templates.emergencyDesc') },
                                                { title: t('preview.templates.local'), desc: t('preview.templates.localDesc') },
                                                { title: t('preview.templates.competitor'), desc: t('preview.templates.competitorDesc') }
                                            ].map((template, index) => (
                                                <Paper
                                                    key={index}
                                                    sx={{
                                                        p: 1.5,
                                                        bgcolor: 'background.default',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                            borderColor: 'primary.main'
                                                        }
                                                    }}
                                                >
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {template.title}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {template.desc}
                                                            </Typography>
                                                        </Box>
                                                        <Button size="small" variant="outlined">
                                                            {t('preview.use')}
                                                        </Button>
                                                    </Stack>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Paper>
                            </Grid>
                        )
                    }
                </Grid >
            </Box >
        </Box >
    );
}
