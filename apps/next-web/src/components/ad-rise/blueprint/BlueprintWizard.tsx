'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Chip,
    Stack,
    Grid,
    Paper,
    alpha,
    useTheme,
    Alert,
    LinearProgress,
    Divider
} from '@mui/material';
import { BlueprintInput, BlueprintOutput } from '@platform/contracts';
import { BlueprintService } from '@/services/ad-rise/blueprint.service';
import BlueprintResults from './BlueprintResults';

const STEPS = [
    { number: 1, label: 'Campaign Details' },
    { number: 2, label: 'Generate Blueprint' },
    { number: 3, label: 'Review & Export' }
];

const VERTICALS = [
    { id: 'local-service', label: 'Local Service' as const, icon: '🔧' },
    { id: 'e-commerce', label: 'E-commerce' as const, icon: '🛒' },
    { id: 'saas', label: 'SaaS' as const, icon: '💻' },
    { id: 'healthcare', label: 'Healthcare' as const, icon: '✓' }
];

export default function BlueprintWizard() {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<BlueprintOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

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
                setError('Please enter your offer or service');
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
            } catch (error: any) {
                console.error('Failed to generate blueprint', error);
                setError(error.message || 'Generation failed. Please try again.');
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
                            <Typography variant="h6">📊</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Google Ads Blueprint
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                AI-Powered Campaign Generator
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" size="small">
                            History
                        </Button>
                        <Button variant="outlined" size="small">
                            My Blueprints
                        </Button>
                        <Button variant="contained" size="small">
                            Account
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
                            {STEPS.map((step, index) => (
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
                                    {index < STEPS.length - 1 && (
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
                                            Business Information
                                        </Typography>
                                        <Chip label="Required" color="primary" size="small" />
                                    </Stack>

                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Offer / Services
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                                            What products or services are you promoting?
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="Premium Plumbing Services - Emergency & Repairs"
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
                                            Industry Vertical
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {VERTICALS.map((vertical) => (
                                                <Grid size={{ xs: 6, sm: 3 }} key={vertical.id}>
                                                    <Paper
                                                        onClick={() => setFormData({ ...formData, vertical: vertical.label })}
                                                        sx={{
                                                            p: 2,
                                                            textAlign: 'center',
                                                            cursor: 'pointer',
                                                            border: `2px solid ${formData.vertical === vertical.label ? theme.palette.primary.main : 'transparent'}`,
                                                            bgcolor: formData.vertical === vertical.label ? alpha(theme.palette.primary.main, 0.1) : 'background.default',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                borderColor: theme.palette.primary.main,
                                                                bgcolor: alpha(theme.palette.primary.main, 0.05)
                                                            }
                                                        }}
                                                    >
                                                        <Typography variant="h4" sx={{ mb: 1 }}>
                                                            {vertical.icon}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {vertical.label}
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
                                        Targeting & Keywords
                                    </Typography>

                                    {/* Geographic Targeting */}
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Geographic Targeting
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                                            Enter cities, states, or regions you serve
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="Los Angeles, CA"
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
                                                Add
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
                                            Customer Pain Points
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                                            What problems do your customers face? (helps generate problem-focused keywords)
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            placeholder="Emergency plumbing issues, leaking pipes, burst pipes, clogged drains, water heater failures, sewer backups, 24/7 urgent repairs needed"
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
                                            Add Pain Point
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
                                        Landing Page
                                    </Typography>

                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Landing Page URL
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                                            Where will your ads direct traffic?
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <TextField
                                                fullWidth
                                                placeholder="https://premiumplumbing.com/emergency-services"
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
                                                Validate
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
                                            Generating your Campaign Blueprint...
                                        </Typography>
                                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                                            Analyzing keywords, competitors, and creating ads.
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
                                            Ready to Generate
                                        </Typography>
                                        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                                            Click "Generate Complete Blueprint" to create your custom Google Ads campaign
                                            structure with keywords, ad copy, and optimization recommendations.
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
                                                <strong>Service:</strong> {formData.offerOrService}
                                                <br />
                                                <strong>Vertical:</strong> {formData.vertical}
                                                <br />
                                                <strong>Locations:</strong> {formData.geoTargeting.length > 0 ? formData.geoTargeting.join(', ') : 'None'}
                                                <br />
                                                <strong>Pain Points:</strong> {formData.painPoints.length}
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
                                    startIcon={activeStep === 1 ? <span>⚡</span> : null}
                                    sx={{
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {activeStep === 1 ? 'Generate Complete Blueprint' : 'Continue'}
                                </Button>
                                {activeStep > 0 && (
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={handleBack}
                                        disabled={loading}
                                        sx={{ mt: 2 }}
                                    >
                                        Back
                                    </Button>
                                )}
                            </Box>
                        )}
                    </Grid>

                    {/* Right Side - Preview Panel */}
                    {activeStep < 2 && (
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
                                        <Typography variant="h6">📋</Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Blueprint Preview
                                    </Typography>
                                </Stack>

                                <Stack spacing={2}>
                                    {[
                                        { label: 'Keyword Clusters', value: getPreviewStats().keywordClusters },
                                        { label: 'Ad Groups', value: getPreviewStats().adGroups },
                                        { label: 'RSA Headlines', value: getPreviewStats().rsaHeadlines },
                                        { label: 'Descriptions', value: getPreviewStats().descriptions },
                                        { label: 'Negative Keywords', value: getPreviewStats().negativeKeywords }
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
                                        💡 What You'll Get
                                    </Typography>
                                    <Stack spacing={0.5}>
                                        {[
                                            'Intent-based keyword clusters',
                                            'Match type recommendations',
                                            'Negative keyword suggestions',
                                            'Google Ads compliant RSA copy',
                                            'Landing page optimization tips',
                                            'Exportable JSON format'
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
                                        Quick Start Templates
                                    </Typography>
                                    <Stack spacing={1.5}>
                                        {[
                                            { title: 'Emergency Services', desc: '24/7 urgent service keywords' },
                                            { title: 'Local Service Pro', desc: 'Geo-targeted campaigns' },
                                            { title: 'Competitor Targeting', desc: 'Capture competitor traffic' }
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
                                                        Use
                                                    </Button>
                                                </Stack>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Box>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Box>
    );
}
