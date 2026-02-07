'use client';

import React, { useState, useMemo } from 'react';

import {
    Box,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    Stack,
    Checkbox,
    FormControlLabel,
    Button,
    LinearProgress,
    Divider,
    alpha,
    useTheme,
    Grid,
    GlobalStyles
} from '@mui/material';

import {
    ExpandMore as ExpandMoreIcon,
    HelpOutline as HelpIcon,
    ErrorOutline as ErrorIcon,
    TrendingUp as TrendingUpIcon,
    Settings as SettingsIcon,
    Campaign as CampaignIcon,
    CalendarMonth as CalendarIcon,
    ArrowBack as ArrowBackIcon,
    QuestionAnswer as QuestionIcon,
    Print as PrintIcon,
    RadioButtonUnchecked as UncheckedIcon,
    CheckCircle as CheckedIcon
} from '@mui/icons-material';

import { useTranslations } from 'next-intl';

import { SETUP_TEMPLATES } from './guides/templates';
import { OPTIMIZATION_TASKS } from './guides/optimization';
import { TROUBLESHOOTING_FLOWS, DIAGNOSTIC_STEPS } from './guides/troubleshooting';

interface ExecutionGuideProps {
    sessionId: string;
    initialChecklist?: Record<string, boolean>;
    onToggleStep: (stepId: string, completed: boolean) => void;
    isSaving?: boolean;
}

