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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    LinearProgress,
    Divider,
    alpha,
    useTheme,
    Grid
} from '@mui/material';

import {
    ExpandMore as ExpandMoreIcon,
    HelpOutline as HelpIcon,
    CheckCircle as CheckCircleIcon,
    ErrorOutline as ErrorIcon,
    TrendingUp as TrendingUpIcon,
    Settings as SettingsIcon,
    Campaign as CampaignIcon,
    CalendarMonth as CalendarIcon
} from '@mui/icons-material';

import { useTranslations } from 'next-intl';

import { SETUP_TEMPLATES } from './guides/templates';
import { OPTIMIZATION_TASKS } from './guides/optimization';
import { TROUBLESHOOTING_FLOWS } from './guides/troubleshooting';

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

    const isStepCompleted = (stepId: string) => !!checklist[stepId];

    return (
        <Box sx={{ width: '100%', mb: 10 }}>
            {/* Progress Header */}
            <Card sx={{ mb: 6, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <CardContent sx={{ p: 6 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                {t('title')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('subtitle')}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                {progress}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {t('overallProgress')}
                            </Typography>
                        </Box>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 10, borderRadius: 5, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                    />
                </CardContent>
            </Card>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="execution guide tabs">
                    <Tab icon={<SettingsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={t('setupGuides')} />
                    <Tab icon={<CalendarIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={t('optimizationScheduler')} />
                    <Tab icon={<HelpIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={t('troubleshooting')} />
                </Tabs>
            </Box>

            {/* Setup Guides */}
            <TabPanel value={activeTab} index={0}>
                <Grid container spacing={6}>
                    {SETUP_TEMPLATES.map((guide) => (
                        <Grid size={{ xs: 12, md: 6 }} key={guide.id}>
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
                                                                <Checkbox
                                                                    checked={isStepCompleted(step.id)}
                                                                    onChange={(e) => onToggleStep(step.id, e.target.checked)}
                                                                    disabled={isSaving}
                                                                />
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
            <TabPanel value={activeTab} index={1}>
                <Stack spacing={4}>
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
                                                        <Checkbox
                                                            checked={isStepCompleted(task.id)}
                                                            onChange={(e) => onToggleStep(task.id, e.target.checked)}
                                                            disabled={isSaving}
                                                        />
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
                <Grid container spacing={4}>
                    {TROUBLESHOOTING_FLOWS.map((flow) => (
                        <Grid size={{ xs: 12, md: 6 }} key={flow.id}>
                            <Accordion sx={{ borderRadius: '12px !important', overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Stack direction="row" spacing={3} alignItems="center">
                                        <ErrorIcon color="error" />
                                        <Typography sx={{ fontWeight: 700 }}>{flow.issue}</Typography>
                                    </Stack>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 4, bgcolor: alpha(theme.palette.error.main, 0.02) }}>
                                    <Typography variant="subtitle2" sx={{ color: 'error.main', fontWeight: 800, mb: 2 }}>
                                        {t('recommendation')}: {flow.suggestion}
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 2 }}>
                                        {t('checklistActions')}:
                                    </Typography>
                                    <Stack spacing={1.5}>
                                        {flow.steps.map((step, idx) => (
                                            <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                                <CheckCircleIcon sx={{ fontSize: 16, color: 'primary.main', mt: 0.5 }} />
                                                <Typography variant="body2">{step}</Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>
        </Box>
    );
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 4 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default ExecutionGuide;
