'use client'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import BoltIcon from '@mui/icons-material/Bolt'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HistoryIcon from '@mui/icons-material/History'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import StoreIcon from '@mui/icons-material/Store'

import type { StepIconProps } from '@mui/material'
import {
    alpha,
    Box, Button, Card, CardContent,
    Chip,
    CircularProgress,
    Grid,
    Paper,
    Slider,
    Stack,
    Step,
    StepLabel, Stepper, TextField, Typography,
    useTheme
} from '@mui/material'
import { useState, useEffect } from 'react'
import VerticalSelection from '../shared/VerticalSelection'

import { useTranslation } from '@/hooks/useTranslation'
import { MetaBlueprintService } from '@/services/ad-rise/meta-blueprint.service'
import { useCreativeAnalytics } from '@/hooks/useCreativeAnalytics'
import { DisclaimerPanel } from '../creative-engine/DisclaimerPanel'

import type { MetaBlueprintInput, MetaBlueprintOutput } from '@platform/contracts'

import AdCopyVariations from './AdCopyVariations'
import AIInsightsPanel from './AIInsightsPanel'
import AudienceResults from './AudienceResults'
import InterestClusters from './InterestClusters'
import PlacementRecommendations from './PlacementRecommendations'
import { MetaQuickTemplatesSection } from './sections/MetaQuickTemplatesSection'
import type { MetaQuickTemplate } from './data/meta-quick-templates'



// Custom Step Icon to match 40x40px spec
const CustomStepIcon = (props: StepIconProps) => {
    const theme = useTheme();
    const { active, completed, icon } = props;

    return (
        <Box
            sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: active ? 'primary.main' : completed ? 'success.main' : 'background.paper',
                border: active ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                color: active || completed ? 'primary.contrastText' : 'text.secondary',
                fontWeight: 'bold',
                zIndex: 1,
            }}
        >
            {icon}
        </Box>
    );
}

