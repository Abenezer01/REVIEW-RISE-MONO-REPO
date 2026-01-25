/* eslint-disable import/no-unresolved */
'use client';

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Card, 
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Stack
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
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 4,
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
            Content Planner
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon icon="tabler-sparkles" fontSize={16} color="#7367F0" />
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              AI Strategy for your Brand DNA
            </Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          {plan && plan.status === 'converted' && (
            <Button
              component={Link}
              href={`/${locale}/admin/brand-rise/content`}
              variant="outlined"
              color="success"
              startIcon={<CheckCircleIcon />}
              endIcon={<ArrowForward />}
              sx={{ borderRadius: 2, fontWeight: 'bold' }}
            >
              View Scheduler
            </Button>
          )}
          {plan && plan.status !== 'converted' && (
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={converting ? <CircularProgress size={20} color="inherit" /> : <ContentPaste />}
              onClick={handleCreateDrafts}
              disabled={converting}
              sx={{ 
                borderRadius: 2, 
                fontWeight: 'bold',
                boxShadow: '0 4px 14px 0 rgba(115, 103, 240, 0.39)',
              }}
            >
              {converting ? 'Creating...' : 'Create Drafts'}
            </Button>
          )}
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
            onClick={handleGenerate}
            disabled={generating}
            sx={{ 
              borderRadius: 2, 
              fontWeight: 'bold',
              boxShadow: '0 4px 14px 0 rgba(115, 103, 240, 0.39)',
            }}
          >
            {generating ? 'Generating...' : 'Regenerate'}
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            plan?.status === 'converted' ? (
              <Button 
                color="inherit" 
                size="small" 
                component={Link} 
                href={`/${locale}/admin/brand-rise/content`}
                sx={{ fontWeight: 'bold' }}
              >
                GO TO SCHEDULER
              </Button>
            ) : null
          }
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sidebar Configuration */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Typography variant="subtitle1" fontWeight="800" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon="tabler-calendar-event" fontSize={20} />
                Timeline
              </Typography>
              <Divider sx={{ mb: 2.5, opacity: 0.6 }} />
              
              <Stack spacing={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontWeight: 500 }}>Month</InputLabel>
                  <Select 
                    value={month} 
                    label="Month" 
                    onChange={(e) => setMonth(Number(e.target.value))}
                    sx={{ borderRadius: 2 }}
                  >
                    {monthNames.map((name, i) => (
                      <MenuItem key={i + 1} value={i + 1}>{name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontWeight: 500 }}>Year</InputLabel>
                  <Select 
                    value={year} 
                    label="Year" 
                    onChange={(e) => setYear(Number(e.target.value))}
                    sx={{ borderRadius: 2 }}
                  >
                    {[2025, 2026].map(y => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Typography variant="subtitle1" fontWeight="800" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology sx={{ fontSize: 20 }} />
                Brand Strategy
              </Typography>
              <Divider sx={{ mb: 2.5, opacity: 0.6 }} />
              
              <Stack spacing={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontWeight: 500 }}>Industry</InputLabel>
                  <Select 
                    value={industry} 
                    label="Industry" 
                    onChange={(e) => setIndustry(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {industries.map(ind => (
                      <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontWeight: 500 }}>Frequency</InputLabel>
                  <Select 
                    value={frequency} 
                    label="Frequency" 
                    onChange={(e) => setFrequency(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {frequencies.map(f => (
                      <MenuItem key={f.value} value={f.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {f.icon}
                          {f.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontWeight: 500 }}>Platforms</InputLabel>
                  <Select 
                    multiple 
                    value={selectedPlatforms} 
                    label="Platforms" 
                    onChange={(e) => setSelectedPlatforms(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                    sx={{ borderRadius: 2 }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={value} 
                            size="small" 
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {availablePlatforms.map(platform => (
                      <MenuItem key={platform} value={platform}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Icon 
                            icon={PLATFORM_ICONS[platform].icon} 
                            fontSize={16} 
                            color={PLATFORM_ICONS[platform].color} 
                          />
                          {platform}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Paper>

            <Box sx={{ 
              p: 2.5, 
              borderRadius: 4, 
              bgcolor: 'rgba(115, 103, 240, 0.08)', 
              border: '1px dashed', 
              borderColor: 'primary.main',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <TipsAndUpdates sx={{ 
                position: 'absolute', 
                right: -10, 
                bottom: -10, 
                fontSize: 60, 
                opacity: 0.1,
                color: 'primary.main'
              }} />
              <Typography variant="caption" fontWeight="800" color="primary" gutterBottom display="flex" alignItems="center" gap={0.5}>
                <AutoAwesome sx={{ fontSize: 14 }} />
                AI ADAPTATION ACTIVE
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: 'block' }}>
                Strategy is automatically synced with your Brand DNA mission and voice.
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Plan Display */}
        <Grid size={{ xs: 12, md: 9 }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
              <CircularProgress size={40} thickness={4} sx={{ mb: 2, color: 'primary.main' }} />
              <Typography color="text.secondary" fontWeight="500">Curating your strategy...</Typography>
            </Box>
          ) : plan ? (
            <Box>
              <Paper sx={{ 
                p: 2.5, 
                mb: 4, 
                borderRadius: 4, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                background: 'linear-gradient(135deg, #7367F0 0%, #9E95F5 100%)', 
                color: 'white',
                boxShadow: '0 4px 20px 0 rgba(115, 103, 240, 0.2)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    p: 1, 
                    borderRadius: 2,
                    display: 'flex'
                  }}>
                    <CalendarToday sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2 }}>
                      {monthNames[plan.month - 1]} {plan.year}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>
                      Targeting {plan.industry}
                    </Typography>
                  </Box>
                </Box>
                <Chip 
                  label={plan.status === 'converted' ? 'DRAFTS CREATED' : 'STRATEGY READY'} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'white', 
                    color: plan.status === 'converted' ? 'success.main' : 'primary.main', 
                    fontWeight: '800',
                    fontSize: '0.65rem',
                    height: 24
                  }} 
                />
              </Paper>

              {Object.keys(groupedDays).map((week) => (
                <Box key={week} sx={{ mb: 5 }}>
                  <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: '800', letterSpacing: '0.1em', mb: 2, display: 'block' }}>
                    WEEK {week}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {groupedDays[week].map((day: any) => (
                      <Grid key={day.day} size={{ xs: 12 }}>
                        <Card variant="outlined" sx={{ 
                          borderRadius: 3, 
                          transition: 'all 0.2s ease-in-out',
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': { 
                            boxShadow: '0 8px 24px 0 rgba(0,0,0,0.05)',
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)'
                          },
                          position: 'relative',
                          overflow: 'visible'
                        }}>
                          {day.seasonalHook && (
                            <Box sx={{ 
                              position: 'absolute', 
                              top: -10, 
                              right: 20, 
                              bgcolor: 'secondary.main', 
                              color: 'white',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.65rem',
                              fontWeight: '800',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              boxShadow: '0 4px 10px 0 rgba(233, 30, 99, 0.3)',
                              zIndex: 1
                            }}>
                              <EventNoteIcon sx={{ fontSize: 12 }} />
                              {day.seasonalHook.toUpperCase()}
                            </Box>
                          )}
                          
                          <CardContent sx={{ display: 'flex', gap: { xs: 2, md: 3 }, p: '20px !important' }}>
                            <Box sx={{ 
                              minWidth: 54, 
                              height: 54, 
                              bgcolor: 'action.hover', 
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 2.5,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}>
                              <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: '800', opacity: 0.5, mb: -0.5 }}>DAY</Typography>
                              <Typography variant="h5" fontWeight="900" sx={{ color: 'text.primary' }}>{day.day}</Typography>
                            </Box>

                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 2 }}>
                                <Typography variant="subtitle1" fontWeight="800" color="text.primary" sx={{ lineHeight: 1.3 }}>
                                  {day.contentIdea}
                                </Typography>
                                <Chip 
                                  label={day.contentType.toUpperCase()} 
                                  size="small" 
                                  sx={{ 
                                    borderRadius: 1, 
                                    fontSize: '0.6rem', 
                                    fontWeight: '800',
                                    bgcolor: 'action.selected',
                                    color: 'text.secondary',
                                    height: 20
                                  }} 
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ 
                                mb: 2, 
                                lineHeight: 1.6,
                                fontStyle: day.suggestedCopy ? 'normal' : 'italic',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {day.suggestedCopy || "Generating creative adaptation..."}
                              </Typography>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction="row" spacing={0.5}>
                                  {day.platforms.map((p: string) => (
                                    <Box 
                                      key={p} 
                                      sx={{ 
                                        width: 24, 
                                        height: 24, 
                                        borderRadius: 1, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        bgcolor: 'action.hover',
                                        color: 'primary.main',
                                        border: '1px solid',
                                        borderColor: 'divider'
                                      }}
                                      title={p}
                                    >
                                      <Icon 
                                        icon={PLATFORM_ICONS[p].icon} 
                                        fontSize={14} 
                                        color={PLATFORM_ICONS[p].color} 
                                      />
                                    </Box>
                                  ))}
                                </Stack>
                                {plan.status === 'converted' && (
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.5,
                                    bgcolor: 'rgba(40, 199, 111, 0.12)',
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1
                                  }}>
                                    <CheckCircleIcon sx={{ fontSize: 12, color: 'success.main' }} />
                                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: '800', fontSize: '0.65rem' }}>
                                      SCHEDULED
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Paper sx={{ 
              p: { xs: 4, md: 10 }, 
              textAlign: 'center', 
              borderRadius: 8, 
              border: '2px dashed', 
              borderColor: 'divider', 
              bgcolor: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Box sx={{ 
                width: 100, 
                height: 100, 
                borderRadius: 4, 
                bgcolor: 'rgba(115, 103, 240, 0.08)', 
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                transform: 'rotate(-5deg)'
              }}>
                <Icon icon="tabler-sparkles" fontSize={48} />
              </Box>
              <Typography variant="h4" fontWeight="900" gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                Your Brand Strategy Starts Here
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 520, mx: 'auto', lineHeight: 1.6 }}>
                Let AI analyze your brand DNA and market trends to generate a high-performing 30-day content calendar tailored to your specific industry.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<AutoAwesome />}
                onClick={handleGenerate}
                disabled={generating}
                sx={{ 
                  px: 6, 
                  py: 1.5,
                  borderRadius: 3, 
                  fontWeight: '800',
                  fontSize: '1rem',
                  boxShadow: '0 8px 20px 0 rgba(115, 103, 240, 0.3)'
                }}
              >
                {generating ? 'Crafting Strategy...' : `Generate ${monthNames[month - 1]} Strategy`}
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