const ExecutionGuide = ({ initialChecklist = {}, onToggleStep, isSaving }: ExecutionGuideProps) => {
    const theme = useTheme();
    const t = useTranslations('dashboard.adrise.guide');
    const [activeTab, setActiveTab] = useState(0);
    const [diagStepId, setDiagStepId] = useState<string>('q-start');
    const [diagResultId, setDiagResultId] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);

    const handlePrint = () => {
        window.print();
    };

    const checklist = useMemo(() => initialChecklist, [initialChecklist]);

    const totalSteps = useMemo(() => {
        const setupSteps = SETUP_TEMPLATES.reduce((acc, p) => acc + p.sections.reduce((sAcc, s) => sAcc + s.steps.length, 0), 0);
        const optSteps = OPTIMIZATION_TASKS.length;

        return setupSteps + optSteps;
    }, []);

    const completedCount = useMemo(() => {
        return Object.values(checklist).filter(v => v).length;
    }, [checklist]);

    const progress = Math.round((completedCount / totalSteps) * 100);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleDiagOption = (nextId: string, type: 'question' | 'result') => {
        setHistory(prev => [...prev, diagStepId]);

        if (type === 'question') {
            setDiagStepId(nextId);
        } else {
            setDiagResultId(nextId);
        }
    };

    const handleDiagBack = () => {
        if (diagResultId) {
            setDiagResultId(null);

            return;
        }

        if (history.length > 0) {
            const prev = history[history.length - 1];

            setHistory(prevHistory => prevHistory.slice(0, -1));
            setDiagStepId(prev);
        }
    };

    const resetDiag = () => {
        setDiagStepId('q-start');
        setDiagResultId(null);
        setHistory([]);
    };

    const currentDiagStep = useMemo(() => DIAGNOSTIC_STEPS.find(s => s.id === diagStepId), [diagStepId]);
    const currentDiagResult = useMemo(() => TROUBLESHOOTING_FLOWS.find(r => r.id === diagResultId), [diagResultId]);

    const isStepCompleted = (stepId: string) => !!checklist[stepId];

    return (
        <Box sx={{ width: '100%', mb: 10 }}>
            <GlobalStyles
                styles={{
                    '@media print': {
                        'header, footer, aside, nav, .mui-fixed, .ts-vertical-nav, .ts-navbar, .ts-footer': {
                            display: 'none !important'
                        },
                        '.layout-page-content, .layout-content-wrapper, main': {
                            padding: '0 !important',
                            margin: '0 !important',
                            width: '100% !important',
                            maxWidth: 'none !important',
                            position: 'static !important'
                        },
                        'body': {
                            backgroundColor: 'white !important'
                        },
                        '.MuiTabs-root': {
                            display: 'none !important'
                        },
                        '.hide-on-print': {
                            display: 'none !important'
                        },

                        // Ensure the content container doesn't have extra padding
                        '.layout-page-content, .layout-content-wrapper': {
                            paddingTop: '0 !important'
                        }
                    }
                }}
            />

            {/* Progress Header */}
            <Card sx={{
                mb: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                '@media print': { mb: 2, boxShadow: 'none', border: '1px solid #eee' }
            }}>
                <CardContent sx={{ p: 6, '@media print': { p: 4 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, '@media print': { mb: 1 } }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                {t('title')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('subtitle')}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ '@media print': { display: 'none' } }}>
                            <Button
                                variant="outlined"
                                startIcon={<PrintIcon />}
                                onClick={handlePrint}
                                sx={{ fontWeight: 600, borderRadius: 2 }}
                            >
                                {t('printGuide')}
                            </Button>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                    {progress}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    {t('overallProgress')}
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Print-only Progress Info */}
                        <Box sx={{ display: 'none', '@media print': { display: 'block', textAlign: 'right' } }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                {t('overallProgress')}: {progress}%
                            </Typography>
                        </Box>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '@media print': { border: '1px solid #ddd' }
                        }}
                    />
                </CardContent>
            </Card>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4, '@media print': { display: 'none' } }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="execution guide tabs">
                    <Tab icon={<SettingsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={t('setupGuides')} />
                    <Tab icon={<CalendarIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={t('optimizationScheduler')} />
                    <Tab icon={<HelpIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={t('troubleshooting')} />
                </Tabs>
            </Box>

            {/* Setup Guides */}
            <TabPanel value={activeTab} index={0}>
                <Grid container spacing={6} sx={{ '@media print': { display: 'block' } }}>
                    {SETUP_TEMPLATES.map((guide) => (
                        <Grid size={{ xs: 12, md: 6 }} key={guide.id} sx={{ '@media print': { mb: 8, breakInside: 'avoid' } }}>
                            <Card sx={{ borderRadius: 3, height: '100%' }}>
                                <CardContent sx={{ p: 6 }}>
                                    <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
                                        <Box sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: guide.platform === 'google' ? alpha('#4285F4', 0.1) : alpha('#1877F2', 0.1),
                                            color: guide.platform === 'google' ? '#4285F4' : '#1877F2'
                                        }}>
                                            <CampaignIcon />
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                                            {guide.platform === 'google' ? t('googleSetup') : t('metaSetup')}
                                        </Typography>
                                    </Stack>

                                    {guide.sections.map((section, sIdx) => (
                                        <Box key={sIdx} sx={{ mb: 4 }}>
                                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, mb: 2, display: 'block' }}>
                                                {section.title}
                                            </Typography>
                                            <Stack spacing={2}>
                                                {section.steps.map((step) => (
                                                    <Box
                                                        key={step.id}
                                                        sx={{
                                                            p: 3,
                                                            borderRadius: 2,
                                                            border: '1px solid',
                                                            borderColor: isStepCompleted(step.id) ? alpha(theme.palette.success.main, 0.2) : 'divider',
                                                            bgcolor: isStepCompleted(step.id) ? alpha(theme.palette.success.main, 0.02) : 'transparent',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            control={
                                                                <>
                                                                    <Checkbox
                                                                        checked={isStepCompleted(step.id)}
                                                                        onChange={(e) => onToggleStep(step.id, e.target.checked)}
                                                                        disabled={isSaving}
                                                                        sx={{ '@media print': { display: 'none' } }}
                                                                    />
                                                                    <Box sx={{
                                                                        display: 'none',
                                                                        mr: 3,
                                                                        mt: 1,
                                                                        '@media print': { display: 'block' }
                                                                    }}>
                                                                        {isStepCompleted(step.id) ?
                                                                            <CheckedIcon color="success" sx={{ fontSize: 20 }} /> :
                                                                            <UncheckedIcon sx={{ fontSize: 20, color: '#ccc' }} />
                                                                        }
                                                                    </Box>
                                                                </>
                                                            }
                                                            label={
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: isStepCompleted(step.id) ? 'success.main' : 'text.primary' }}>
                                                                        {step.title}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                                        {step.description}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                            sx={{ alignItems: 'flex-start', m: 0, '& .MuiCheckbox-root': { mt: -0.5 } }}
                                                        />
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            {/* Optimization Scheduler */}
            <TabPanel value={activeTab} index={1} className="print-section">
                <Stack spacing={4} sx={{ '@media print': { mt: 4 } }}>
                    {[3, 7, 14].map((day) => (
                        <Box key={day}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <TrendingUpIcon color="primary" /> {t('dayPostLaunch', { day })}
                            </Typography>
                            <Grid container spacing={4}>
                                {OPTIMIZATION_TASKS.filter(t => t.day === day).map((task) => (
                                    <Grid size={{ xs: 12, md: 6 }} key={task.id}>
                                        <Card sx={{
                                            borderRadius: 3,
                                            border: '1px solid',
                                            borderColor: isStepCompleted(task.id) ? alpha(theme.palette.success.main, 0.2) : 'divider',
                                        }}>
                                            <CardContent sx={{ p: 4 }}>
                                                <FormControlLabel
                                                    control={
                                                        <>
                                                            <Checkbox
                                                                checked={isStepCompleted(task.id)}
                                                                onChange={(e) => onToggleStep(task.id, e.target.checked)}
                                                                disabled={isSaving}
                                                                sx={{ '@media print': { display: 'none' } }}
                                                            />
                                                            <Box sx={{
                                                                display: 'none',
                                                                mr: 3,
                                                                mt: 1,
                                                                '@media print': { display: 'block' }
                                                            }}>
                                                                {isStepCompleted(task.id) ?
                                                                    <CheckedIcon color="success" sx={{ fontSize: 20 }} /> :
                                                                    <UncheckedIcon sx={{ fontSize: 20, color: '#ccc' }} />
                                                                }
                                                            </Box>
                                                        </>
                                                    }
                                                    label={
                                                        <Box>
                                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                                {task.title}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                                {task.description}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{ alignItems: 'flex-start', m: 0, '& .MuiCheckbox-root': { mt: -0.5 } }}
                                                />
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ))}
                </Stack>
            </TabPanel>

            {/* Troubleshooting */}
            <TabPanel value={activeTab} index={2}>
                <Box sx={{ width: '100%', '@media print': { display: 'none' } }}>
                    {(diagResultId || history.length > 0) && (
                        <Button
                            variant="text"
                            startIcon={<ArrowBackIcon />}
                            onClick={handleDiagBack}
                            sx={{ mb: 4, fontWeight: 600 }}
                        >
                            {diagResultId ? t('backToQuestion') : t('previousQuestion')}
                        </Button>
                    )}

                    {!diagResultId && currentDiagStep && (
                        <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                            <Box sx={{ p: 4, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <QuestionIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('diagnosticTitle')}</Typography>
                                </Stack>
                            </Box>
                            <CardContent sx={{ p: 6 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{currentDiagStep.question}</Typography>
                                {currentDiagStep.description && (
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
                                        {currentDiagStep.description}
                                    </Typography>
                                )}

                                <Stack spacing={2}>
                                    {currentDiagStep.options.map((opt, idx) => (
                                        <Box key={idx}
                                            onClick={() => handleDiagOption(opt.nextId, opt.type)}
                                            sx={{
                                                p: 4,
                                                borderRadius: 3,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                                                    transform: 'translateX(8px)'
                                                }
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: 600 }}>{opt.label}</Typography>
                                            <ExpandMoreIcon sx={{ transform: 'rotate(-90deg)', color: 'text.secondary' }} />
                                        </Box>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    )}

                    {diagResultId && currentDiagResult && (
                        <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'error.main', overflow: 'hidden' }}>
                            <Box sx={{ p: 4, bgcolor: alpha(theme.palette.error.main, 0.05), borderBottom: '1px solid', borderColor: alpha(theme.palette.error.main, 0.1) }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <ErrorIcon color="error" />
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'error.main' }}>{t('diagnosticResult')} {currentDiagResult.issue}</Typography>
                                </Stack>
                            </Box>
                            <CardContent sx={{ p: 6 }}>
                                <Typography variant="subtitle1" sx={{ color: 'error.main', fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    {t('recommendation')}: {currentDiagResult.suggestion}
                                </Typography>

                                <Divider sx={{ mb: 4 }} />

                                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', mb: 3, display: 'block' }}>
                                    {t('requiredActions')}
                                </Typography>

                                <Stack spacing={2.5}>
                                    {currentDiagResult.steps.map((step, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                                            <Box sx={{
                                                mt: 0.5,
                                                minWidth: 20,
                                                height: 20,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 12,
                                                fontWeight: 800
                                            }}>
                                                {idx + 1}
                                            </Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>{step}</Typography>
                                        </Box>
                                    ))}
                                </Stack>

                                <Button
                                    variant="outlined"
                                    onClick={resetDiag}
                                    fullWidth
                                    sx={{ mt: 6, py: 1.5, borderRadius: 2, fontWeight: 700 }}
                                >
                                    {t('startNew')}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </TabPanel>
        </Box >
    );
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    className?: string;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <Box
            role="tabpanel"
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            className={value === index ? 'active-tab-panel' : ''}
            sx={{
                width: '100%',
                display: value === index ? 'block' : 'none',
                '@media print': {
                    display: (index === 0 || index === 1) ? 'block !important' : 'none !important'
                }
            }}
            {...other}
        >
            {(value === index || index === 0 || index === 1) && (
                <Box sx={{
                    pt: 4,
                    '@media print': { pt: 0 }
                }}>
                    {children}
                </Box>
            )}
        </Box>
    );
}

export default ExecutionGuide;
