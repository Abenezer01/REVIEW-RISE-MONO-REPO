'use client';

import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';

import { useBusinessId } from '@/hooks/useBusinessId';
import { BrandService } from '@/services/brand.service';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number;[key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />
}

const VisibilityPlanPage = () => {
  const { businessId } = useBusinessId();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const fetchPlan = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await BrandService.getVisibilityPlan(businessId);
      
      if (data && data.htmlContent) {
        try {
          const parsed = JSON.parse(data.htmlContent);
          setPlan({ ...parsed, title: data.title });
        } catch (e) {
          console.error('Failed to parse plan content', e);
          setPlan(null);
        }
      } else {
        setPlan(null);
      }
    } catch (error) {
      // 404 is expected if no plan exists
      console.log('No plan found or error');
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [businessId]);

  const handleGenerate = async () => {
    if (!businessId) return;
    setGenerating(true);
    try {
      await BrandService.generateVisibilityPlan(businessId);
      setTimeout(() => {
        setGenerating(false);
        fetchPlan();
      }, 4000);
    } catch (error) {
      console.error('Failed to generate plan', error);
      setGenerating(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'search': return 'tabler-search';
      case 'local': return 'tabler-map-pin';
      case 'social': return 'tabler-brand-linkedin'; // Defaulting to generic social or linkedin
      case 'content': return 'tabler-news';
      case 'reputation': return 'tabler-star';
      case 'conversion': return 'tabler-click';
      default: return 'tabler-checkbox';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'search': return 'primary';
      case 'local': return 'error';
      case 'social': return 'info';
      case 'content': return 'secondary';
      case 'reputation': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!plan) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 8, p: 3 }}>
        <Card sx={{ 
          p: 6, 
          textAlign: 'center', 
          borderRadius: 4,
          boxShadow: theme.shadows[10],
          bgcolor: 'background.paper'
        }}>
          <Stack alignItems="center" spacing={3}>
            <Box sx={{ 
              p: 3, 
              borderRadius: '50%', 
              bgcolor: 'primary.lightOpacity', 
              color: 'primary.main',
              display: 'inline-flex',
            }}>
              <Icon icon="tabler-map-2" fontSize={64} />
            </Box>
            
            <Typography variant="h3" fontWeight="bold" gutterBottom>Launch Your Visibility Plan</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
              Generate a data-backed, 30-day roadmap tailored to your brand's unique DNA. Outpace competitors with actionable steps.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              sx={{ px: 4, py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}
              startIcon={generating ? <CircularProgress size={24} color="inherit" /> : <Icon icon="tabler-wand" fontSize={24} />}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? 'Crafting Your Strategy...' : 'Generate 30-Day Blueprint'}
            </Button>
          </Stack>
        </Card>
      </Box>
    );
  }

  return (
    <Grid container spacing={4}>
      <Grid size={12}>
        <Card sx={{ 
          bgcolor: 'primary.lightOpacity', 
          color: 'primary.contrastText',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, transform: 'rotate(15deg)', color: 'common.white' }}>
            <Icon icon="tabler-rocket" fontSize={240} />
          </Box>
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
              <Box>
                <Chip label={plan.version || "v1.0"} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit', mb: 1 }} />
                <Typography variant="h3" fontWeight="bold" color="inherit" gutterBottom>{plan.title || '30-Day Growth Plan'}</Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 800, fontWeight: 'normal', color: 'inherit' }}>
                  {plan.overview}
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' }, minWidth: 200 }}>
                <Typography variant="h2" fontWeight="bold" color="inherit">30</Typography>
                <Typography variant="h6" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, color: 'inherit' }}>Day Timeline</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            {plan.weeks?.map((week: any, index: number) => (
              <Grid size={12} key={week.weekNumber}>
                 <Card sx={{ borderRadius: 3, borderLeft: 6, borderColor: 'primary.main' }}>
                    <CardHeader 
                      title={
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'primary.contrastText', 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}>
                            {week.weekNumber}
                          </Box>
                          <Typography variant="h6">Week {week.weekNumber}: {week.focus}</Typography>
                        </Stack>
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Stack spacing={2}>
                        {week.tasks?.map((task: any, i: number) => (
                          <Box key={i} sx={{ 
                            p: 2, 
                            bgcolor: 'action.hover', 
                            borderRadius: 2,
                            display: 'flex',
                            gap: 2,
                            alignItems: 'flex-start',
                            transition: 'transform 0.2s',
                            '&:hover': { bgcolor: 'action.selected' }
                          }}>
                            <Box sx={{ mt: 0.5 }}>
                              <Icon icon={getCategoryIcon(task.category)} fontSize={20} color={theme.palette[getCategoryColor(task.category) as any]?.main || theme.palette.text.secondary} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                                <Typography variant="subtitle1" fontWeight="bold">{task.title}</Typography>
                                <Chip 
                                  label={task.category} 
                                  size="small" 
                                  color={getCategoryColor(task.category) as any} 
                                  variant="outlined" 
                                  sx={{ textTransform: 'capitalize', height: 20 }}
                                />
                              </Stack>
                              <Typography variant="body2" color="text.secondary">{task.description}</Typography>
                              {task.estimatedHours && (
                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.7 }}>
                                  <Icon icon="tabler-clock" fontSize={14} />
                                  <Typography variant="caption">{task.estimatedHours}h est.</Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                 </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Grid>


      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={4}>
          <Card sx={{ borderRadius: 3}}>
            <CardHeader 
              title="Success Metrics" 
              subheader="KPI targets for this plan"
              avatar={<Box sx={{ bgcolor: 'secondary.light', p: 1, borderRadius: 2, color: 'secondary.main' }}><Icon icon="tabler-target" /></Box>}
            />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                {plan.goals?.map((metric: any, i: number) => (
                  <Box key={i}>
                    <Stack direction="row" justifyContent="space-between" mb={1} alignItems="flex-end">
                      <Typography variant="body2" fontWeight="bold">{metric.metric}</Typography>
                      <Typography variant="h6" color="primary" sx={{ lineHeight: 1 }}>{metric.target}</Typography>
                    </Stack>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                       <Typography variant="caption" color="text.secondary">Current: {metric.current || 0}</Typography>
                       <Box sx={{ flex: 1 }}>
                         <LinearProgress 
                            variant="determinate" 
                            value={metric.target ? Math.min(((metric.current || 0) / metric.target) * 100, 100) : 0} 
                            color="primary" 
                            sx={{ height: 6, borderRadius: 5, bgcolor: 'divider' }} 
                          />
                       </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }}>Target by {metric.timeframe}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
            
            <Divider sx={{ my: 0 }} />
            
            <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
               <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 1 }}>
                 <Icon icon="tabler-info-circle" fontSize={16} /> 
                 Metrics help track the effectiveness of this plan.
               </Typography>
            </Box>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
             <CardContent>
               <Typography variant="h6" gutterBottom>Expected Outcomes</Typography>
               <Stack spacing={2} mt={2}>
                 {plan.expectedOutcomes?.map((outcome: string, i: number) => (
                   <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                     <Box sx={{ mt: 0.5, color: 'success.main' }}>
                       <Icon icon="tabler-circle-check-filled" fontSize={18} />
                     </Box>
                     <Typography variant="body2">{outcome}</Typography>
                   </Box>
                 ))}
               </Stack>
             </CardContent>
          </Card>

          <Button 
            variant="outlined" 
            color="inherit" 
            fullWidth 
            onClick={() => setPlan(null)} // Hidden reset for demo, or real reset logic
            startIcon={<Icon icon="tabler-refresh" />}
          >
            Regenerate Plan
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default VisibilityPlanPage;
