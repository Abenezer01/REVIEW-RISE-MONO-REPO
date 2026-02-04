/* eslint-disable import/no-unresolved */
'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useTheme,
  alpha,
  Alert
} from '@mui/material';

import {
  ArrowForward,
  AutoAwesome,
  AutoGraph,
  CheckCircle as CheckCircleIcon,
  ContentPaste,
  EventNote as EventNoteIcon,
  Psychology,
  TipsAndUpdates
} from '@mui/icons-material';

import { useTranslations } from 'next-intl';

import { useBusinessId } from '@/hooks/useBusinessId';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { BrandService } from '@/services/brand.service';

const Icon = ({ icon, fontSize, color, ...rest }: { icon: string; fontSize?: number | string; color?: string;[key: string]: any }) => {
  return <i className={icon} style={{ fontSize, color }} {...rest} />;
};

const industries = [
  { key: 'restaurant' },
  { key: 'salon' },
  { key: 'agency' },
  { key: 'realEstate' }
];

const frequencies = [
  { value: 'low', key: 'low', icon: <AutoGraph sx={{ fontSize: 16 }} /> },
  { value: 'medium', key: 'medium', icon: <AutoGraph sx={{ fontSize: 16 }} /> },
  { value: 'high', key: 'high', icon: <AutoGraph sx={{ fontSize: 16 }} /> }
];

const PLATFORM_ICONS: Record<string, { icon: string, color: string }> = {
  'Instagram': { icon: 'tabler-brand-instagram', color: '#E4405F' },
  'Facebook': { icon: 'tabler-brand-facebook', color: '#1877F2' },
  'LinkedIn': { icon: 'tabler-brand-linkedin', color: '#0A66C2' },
  'Twitter': { icon: 'tabler-brand-x', color: '#000000' },
  'Google Business': { icon: 'tabler-brand-google', color: '#4285F4' }
};

