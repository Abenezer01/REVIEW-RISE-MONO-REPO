/* eslint-disable import/no-unresolved */
'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  FormControl, 
  Select, 
  MenuItem, 
  Card, 
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
  alpha
} from '@mui/material';

import { 
  CalendarToday, 
  AutoAwesome, 
  ContentPaste, 
  EventNote as EventNoteIcon,
  ArrowForward,
  CheckCircle as CheckCircleIcon,
  Psychology,
  AutoGraph,
  TipsAndUpdates
} from '@mui/icons-material';

import { useBusinessId } from '@/hooks/useBusinessId';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { BrandService } from '@/services/brand.service';

const Icon = ({ icon, fontSize, color, ...rest }: { icon: string; fontSize?: number | string; color?: string; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize, color }} {...rest} />;
};

const industries = ['Local Restaurant', 'Salon', 'Agency', 'Real Estate'];

const frequencies = [
  { value: 'low', label: 'Low (2x/week)', icon: <AutoGraph sx={{ fontSize: 16 }} /> },
  { value: 'medium', label: 'Medium (3x/week)', icon: <AutoGraph sx={{ fontSize: 16 }} /> },
  { value: 'high', label: 'High (Daily)', icon: <AutoGraph sx={{ fontSize: 16 }} /> }
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
  const [industry, setIndustry] = useState(industries[0]);
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
      setError('Failed to load plan');
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
      setSuccess('Content plan generated successfully!');
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate plan. Make sure templates are seeded.');
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
      setSuccess('Draft posts created in Scheduler!');
      loadPlan(); // Refresh plan status
    } catch (err: any) {
      console.error(err);
      setError('Failed to create draft posts');
    } finally {
      setConverting(false);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: '12px', 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex'
            }}>
              <CalendarToday sx={{ color: theme.palette.primary.main }} />
            </Box>
            <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-0.03em' }}>
              Content Planner
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, fontWeight: 500 }}>
            Generate a comprehensive 30-day social media strategy tailored to your Brand DNA and seasonal events.
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
              View Scheduler
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
              {converting ? 'Creating...' : 'Sync to Scheduler'}
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
            {generating ? 'Generating...' : plan ? 'Regenerate Strategy' : 'Generate Monthly Strategy'}
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
                GO TO SCHEDULER
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
                Strategy Controls
              </Typography>
              
              <Stack spacing={3}>
                <Box>
                  <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ display: 'block', mb: 1, ml: 0.5, letterSpacing: '0.05em' }}>
                    TARGET PERIOD
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
                          {monthNames.map((name, i) => (
                            <MenuItem key={i + 1} value={i + 1}>{name}</MenuItem>
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
                    BRAND CONTEXT
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
                        <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ display: 'block', mb: 1, ml: 0.5, letterSpacing: '0.05em' }}>
                    PUBLISHING FREQUENCY
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
                            {f.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ display: 'block', mb: 1, ml: 0.5, letterSpacing: '0.05em' }}>
                    ACTIVE CHANNELS
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
                Smart Adaptation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
                Our AI considers your Brand DNA, target industry, and global seasonal events to craft a unique strategy that resonates with your audience.
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
              <Typography variant="h6" fontWeight="900" gutterBottom>Curating your content strategy</Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 300 }}>
                We&apos;re analyzing your brand and upcoming events to generate the perfect plan...
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
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative' }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    backdropFilter: 'blur(10px)',
                    p: 2, 
                    borderRadius: '18px',
                    display: 'flex',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <EventNoteIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Box sx={{ color: 'white' }}>
                    <Typography variant="h5" fontWeight="900" sx={{ lineHeight: 1.2, color: 'inherit' }}>
                      {monthNames[plan.month - 1]} {plan.year} Strategy
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, color: 'inherit' }}>
                        <Icon icon="tabler-briefcase" fontSize={14} /> {plan.industry}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, color: 'inherit' }}>
                        <Icon icon="tabler-calendar" fontSize={14} /> 30 Day Plan
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
                
                <Chip 
                  label={plan.status === 'converted' ? 'SYNCED TO SCHEDULER' : 'STRATEGY READY'} 
                  sx={{ 
                    bgcolor: 'white', 
                    color: plan.status === 'converted' ? 'success.main' : 'primary.main', 
                    fontWeight: '900',
                    fontSize: '0.7rem',
                    height: 32,
                    px: 1,
                    borderRadius: '10px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }} 
                />
              </Paper>

              {Object.keys(groupedDays).map((week) => (
                <Box key={week} sx={{ mb: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: '900', letterSpacing: '0.05em' }}>
                      WEEK {week}
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
                                  DAY
                                </Typography>
                                <Typography variant="h4" fontWeight="900" color="primary.main">
                                  {day.day}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid size={{ xs: 10, sm: 7.5 }}>
                              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Chip 
                                  label={day.contentType || day.type || 'Post'} 
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
                                  CONTENT IDEA
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
                                    DRAFT CAPTION
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
                                    OPTIMAL TIME
                                  </Typography>
                                  <Typography variant="subtitle2" fontWeight="900">
                                    {day.time || '10:00 AM'}
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
              p: 10, 
              borderRadius: '32px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: 500,
              border: `2px dashed ${alpha(theme.palette.divider, 0.8)}`,
              bgcolor: isDark ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.primary.main, 0.01),
              textAlign: 'center'
            }}>
              <Box sx={{ 
                width: 120, 
                height: 120, 
                borderRadius: '40px', 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                position: 'relative'
              }}>
                <AutoAwesome sx={{ fontSize: 60, color: theme.palette.primary.main }} />
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: -10, 
                  right: -10, 
                  bgcolor: theme.palette.secondary.main, 
                  color: 'white',
                  p: 1,
                  borderRadius: '12px',
                  display: 'flex',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}>
                  <Psychology sx={{ fontSize: 24 }} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight="900" gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                Ready to plan your month?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mb: 5, fontWeight: 500, lineHeight: 1.6 }}>
                Our AI strategist is ready to create a high-converting content calendar based on your Brand DNA and the upcoming seasonal landscape.
              </Typography>
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
                Generate Monthly Strategy
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
