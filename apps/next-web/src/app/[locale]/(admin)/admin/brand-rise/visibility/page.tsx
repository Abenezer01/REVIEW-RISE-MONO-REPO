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
      // Ensure we access the 'data' field of the report if that's how it's stored
      setPlan(data?.data || null);
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

      // Poll or wait logic (mocked for now)
      setTimeout(() => {
        setGenerating(false);
        fetchPlan();
      }, 4000);

    } catch (error) {
      console.error('Failed to generate plan', error);
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!plan) {
    return (
      <Card sx={{ p: 5, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 10 }}>
        <Box sx={{ mb: 3 }}>
          <Icon icon="tabler-map-2" fontSize={64} color={theme.palette.primary.main} />
        </Box>
        <Typography variant="h4" gutterBottom>30-Day Visibility Plan</Typography>
        <Typography color="text.secondary" mb={4}>
          Generate a comprehensive, step-by-step action plan tailored to your brand's unique needs and current performance.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <Icon icon="tabler-wand" fontSize={20} />}
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? 'Crafting Plan...' : 'Generate 30-Day Plan'}
        </Button>
      </Card>
    );
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Card sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" color="white" gutterBottom>{plan.title || 'Your 30-Day Growth Plan'}</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {plan.overview || 'Follow this roadmap to significantly boost your local visibility and brand trust.'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h3" color="white">30 Days</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Timeline</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title="Weekly Roadmap" />
          <Divider />
          <CardContent>
            <Timeline position="right">
              {plan.week1 && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="primary"><Icon icon="tabler-number-1" fontSize={16} /></TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Typography variant="h6" component="span">Week 1: Foundation</Typography>
                    <Typography className='mb-2'>{plan.week1.focus}</Typography>
                    <Stack spacing={1} mt={1}>
                      {plan.week1.tasks?.map((task: string, i: number) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                          <Icon icon="tabler-check" fontSize={16} color={theme.palette.success.main} />
                          <Typography variant="body2">{task}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </TimelineContent>
                </TimelineItem>
              )}

              {plan.week2 && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="info"><Icon icon="tabler-number-2" fontSize={16} /></TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Typography variant="h6" component="span">Week 2: Optimization</Typography>
                    <Typography className='mb-2'>{plan.week2.focus}</Typography>
                    <Stack spacing={1} mt={1}>
                      {plan.week2.tasks?.map((task: string, i: number) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                          <Icon icon="tabler-check" fontSize={16} color={theme.palette.success.main} />
                          <Typography variant="body2">{task}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </TimelineContent>
                </TimelineItem>
              )}

              {plan.week3 && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="warning"><Icon icon="tabler-number-3" fontSize={16} /></TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Typography variant="h6" component="span">Week 3: Engagement</Typography>
                    <Typography className='mb-2'>{plan.week3.focus}</Typography>
                    <Stack spacing={1} mt={1}>
                      {plan.week3.tasks?.map((task: string, i: number) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                          <Icon icon="tabler-check" fontSize={16} color={theme.palette.success.main} />
                          <Typography variant="body2">{task}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </TimelineContent>
                </TimelineItem>
              )}

              {plan.week4 && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="success"><Icon icon="tabler-number-4" fontSize={16} /></TimelineDot>
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Typography variant="h6" component="span">Week 4: Growth</Typography>
                    <Typography className='mb-2'>{plan.week4.focus}</Typography>
                    <Stack spacing={1} mt={1}>
                      {plan.week4.tasks?.map((task: string, i: number) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                          <Icon icon="tabler-check" fontSize={16} color={theme.palette.success.main} />
                          <Typography variant="body2">{task}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </TimelineContent>
                </TimelineItem>
              )}
            </Timeline>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Stack spacing={4}>
          <Card>
            <CardHeader title="Success Metrics" />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                {plan.successMetrics?.map((metric: any, i: number) => (
                  <Box key={i}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" fontWeight="bold">{metric.metric}</Typography>
                      <Typography variant="body2" color="primary">{metric.target}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={70} color="primary" sx={{ height: 6, borderRadius: 5 }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Alert severity="info" icon={<Icon icon="tabler-info-circle" fontSize={20} />}>
            This plan is dynamic. As you complete tasks and your metrics improve, generate a new plan to keep your growth momentum.
          </Alert>

          <Button variant="outlined" color="error" fullWidth>
            Reset Plan
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default VisibilityPlanPage;