export default function PlannerPage() {
  const theme = useTheme();
  const t = useTranslations('dashboard');
  const ts = useTranslations('studio.planner');
  const tp = useTranslations('social.planner');
  const isDark = theme.palette.mode === 'dark';
  const { businessId } = useBusinessId();
  const { locationId } = useLocationFilter();
  const { locale } = useParams();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter state
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [industry, setIndustry] = useState(industries[0].key);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['Instagram', 'Facebook']);
  const [frequency, setFrequency] = useState('medium');

  const availablePlatforms = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'Google Business'];

  useEffect(() => {
    if (businessId) {
      loadPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, month, year, locationId]);

  const loadPlan = async () => {
    if (!businessId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await BrandService.getMonthlyPlan(businessId, month, year, locationId);

      setPlan(data);
    } catch (err: any) {
      console.error(err);
      setError(ts('actions.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!businessId) return;

    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await BrandService.generateMonthlyPlan(businessId, {
        month,
        year,
        industry,
        platforms: selectedPlatforms,
        frequency,
        locationId
      });

      setPlan(data);
      setSuccess(ts('actions.generateSuccess'));
    } catch (err: any) {
      console.error(err);
      setError(ts('actions.generateError'));
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateDrafts = async () => {
    if (!plan || !businessId) return;

    setConverting(true);
    setError(null);
    setSuccess(null);

    try {
      await BrandService.convertPlanToDrafts(businessId, plan.id, locationId);
      setSuccess(ts('actions.syncSuccess'));
      loadPlan(); // Refresh plan status
    } catch (err: any) {
      console.error(err);
      setError(ts('actions.syncError'));
    } finally {
      setConverting(false);
    }
  };

  const monthKeys = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];

  // Group days by week
  const groupedDays = plan ? plan.days.reduce((acc: any, day: any) => {
    const week = Math.ceil(day.day / 7);

    if (!acc[week]) acc[week] = [];
    acc[week].push(day);

    return acc;
  }, {}) : {};

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header Section */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'flex-end' },
        mb: 6,
        gap: 3
      }}>
        <Box>
          <Typography variant="h4" fontWeight="900" gutterBottom sx={{ letterSpacing: '-0.02em' }}>
            {ts('title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8, fontWeight: 500 }}>
            {ts('description')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
          {plan && plan.status === 'converted' && (
            <Button
              component={Link}
              href={`/${locale}/admin/social-rise`}
              variant="outlined"
              color="success"
              startIcon={<CheckCircleIcon />}
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: '14px',
                fontWeight: 'bold',
                px: 3,
                height: 48,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 }
              }}
            >
              {t('navigation.social-rise')}
            </Button>
          )}
          {plan && plan.status !== 'converted' && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={converting ? <CircularProgress size="20" color="inherit" /> : <ContentPaste />}
              onClick={handleCreateDrafts}
              disabled={converting}
              sx={{
                borderRadius: '14px',
                fontWeight: '900',
                px: 4,
                height: 48,
                boxShadow: `0 8px 20px -6px ${alpha(theme.palette.secondary.main, 0.5)}`,
                '&:hover': {
                  boxShadow: `0 12px 25px -6px ${alpha(theme.palette.secondary.main, 0.6)}`,
                }
              }}
            >
              {converting ? ts('actions.syncing') : ts('actions.syncToScheduler')}
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={generating ? <CircularProgress size="20" color="inherit" /> : <AutoAwesome />}
            onClick={handleGenerate}
            disabled={generating}
            sx={{
              borderRadius: '14px',
              fontWeight: '900',
              px: 4,
              height: 48,
              boxShadow: `0 8px 20px -6px ${alpha(theme.palette.primary.main, 0.5)}`,
              '&:hover': {
                boxShadow: `0 12px 25px -6px ${alpha(theme.palette.primary.main, 0.6)}`,
              }
            }}
          >
            {generating ? ts('actions.generating') : plan ? ts('actions.regenerate') : ts('actions.generate')}
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert
          severity="error"
          variant="filled"
          sx={{ mb: 4, borderRadius: '16px', fontWeight: 600 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          variant="filled"
          sx={{ mb: 4, borderRadius: '16px', fontWeight: 600 }}
          action={
            plan?.status === 'converted' ? (
              <Button
                color="inherit"
                size="small"
                component={Link}
                href={`/${locale}/admin/social-rise`}
                sx={{ fontWeight: '900', border: '1px solid white', borderRadius: '8px', ml: 2 }}
              >
                {tp('goToScheduler')}
              </Button>
            ) : null
          }
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Sidebar Configuration */}
        <Grid size={{ xs: 12, md: 3.5 }}>
          <Stack spacing={3}>
            <Paper sx={{
              p: 4,
              borderRadius: '24px',
              border: `1px solid ${isDark ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.divider, 0.8)}`,
              boxShadow: isDark ? 'none' : '0 20px 40px -12px rgba(0,0,0,0.08)',
              bgcolor: isDark ? alpha(theme.palette.background.paper, 0.4) : theme.palette.background.paper,
              backdropFilter: 'blur(10px)'
            }}>
              <Typography variant="h6" fontWeight="900" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Psychology sx={{ fontSize: 24, color: theme.palette.primary.main }} />
                {ts('controls.title')}
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ display: 'block', mb: 1, ml: 0.5, letterSpacing: '0.05em' }}>
                    {ts('controls.targetPeriod')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 8 }}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={month}
                          onChange={(e) => setMonth(Number(e.target.value))}
                          sx={{
                            borderRadius: '12px',
                            fontWeight: 600,
                            bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.primary.main, 0.02)
                          }}
                        >
                          {monthKeys.map((key, i) => (
                            <MenuItem key={i + 1} value={i + 1}>{ts(`months.${key}`)}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={year}
                          onChange={(e) => setYear(Number(e.target.value))}
                          sx={{
                            borderRadius: '12px',
                            fontWeight: 600,
                            bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.primary.main, 0.02)
                          }}
                        >
                          {[2025, 2026].map(y => (
                            <MenuItem key={y} value={y}>{y}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ display: 'block', mb: 1, ml: 0.5, letterSpacing: '0.05em' }}>
                    {ts('controls.brandContext')}
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      sx={{
                        borderRadius: '12px',
                        fontWeight: 600,
                        bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.primary.main, 0.02)
                      }}
                    >
                      {industries.map(ind => (
                        <MenuItem key={ind.key} value={ind.key}>{ts(`industries.${ind.key}`)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ display: 'block', mb: 1, ml: 0.5, letterSpacing: '0.05em' }}>
                    {ts('controls.publishingFrequency')}
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      sx={{
                        borderRadius: '12px',
                        fontWeight: 600,
                        bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.primary.main, 0.02)
                      }}
                    >
                      {frequencies.map(f => (
                        <MenuItem key={f.value} value={f.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {f.icon}
                            {ts(`frequencies.${f.key}`)}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ display: 'block', mb: 1, ml: 0.5, letterSpacing: '0.05em' }}>
                    {ts('controls.activeChannels')}
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      multiple
                      value={selectedPlatforms}
                      onChange={(e) => setSelectedPlatforms(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                      sx={{
                        borderRadius: '12px',
                        fontWeight: 600,
                        bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.primary.main, 0.02)
                      }}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                borderRadius: '8px',
                                bgcolor: alpha(PLATFORM_ICONS[value]?.color || '#7367F0', 0.1),
                                color: PLATFORM_ICONS[value]?.color || 'inherit',
                                border: `1px solid ${alpha(PLATFORM_ICONS[value]?.color || '#7367F0', 0.2)}`
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {availablePlatforms.map(platform => (
                        <MenuItem key={platform} value={platform}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Icon
                              icon={PLATFORM_ICONS[platform].icon}
                              fontSize={18}
                              color={PLATFORM_ICONS[platform].color}
                            />
                            <Typography fontWeight={500}>{platform}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Paper>

            <Box sx={{
              p: 3,
              borderRadius: '24px',
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.05),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <AutoAwesome sx={{
                position: 'absolute',
                right: -15,
                top: -15,
                fontSize: 100,
                opacity: 0.05,
                color: 'primary.main',
                transform: 'rotate(-15deg)'
              }} />
              <Typography variant="subtitle2" fontWeight="900" color="primary" gutterBottom display="flex" alignItems="center" gap={1}>
                <TipsAndUpdates sx={{ fontSize: 18 }} />
                {ts('emptyState.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
                {ts('emptyState.description')}
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Plan Display */}
        <Grid size={{ xs: 12, md: 8.5 }}>
          {loading ? (
            <Paper sx={{
              p: 8,
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 500,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              bgcolor: alpha(theme.palette.background.paper, 0.5)
            }}>
              <Box sx={{ position: 'relative', mb: 3 }}>
                <CircularProgress size={64} thickness={4} sx={{ color: 'primary.main' }} />
                <AutoAwesome sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 24,
                  color: 'primary.main'
                }} />
              </Box>
              <Typography variant="h6" fontWeight="900" gutterBottom>{ts('loading.title')}</Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 300 }}>
                {ts('loading.description')}
              </Typography>
            </Paper>
          ) : plan ? (
            <Box>
              <Paper sx={{
                p: 3.5,
                mb: 5,
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isDark
                  ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.6)} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                boxShadow: `0 20px 40px -12px ${alpha(theme.palette.primary.main, 0.4)}`,
                border: isDark ? `1px solid ${alpha(theme.palette.common.white, 0.1)}` : 'none',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box sx={{
                  position: 'absolute',
                  right: -20,
                  top: -20,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  filter: 'blur(40px)'
                }} />

                <Stack direction="row" spacing={3} alignItems="center">
                  <Box sx={{
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <EventNoteIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.02em', mb: 0.5, color: 'white' }}>
                      {ts('status.ready')}
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Chip
                        label={plan.status === 'converted' ? ts('status.synced') : ts('status.ready')}
                        size="small"
                        sx={{
                          bgcolor: plan.status === 'converted' ? alpha(theme.palette.success.light, 0.9) : 'white',
                          color: plan.status === 'converted' ? 'success.dark' : 'primary.main',
                          fontWeight: 900,
                          fontSize: '0.65rem',
                          height: 24,
                          letterSpacing: '0.05em',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 700, letterSpacing: '0.02em', color: 'white' }}>
                        • {plan.days.length} {ts('dayPlan')}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              {Object.keys(groupedDays).map((week) => (
                <Box key={week} sx={{ mb: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: '900', letterSpacing: '0.05em' }}>
                      {ts('week')} {week}
                    </Typography>
                    <Divider sx={{ flexGrow: 1, borderColor: alpha(theme.palette.primary.main, 0.2), borderStyle: 'dashed' }} />
                  </Box>

                  <Stack spacing={2}>
                    {groupedDays[week].map((day: any) => (
                      <Card key={day.day} variant="outlined" sx={{
                        borderRadius: '20px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: `1px solid ${isDark ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.divider, 0.6)}`,
                        bgcolor: isDark ? alpha(theme.palette.background.paper, 0.4) : theme.palette.background.paper,
                        '&:hover': {
                          boxShadow: isDark ? 'none' : '0 15px 35px -10px rgba(0,0,0,0.08)',
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          transform: 'translateX(8px)',
                          bgcolor: isDark ? alpha(theme.palette.background.paper, 0.8) : theme.palette.background.paper
                        },
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {day.seasonalHook && (
                          <Box sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: theme.palette.warning.dark,
                            px: 2,
                            py: 0.5,
                            borderBottomLeftRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.8,
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            borderLeft: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                            borderBottom: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                          }}>
                            <AutoAwesome sx={{ fontSize: 14 }} />
                            {day.seasonalHook.toUpperCase()}
                          </Box>
                        )}

                        <CardContent sx={{ p: '24px !important' }}>
                          <Grid container spacing={3} alignItems="center">
                            <Grid size={{ xs: 2, sm: 1.5 }}>
                              <Box sx={{
                                textAlign: 'center',
                                p: 1.5,
                                borderRadius: '16px',
                                bgcolor: alpha(theme.palette.primary.main, 0.06),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                              }}>
                                <Typography variant="caption" fontWeight="900" color="primary.main" sx={{ display: 'block', mb: -0.5 }}>
                                  {ts('dayLabel')}
                                </Typography>
                                <Typography variant="h4" fontWeight="900" color="primary.main">
                                  {day.day}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid size={{ xs: 10, sm: 7.5 }}>
                              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Chip
                                  label={day.contentType || day.type || ts('contentType.post')}
                                  size="small"
                                  sx={{
                                    borderRadius: '8px',
                                    fontWeight: 900,
                                    fontSize: '0.65rem',
                                    height: 22,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    textTransform: 'uppercase'
                                  }}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  {day.platforms.map((p: string) => (
                                    <Icon
                                      key={p}
                                      icon={PLATFORM_ICONS[p]?.icon || 'tabler-circle'}
                                      fontSize={16}
                                      color={PLATFORM_ICONS[p]?.color || 'inherit'}
                                    />
                                  ))}
                                </Box>
                              </Box>
                              <Typography variant="h6" fontWeight="800" sx={{ mb: 1, letterSpacing: '-0.01em' }}>
                                {day.topic}
                              </Typography>

                              <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ display: 'block', mb: 0.5, letterSpacing: '0.05em' }}>
                                  {ts('contentIdea')}
                                </Typography>
                                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, lineHeight: 1.6, mb: 2 }}>
                                  {day.contentIdea || day.content}
                                </Typography>
                              </Box>

                              {day.suggestedCopy && (
                                <Box sx={{
                                  p: 2,
                                  borderRadius: '12px',
                                  bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.primary.main, 0.02),
                                  border: `1px solid ${isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.primary.main, 0.05)}`
                                }}>
                                  <Typography variant="caption" fontWeight="900" color="primary.main" sx={{ display: 'block', mb: 1, letterSpacing: '0.05em' }}>
                                    {ts('draftCaption')}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{
                                    fontStyle: 'italic',
                                    lineHeight: 1.5,
                                    whiteSpace: 'pre-wrap'
                                  }}>
                                    &quot;{day.suggestedCopy}&quot;
                                  </Typography>
                                </Box>
                              )}
                            </Grid>

                            <Grid size={{ xs: 12, sm: 3 }}>
                              <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'row', sm: 'column' },
                                gap: 1,
                                justifyContent: 'flex-end',
                                alignItems: { xs: 'center', sm: 'flex-end' }
                              }}>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ display: 'block' }}>
                                    {ts('optimalTime')}
                                  </Typography>
                                  <Typography variant="subtitle2" fontWeight="900">
                                    {day.time || ts('defaultTime')}
                                  </Typography>
                                </Box>
                                <Box sx={{
                                  p: 0.8,
                                  borderRadius: '10px',
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  color: theme.palette.info.main,
                                  display: 'flex'
                                }}>
                                  <Icon icon="tabler-clock-play" fontSize={18} />
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Box>
          ) : (
            <Paper sx={{
              p: 8,
              borderRadius: '32px',
              textAlign: 'center',
              border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`,
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 500,
              gap: 3
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '24px', 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 1
              }}>
                <TipsAndUpdates sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="900" gutterBottom>
                  {ts('emptyState.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', opacity: 0.8, mb: 2 }}>
                  {ts('emptyState.description')}
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesome />}
                onClick={handleGenerate}
                sx={{
                  borderRadius: '18px',
                  fontWeight: '900',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  boxShadow: `0 20px 40px -12px ${alpha(theme.palette.primary.main, 0.5)}`,
                  '&:hover': {
                    boxShadow: `0 25px 50px -12px ${alpha(theme.palette.primary.main, 0.6)}`,
                    transform: 'translateY(-4px)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {ts('actions.generate')}
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