export default function MetaBlueprintWizard() {
    const t = useTranslation('blueprint')
    const theme = useTheme()
    const [activeStep, setActiveStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [output, setOutput] = useState<MetaBlueprintOutput | null>(null)
    const { trackWizardStart, trackWizardComplete } = useCreativeAnalytics()

    useEffect(() => {
        trackWizardStart({ type: 'meta_blueprint' })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [input, setInput] = useState<MetaBlueprintInput>({
        businessName: '',
        offerOrService: '',
        vertical: 'Local Service',
        geoTargeting: {
            center: '',
            radius: 25,
            unit: 'miles'
        },
        painPoints: [],
        landingPageUrl: '',
        budget: 1500, // Default to Full Funnel/Standard threshold
        objective: 'Leads'
    })

    const [painPointInput, setPainPointInput] = useState('')

    const handleNext = async () => {
        if (activeStep === 0) {
            if (!input.offerOrService || !input.geoTargeting.center) {
                return;
            }

            setActiveStep(1);
        } else if (activeStep === 1) {
            setLoading(true);

            try {
                const result = await MetaBlueprintService.generate(input);

                console.log('🔍 Meta Blueprint API Response:', result);
                console.log('🔍 Has structure?', !!result.structure);
                console.log('🔍 Response keys:', Object.keys(result));

                setOutput(result);
                trackWizardComplete({ type: 'meta_blueprint', businessName: input.businessName });
                setActiveStep(2);
            } catch (error) {
                console.error('Failed to generate blueprint', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const applyTemplate = (template: MetaQuickTemplate) => {
        setInput({
            ...input,
            ...template.data
        });
    };

    const addPainPoint = () => {
        if (painPointInput.trim()) {
            setInput(prev => ({ ...prev, painPoints: [...prev.painPoints, painPointInput.trim()] }))
            setPainPointInput('')
        }
    }

    const steps = [
        t('meta.steps.businessInfo'), // Now contains both Info & Geo
        t('steps.generate'),
        t('meta.steps.results')
    ]

    const SidebarStats = () => (
        <Stack spacing={2} sx={{ mb: 3 }}>
            {[
                { label: t('meta.results.sections.audiences'), value: '2' },
                { label: t('meta.results.sections.interests'), value: '3-6' },
                { label: t('meta.results.sections.adCopy'), value: '12-15' },
                { label: t('meta.results.sections.placements'), value: '6-8' }
            ].map((stat, i) => (
                <Stack key={i} direction="row" justifyContent="space-between" sx={{
                    p: 1.5,
                    bgcolor: 'background.default', // Dark box for stats
                    borderRadius: 1
                }}>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1 }}>{stat.value}</Typography>
                </Stack>
            ))}
        </Stack>
    )

    const Checklist = () => (
        <Box sx={{
            p: 2,
            bgcolor: alpha(theme.palette.success.main, 0.05), // Yellow/Green tint
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha(theme.palette.success.main, 0.1)
        }}>
            <Typography variant="subtitle2" color="success.main" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon fontSize="small" /> {t('preview.whatYouGet')}
            </Typography>
            <Stack spacing={1}>
                {[
                    t('meta.results.benefits.combinedAudiences', {
                        prospecting: t('meta.results.audiences.prospecting'),
                        retargeting: t('meta.results.audiences.retargeting')
                    }),
                    t('meta.results.benefits.coreAudiences'),
                    t('meta.results.benefits.interestClusters'),
                    t('meta.results.benefits.optimizedCopy'),
                    t('meta.results.benefits.placementStrategy'),
                    t('meta.results.benefits.exportReady')
                ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                        <Typography variant="caption" fontWeight="500">{item}</Typography>
                    </Box>
                ))}
            </Stack>
        </Box>
    )

    return (
        <Box sx={{ width: '100%', minHeight: '80vh', bgcolor: 'background.default' }}>
            {/* Premium Header Bar */}
            <Box sx={{
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                px: 4,
                py: 2,
                mb: 4
            }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'primary.main',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <BoltIcon />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{t('meta.title')}</Typography>
                            <Typography variant="caption" color="text.secondary">{t('meta.subtitle')}</Typography>
                        </Box>
                    </Box>

                    <Stack direction="row" spacing={1}>
                        <Button startIcon={<HistoryIcon />} color="inherit" size="small">{t('header.history')}</Button>
                        <Button startIcon={<BookmarkBorderIcon />} color="inherit" size="small">{t('header.myBlueprints')}</Button>
                        <Button variant="contained" startIcon={<AccountCircleIcon />} size="small" sx={{ borderRadius: 10 }}>{t('header.account')}</Button>
                    </Stack>
                </Stack>
            </Box>

            {/* Stepper */}
            <Box sx={{ px: 4, mb: 2 }}>
                <DisclaimerPanel />
            </Box>
            <Box sx={{ px: 4, mb: 5 }}>
                <Stepper activeStep={activeStep} alternativeLabel connector={<Box sx={{ flex: 1, height: 2, bgcolor: 'divider', mt: 2.5 }} />}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <Box sx={{ px: 4, pb: 6 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 15 }}>
                        <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
                        <Typography variant="h5" fontWeight="bold">{t('meta.loading')}</Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>{t('generate.loadingText')}</Typography>
                    </Box>
                ) : output && activeStep === 2 ? (

                    // Results View
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" color="text.primary">{t('meta.results.title')}</Typography>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        {/* Since offerOrService might be English from DB/Mock, we keep it as is, but we could localize metadata */}
                                        {input.offerOrService} • {input.geoTargeting.center} • {input.geoTargeting.radius} {t(`meta.form.radiusUnit.${input.geoTargeting.unit}`)}
                                    </Typography>
                                    {output.recommendations && (
                                        <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Chip label={t('meta.results.sections.estDailySpend', { amount: output.recommendations.dailySpend.toFixed(2) })} color="primary" variant="outlined" size="small" />
                                                <Chip label={output.recommendations.budgetTier ?? output.recommendations.budgetStrategy} color="secondary" variant="outlined" size="small" />
                                            </Box>
                                            {/* Learning Phase Estimate Display */}
                                            {output.recommendations.learningPhaseEstimate && (
                                                <Typography variant="caption" color={output.recommendations.learningPhaseEstimate.includes('Healthy') ? 'success.main' : 'warning.main'} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AutoAwesomeIcon fontSize="inherit" />
                                                    {output.recommendations.learningPhaseEstimate}
                                                </Typography>
                                            )}
                                        </Stack>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="contained" color="primary" startIcon={<SaveAltIcon />}>
                                        {t('meta.buttons.exportAll')}
                                    </Button>
                                    <Button variant="outlined" color="primary" onClick={() => setActiveStep(0)}>
                                        {t('meta.buttons.startOver')}
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Budget Tier Banner */}
                        <Grid size={{ xs: 12 }}>
                            {output.recommendations?.budgetTier && (() => {
                                const tier = output.recommendations.budgetTier
                                const tierConfig = {
                                    CONSOLIDATE: { color: 'warning', label: '⚡ CONSOLIDATE MODE', desc: '1 Campaign · 1 Ad Set · Broad Targeting · No Retargeting. Signal density over fragmentation at this budget.' },
                                    STANDARD: { color: 'info', label: '📊 STANDARD MODE', desc: '1 Prospecting Campaign · 2 Ad Sets (Intent + Broad) · No Retargeting. Increase to $1,500+/mo to unlock full funnel.' },
                                    FULL_FUNNEL: { color: 'success', label: '🚀 FULL FUNNEL MODE', desc: 'Prospecting (CBO) + Retargeting (ABO). Full senior media buyer structure active.' },
                                } as const
                                const config = tierConfig[tier]
                                return (
                                    <Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: `${config.color}.main`, bgcolor: `${config.color}.50` }}>
                                        <Typography variant="subtitle2" fontWeight="bold" color={`${config.color}.dark`}>
                                            {config.label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">{config.desc}</Typography>
                                        {output.recommendations.warnings && output.recommendations.warnings.length > 0 && (
                                            <Box sx={{ mt: 1.5 }}>
                                                {output.recommendations.warnings.map((w, i) => (
                                                    <Typography key={i} variant="caption" color="warning.dark" display="block" sx={{ mt: 0.5 }}>
                                                        {w}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                )
                            })()}
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            {/* Section: Audiences */}
                            <Box sx={{ mb: 5 }}>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'primary.main', color: 'white', display: 'flex' }}><StoreIcon /></Box>
                                    {t('meta.results.sections.audiences')}
                                </Typography>
                                <AudienceResults
                                    prospecting={output.structure.prospecting}
                                    retargeting={output.structure.retargeting}
                                />
                            </Box>

                            {/* Section: Interests */}
                            <Box sx={{ mb: 5 }}>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'primary.main', color: 'white', display: 'flex' }}><CheckCircleIcon /></Box>
                                    {t('meta.results.sections.interests')}
                                </Typography>
                                {output.recommendations.budgetTier === 'CONSOLIDATE' ? (
                                    <Paper sx={{ p: 3, bgcolor: 'background.default', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box sx={{ p: 1, bgcolor: 'warning.light', color: 'warning.dark', borderRadius: 1 }}>
                                                <AutoAwesomeIcon />
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">Algorithms over Targeting</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    In Consolidate Mode ($100/mo), we skip specific interest clusters to give Meta's AI maximum freedom.
                                                    Specific interest targeting starts at the <strong>Standard Tier ($600+/mo)</strong>.
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                ) : (
                                    <InterestClusters
                                        data={(output.structure?.prospecting?.adSets || [])
                                            .flatMap(a => a.audience.interests || [])
                                            .filter((v, i, a) => a.findIndex(t => t.theme === v.theme) === i)
                                        }
                                    />
                                )}
                            </Box>

                            {/* Section: Placements */}
                            <Box sx={{ mb: 5 }}>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'primary.main', color: 'white', display: 'flex' }}><ShoppingBagIcon /></Box>
                                    {t('meta.results.sections.placements')}
                                </Typography>
                                <PlacementRecommendations
                                    adSets={[...(output.structure?.prospecting?.adSets || []), ...(output.structure?.retargeting?.adSets || [])]}
                                />
                            </Box>

                            {/* Section: Copy */}
                            <Box sx={{ mb: 5 }}>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'primary.main', color: 'white', display: 'flex' }}><BoltIcon /></Box>
                                    {t('meta.results.sections.adCopy')}
                                </Typography>
                                <AdCopyVariations
                                    data={[
                                        ...(output.structure?.prospecting?.adSets || []).flatMap(adSet =>
                                            adSet.creatives.flatMap(c => {
                                                // Explode text variations into separate viewable items
                                                const variationsCount = Math.max(c.primaryText.length, c.headlines.length, c.descriptions?.length || 0);
                                                return Array.from({ length: variationsCount }).map((_, i) => ({
                                                    creative: {
                                                        ...c,
                                                        // Create a synthetic creative with just the i-th option as the first element
                                                        primaryText: [c.primaryText[i] || c.primaryText[0]],
                                                        headlines: [c.headlines[i] || c.headlines[0]],
                                                        descriptions: [c.descriptions?.[i] || c.descriptions?.[0] || '']
                                                    },
                                                    audienceName: adSet.audience.name,
                                                    stage: adSet.audience.funnelStage
                                                }));
                                            })
                                        ),
                                        ...(output.structure?.retargeting?.adSets || []).flatMap(adSet =>
                                            adSet.creatives.flatMap(c => {
                                                const variationsCount = Math.max(c.primaryText.length, c.headlines.length, c.descriptions?.length || 0);
                                                return Array.from({ length: variationsCount }).map((_, i) => ({
                                                    creative: {
                                                        ...c,
                                                        primaryText: [c.primaryText[i] || c.primaryText[0]],
                                                        headlines: [c.headlines[i] || c.headlines[0]],
                                                        descriptions: [c.descriptions?.[i] || c.descriptions?.[0] || '']
                                                    },
                                                    audienceName: adSet.audience.name,
                                                    stage: adSet.audience.funnelStage
                                                }));
                                            })
                                        )
                                    ]}
                                />
                            </Box>

                            {/* Section: AI Insights */}
                            {output.aiInsights && (
                                <Box sx={{ mb: 5 }}>
                                    <Paper variant="outlined" sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary?.main || theme.palette.primary.dark, 0.04)} 100%)`,
                                        borderColor: 'primary.main',
                                        borderStyle: 'dashed'
                                    }}>
                                        <AIInsightsPanel insights={output.aiInsights} />
                                    </Paper>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                ) : (

                    // Wizard View (7/5 Split)
                    <Grid container spacing={5}>
                        {/* Left Column - Form */}
                        <Grid size={{ xs: 12, md: 7 }}>
                            {activeStep === 0 && (
                                <>
                                    <MetaQuickTemplatesSection onSelectTemplate={applyTemplate} t={t} />
                                    <Card variant="outlined" sx={{ p: 0, bgcolor: 'background.paper', overflow: 'hidden' }}>
                                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                {t('meta.steps.businessInfo')}
                                            </Typography>
                                            <Chip label={t('form.required')} size="small" color="primary" />
                                        </Box>
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: 3 }}>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold" gutterBottom>{t('meta.form.offerOrService')}</Typography>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>{t('form.offerServiceHelp')}</Typography>
                                                <TextField
                                                    placeholder={t('meta.form.offerOrServicePlaceholder')}
                                                    value={input.offerOrService}
                                                    onChange={(e) => setInput({ ...input, offerOrService: e.target.value })}
                                                    fullWidth
                                                    variant="outlined"
                                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' }, mb: 3 }}
                                                />

                                                <Stack direction="row" spacing={2}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{t('meta.form.budget') || 'Monthly Budget'}</Typography>
                                                        <TextField
                                                            type="number"
                                                            value={input.budget}
                                                            onChange={(e) => setInput({ ...input, budget: Number(e.target.value) })}
                                                            fullWidth
                                                            InputProps={{
                                                                startAdornment: <Typography color="text.secondary" sx={{ mr: 1 }}>$</Typography>
                                                            }}
                                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
                                                        />
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{t('meta.form.objective') || 'Campaign Objective'}</Typography>
                                                        <TextField
                                                            select
                                                            value={input.objective}
                                                            onChange={(e) => setInput({ ...input, objective: e.target.value })}
                                                            fullWidth
                                                            SelectProps={{ native: true }}
                                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
                                                        >
                                                            <option value="Leads">Leads & Form Fills</option>
                                                            <option value="Sales">Sales & Conversions</option>
                                                            <option value="Awareness">Awareness & Reach</option>
                                                        </TextField>
                                                    </Box>
                                                </Stack>
                                            </Box>

                                            <Box>
                                                <Typography variant="body2" fontWeight="bold" gutterBottom>{t('meta.form.vertical')}</Typography>
                                                <VerticalSelection
                                                    value={input.vertical}
                                                    onChange={(v) => setInput({ ...input, vertical: v as any })}
                                                />
                                            </Box>

                                            <Box>
                                                <Typography variant="body2" fontWeight="bold" gutterBottom>{t('meta.form.painPoints')}</Typography>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>{t('form.painPointsHelp')}</Typography>
                                                <TextField
                                                    multiline
                                                    rows={3}
                                                    placeholder={t('meta.form.painPointsPlaceholder')}
                                                    value={painPointInput}
                                                    onChange={(e) => setPainPointInput(e.target.value)}
                                                    fullWidth
                                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addPainPoint();
                                                        }
                                                    }}
                                                />
                                                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    {input.painPoints.map((p, i) => (
                                                        <Chip key={i} label={p} onDelete={() => setInput(prev => ({ ...prev, painPoints: prev.painPoints.filter((_, idx) => idx !== i) }))} />
                                                    ))}
                                                </Box>
                                                <Button size="small" onClick={addPainPoint} sx={{ mt: 1 }}>{t('form.addPainPoint')}</Button>
                                            </Box>

                                            <Box>
                                                <Typography variant="body2" fontWeight="bold" gutterBottom>{t('meta.form.geoCenter')}</Typography>
                                                <TextField
                                                    placeholder={t('meta.form.geoCenterPlaceholder')}
                                                    value={input.geoTargeting.center}
                                                    onChange={(e) => setInput({ ...input, geoTargeting: { ...input.geoTargeting, center: e.target.value } })}
                                                    fullWidth
                                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
                                                />
                                            </Box>

                                            <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Typography variant="body2" fontWeight="bold">{t('meta.form.radius')}</Typography>
                                                    <Chip label={`${input.geoTargeting.radius} ${t(`meta.form.radiusUnit.${input.geoTargeting.unit}`)}`} color="primary" size="small" />
                                                </Box>
                                                <Box sx={{ px: 1 }}>
                                                    <Slider
                                                        value={input.geoTargeting.radius}
                                                        onChange={(_, val) => setInput({
                                                            ...input,
                                                            geoTargeting: { ...input.geoTargeting, radius: val as number }
                                                        })}
                                                        min={5}
                                                        max={100}
                                                        step={5}
                                                        marks={[
                                                            { value: 5, label: '5' },
                                                            { value: 25, label: '25' },
                                                            { value: 50, label: '50' },
                                                            { value: 100, label: '100' }
                                                        ]}
                                                    />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {activeStep === 1 && (
                                <Paper sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 6, textAlign: 'center', border: 1, borderColor: 'divider' }}>
                                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                                        <CheckCircleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                    </Box>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>{t('generate.readyTitle')}</Typography>
                                    <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>{t('generate.readyText')}</Typography>
                                    <Paper sx={{ bgcolor: 'background.default', p: 2, maxWidth: 500, mx: 'auto', textAlign: 'left', border: 1, borderColor: 'divider' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>{t('generate.service')}</strong> {input.offerOrService}<br />
                                            <strong>{t('generate.vertical')}</strong> {input.vertical}<br />
                                            <strong>{t('meta.form.geoCenter')}:</strong> {input.geoTargeting.center} ({input.geoTargeting.radius} {t(`meta.form.radiusUnit.${input.geoTargeting.unit}`)})
                                        </Typography>
                                    </Paper>
                                </Paper>
                            )}

                            {/* Navigation Actions */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    disabled={activeStep === 0}
                                    onClick={() => setActiveStep(prev => prev - 1)}
                                    startIcon={<ArrowBackIcon />}
                                    sx={{ px: 3, py: 1.2 }}
                                >
                                    {t('meta.buttons.back')}
                                </Button>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleNext}
                                    startIcon={activeStep === 1 ? <BoltIcon /> : undefined}
                                    disabled={
                                        (activeStep === 0 && (!input.offerOrService || !input.geoTargeting.center))
                                    }
                                    sx={{ px: 6, py: 1.2, fontWeight: 'bold' }}
                                >
                                    {activeStep === 1 ? t('meta.buttons.generate') : t('meta.buttons.next')}
                                </Button>
                            </Box>
                        </Grid>

                        {/* Right Column - Sidebar */}
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Box sx={{ position: 'sticky', top: 24 }}>
                                <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'primary.main', color: 'white' }}>
                                            <BoltIcon fontSize="small" />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold">{t('preview.title')}</Typography>
                                    </Box>
                                    <CardContent>
                                        <SidebarStats />
                                        <Checklist />
                                    </CardContent>
                                </Card>
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Box>
    )
}
