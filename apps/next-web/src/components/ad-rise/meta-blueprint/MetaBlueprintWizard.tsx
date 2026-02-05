'use client'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import BoltIcon from '@mui/icons-material/Bolt'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HealingIcon from '@mui/icons-material/Healing'
import HistoryIcon from '@mui/icons-material/History'
import LanguageIcon from '@mui/icons-material/Language'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import StoreIcon from '@mui/icons-material/Store'
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
import type { StepIconProps } from '@mui/material'
import { useState } from 'react'

import { useTranslation } from '@/hooks/useTranslation'
import { MetaBlueprintService } from '@/services/ad-rise/meta-blueprint.service'

import type { MetaBlueprintInput, MetaBlueprintOutput } from '@platform/contracts'

import AdCopyVariations from './AdCopyVariations'
import AudienceResults from './AudienceResults'
import InterestClusters from './InterestClusters'
import PlacementRecommendations from './PlacementRecommendations'

const VERTICALS = [
    { value: 'Local Service', icon: <StoreIcon fontSize="large" /> },
    { value: 'E-commerce', icon: <ShoppingBagIcon fontSize="large" /> },
    { value: 'SaaS', icon: <LanguageIcon fontSize="large" /> },
    { value: 'Healthcare', icon: <HealingIcon fontSize="large" /> },
] as const

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
        landingPageUrl: ''
    })

    const [painPointInput, setPainPointInput] = useState('')

    const handleNext = async () => {
        if (activeStep === 1) {
            setLoading(true)

            try {
                const result = await MetaBlueprintService.generate(input)

                setOutput(result)
                setActiveStep(prev => prev + 1)
            } catch (error) {
                console.error('Failed to generate blueprint', error)
            } finally {
                setLoading(false)
            }
        } else {
            setActiveStep(prev => prev + 1)
        }
    }

    const addPainPoint = () => {
        if (painPointInput.trim()) {
            setInput(prev => ({ ...prev, painPoints: [...prev.painPoints, painPointInput.trim()] }))
            setPainPointInput('')
        }
    }

    const steps = [
        t('meta.steps.businessInfo'),
        t('meta.steps.geoTargeting'),
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
                    t('meta.results.audiences.prospecting') + ' + ' + t('meta.results.audiences.retargeting'),
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

                        <Grid size={{ xs: 12 }}>
                            {/* Section: Audiences */}
                            <Box sx={{ mb: 5 }}>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'primary.main', color: 'white', display: 'flex' }}><StoreIcon /></Box>
                                    {t('meta.results.sections.audiences')}
                                </Typography>
                                <AudienceResults data={output.audiences} />
                            </Box>

                            {/* Section: Interests */}
                            <Box sx={{ mb: 5 }}>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'primary.main', color: 'white', display: 'flex' }}><CheckCircleIcon /></Box>
                                    {t('meta.results.sections.interests')}
                                </Typography>
                                <InterestClusters data={output.interestClusters} />
                            </Box>

                            {/* Section: Placements */}
                            <Box sx={{ mb: 5 }}>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'primary.main', color: 'white', display: 'flex' }}><ShoppingBagIcon /></Box>
                                    {t('meta.results.sections.placements')}
                                </Typography>
                                <PlacementRecommendations data={output.placements} />
                            </Box>

                            {/* Section: Copy */}
                            <Box sx={{ mb: 5 }}>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'primary.main', color: 'white', display: 'flex' }}><BoltIcon /></Box>
                                    {t('meta.results.sections.adCopy')}
                                </Typography>
                                <AdCopyVariations data={output.copyVariations} />
                            </Box>
                        </Grid>
                    </Grid>
                ) : (

                    // Wizard View (7/5 Split)
                    <Grid container spacing={5}>
                        {/* Left Column - Form */}
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Card variant="outlined" sx={{ p: 0, bgcolor: 'background.paper', overflow: 'hidden' }}>
                                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {activeStep === 0 ? t('meta.form.businessName') : t('meta.form.geoCenter')}
                                    </Typography>
                                    <Chip label={t('form.required')} size="small" color="primary" />
                                </Box>
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: 3 }}>

                                    {activeStep === 0 && (
                                        <>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold" gutterBottom>{t('meta.form.offerOrService')}</Typography>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>{t('form.offerServiceHelp')}</Typography>
                                                <TextField
                                                    placeholder={t('meta.form.offerOrServicePlaceholder')}
                                                    value={input.offerOrService}
                                                    onChange={(e) => setInput({ ...input, offerOrService: e.target.value })}
                                                    fullWidth
                                                    variant="outlined"
                                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
                                                />
                                            </Box>

                                            <Box>
                                                <Typography variant="body2" fontWeight="bold" gutterBottom>{t('meta.form.vertical')}</Typography>
                                                <Grid container spacing={2}>
                                                    {VERTICALS.map((v) => (
                                                        <Grid size={{ xs: 6, md: 3 }} key={v.value}>
                                                            <Paper
                                                                variant="outlined"
                                                                onClick={() => setInput({ ...input, vertical: v.value as any })}
                                                                sx={{
                                                                    p: 2,
                                                                    textAlign: 'center',
                                                                    cursor: 'pointer',
                                                                    bgcolor: input.vertical === v.value ? alpha(theme.palette.primary.main, 0.05) : 'background.default',
                                                                    borderColor: input.vertical === v.value ? 'primary.main' : 'divider',
                                                                    transition: 'all 0.2s',
                                                                    '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' }
                                                                }}
                                                            >
                                                                <Box sx={{ color: input.vertical === v.value ? 'primary.main' : 'text.secondary', mb: 1 }}>
                                                                    {v.icon}
                                                                </Box>
                                                                <Typography variant="caption" fontWeight="bold">{t(`meta.form.verticals.${v.value === 'Local Service' ? 'localService' : v.value === 'E-commerce' ? 'ecommerce' : v.value.toLowerCase()}`)}</Typography>
                                                            </Paper>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Box>

                                            <Box>
                                                <Typography variant="body2" fontWeight="bold" gutterBottom>{t('meta.form.painPoints')}</Typography>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>{t('form.painPointsHelp')}</Typography>
                                                <TextField
                                                    multiline
                                                    rows={4}
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
                                        </>
                                    )}

                                    {activeStep === 1 && (
                                        <>
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
                                                    <Typography variant="h3" color="primary.main" align="center" fontWeight="bold" sx={{ mb: 1 }}>
                                                        {input.geoTargeting.radius}
                                                    </Typography>
                                                    <Typography variant="caption" align="center" display="block" color="text.secondary" sx={{ mb: 3 }}>{t(`meta.form.radiusUnit.${input.geoTargeting.unit}`)}</Typography>
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
                                        </>
                                    )}

                                </CardContent>
                            </Card>

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
                                        (activeStep === 0 && !input.offerOrService) ||
                                        (activeStep === 1 && !input.geoTargeting.center)
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
