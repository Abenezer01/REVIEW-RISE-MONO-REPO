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
    Button,
    LinearProgress,
    alpha,
    useTheme,
    GlobalStyles
} from '@mui/material';

import {
    HelpOutline as HelpIcon,
    Settings as SettingsIcon,
    CalendarMonth as CalendarIcon,
    Print as PrintIcon,
} from '@mui/icons-material';

import { useTranslations } from 'next-intl';

import { SETUP_TEMPLATES } from './guides/templates';
import { OPTIMIZATION_TASKS } from './guides/optimization';
import { TROUBLESHOOTING_FLOWS } from './guides/troubleshooting';
import { downloadSimplePdf } from './wizard/pdf';
import SetupGuidesTab from './execution-guide/SetupGuidesTab';
import OptimizationTab from './execution-guide/OptimizationTab';
import TroubleshootingTab from './execution-guide/TroubleshootingTab';

interface ExecutionGuideProps {
    sessionId: string;
    sessionContext?: any;
    initialChecklist?: Record<string, boolean>;
    onToggleStep: (stepId: string, completed: boolean) => void;
    isSaving?: boolean;
}

const ExecutionGuide = ({ sessionId, sessionContext, initialChecklist = {}, onToggleStep, isSaving }: ExecutionGuideProps) => {
    const theme = useTheme();
    const t = useTranslations('dashboard.adrise.guide');
    const [activeTab, setActiveTab] = useState(0);

    const checklist = useMemo(() => initialChecklist, [initialChecklist]);

    const handlePrint = () => {
        const setupLines: string[] = [];

        SETUP_TEMPLATES.forEach((guide) => {
            const platformLabel = guide.platform === 'google' ? 'Google Setup Guide' : 'Meta Setup Guide';

            setupLines.push(platformLabel);
            setupLines.push('');

            guide.sections.forEach((section) => {
                setupLines.push(section.title);

                section.steps.forEach((step, stepIdx) => {
                    const done = checklist[step.id] ? 'Done' : 'Pending';

                    const subSteps = Array.isArray(step.checklist) && step.checklist.length > 0
                        ? step.checklist
                        : [step.description];

                    setupLines.push(`  ${stepIdx + 1}. ${step.title} [${done}]`);
                    subSteps.forEach((item, idx) => {
                        setupLines.push(`      - ${idx + 1}. ${item}`);
                    });
                    setupLines.push('');
                });
            });

            setupLines.push('----------------------------------------');
            setupLines.push('');
        });

        const optimizationLines: string[] = [];

        [3, 7, 14].forEach((day) => {
            optimizationLines.push(`Day ${day}`);

            const tasksForDay = OPTIMIZATION_TASKS.filter(task => task.day === day);

            tasksForDay.forEach((task, idx) => {
                const done = checklist[task.id] ? 'Done' : 'Pending';

                optimizationLines.push(`  ${idx + 1}. ${task.title} [${task.platform.toUpperCase()}] [${done}]`);
                optimizationLines.push(`      - ${task.description}`);
            });
            optimizationLines.push('');
        });

        const troubleshootingLines: string[] = [];

        TROUBLESHOOTING_FLOWS.forEach((flow, idx) => {
            troubleshootingLines.push(`${idx + 1}. ${flow.issue}`);
            troubleshootingLines.push(`   Recommendation: ${flow.suggestion}`);
            flow.steps.forEach((step, stepIdx) => {
                troubleshootingLines.push(`      - ${stepIdx + 1}. ${step}`);
            });
            troubleshootingLines.push('');
        });

        downloadSimplePdf({
            fileName: `${(sessionContext?.sessionName || 'execution-guide').replace(/[^a-zA-Z0-9-_]/g, '_')}-execution-guide`,
            title: 'Execution Guide',
            sections: [
                {
                    title: 'Context',
                    lines: [
                        `Session: ${sessionContext?.sessionName || 'N/A'}`,
                        `Industry: ${sessionContext?.industry || 'N/A'}`,
                        `Goal: ${sessionContext?.goal || 'N/A'}`,
                        `Budget Monthly: ${sessionContext?.budgetMonthly ?? 'N/A'}`,
                        `Mode: ${sessionContext?.mode || 'N/A'}`,
                        `Locations: ${Array.isArray(sessionContext?.locations) && sessionContext.locations.length > 0 ? sessionContext.locations.join(', ') : 'N/A'}`,
                        `Overall Progress: ${progress}%`
                    ]
                },
                {
                    title: 'Setup Guides',
                    lines: setupLines
                },
                {
                    title: 'Optimization Scheduler',
                    lines: optimizationLines
                },
                {
                    title: 'Troubleshooting',
                    lines: troubleshootingLines
                }
            ]
        });
    };

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
                <SetupGuidesTab
                    isStepCompleted={isStepCompleted}
                    onToggleStep={onToggleStep}
                    isSaving={isSaving}
                    t={t}
                    theme={theme}
                />
            </TabPanel>

            {/* Optimization Scheduler */}
            <TabPanel value={activeTab} index={1} className="print-section">
                <OptimizationTab
                    isStepCompleted={isStepCompleted}
                    onToggleStep={onToggleStep}
                    isSaving={isSaving}
                    t={t}
                    theme={theme}
                />
            </TabPanel>

            {/* Troubleshooting */}
            <TabPanel value={activeTab} index={2}>
                <TroubleshootingTab t={t} theme={theme} sessionContext={sessionContext} sessionId={sessionId} />
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
                    display: (index === 0 || index === 1 || index === 2) ? 'block !important' : 'none !important'
                }
            }}
            {...other}
        >
            {(value === index || index === 0 || index === 1 || index === 2) && (
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
