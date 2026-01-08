import { useTranslations } from 'next-intl';
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
import { useTheme, alpha } from '@mui/material/styles';

import { useBusinessId } from '@/hooks/useBusinessId';
import { BrandService } from '@/services/brand.service';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number;[key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />
}

interface VisibilityPlanDetailsProps {
    onBack: () => void;
    reportId?: string; // For future use if we have multiple reports
}

export const VisibilityPlanDetails = ({ onBack, reportId }: VisibilityPlanDetailsProps) => {
  const { businessId } = useBusinessId();
  const t = useTranslations('dashboard.brandRise.visibilityPlan');
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);


  const fetchPlan = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      let data;
      
      if (reportId) {
        // Fetch specific report
        const report = await BrandService.getReport(businessId, reportId);
        data = report; 
      } else {
        // Fetch latest/active plan
        data = await BrandService.getVisibilityPlan(businessId);
      }
      
      if (data && data.htmlContent) {
        try {
          const parsed = JSON.parse(data.htmlContent);
          setPlan({ ...parsed, title: data.title, version: data.version }); // Include version/title from wrapper
        } catch (e) {
          console.error('Failed to parse plan content', e);
          setPlan(null);
        }
      } else {
        setPlan(null);
      }
    } catch (error) {
      console.log('No plan found or error', error);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [businessId]);



  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'search': return 'tabler-search';
      case 'local': return 'tabler-map-pin';
      case 'social': return 'tabler-brand-linkedin';
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', textAlign: 'center' }}>
            <Box sx={{ p: 3, borderRadius: '50%', bgcolor: 'action.hover', color: 'text.secondary', mb: 2 }}>
                <Icon icon="tabler-search" fontSize={48} />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>No Plan Found</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Generate a Visibility Plan from the dashboard to get started.
            </Typography>
            <Button variant="outlined" onClick={onBack} startIcon={<Icon icon="tabler-arrow-left" />}>
                {t('backToDashboard')}
            </Button>
        </Box>
    );
  }

  return (
    <Stack spacing={4}>
        <Box>
            <Button 
                startIcon={<Icon icon="tabler-arrow-left" fontSize={18} />} 
                onClick={onBack}
                sx={{ mb: 2, color: 'text.secondary' }}
            >
                {t('backToDashboard')}
            </Button>
            
            <Stack spacing={4}>
                    {/* Hero Section */}
                    <Card sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff', 
                        borderRadius: 4, 
                        p: { xs: 3, md: 5 },
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ 
                            position: 'absolute', 
                            top: -50, 
                            right: -50, 
                            width: 300, 
                            height: 300, 
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                            zIndex: 0
                        }} />
                        
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative', zIndex: 1, mb: 3 }}>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'inherit' }}>
                                    {t('launchTitle')}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 500, color: 'inherit' }}>
                                    {plan.overview || t('launchSubtitle')}
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                                <Button variant="outlined" size="small" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                    {t('sharePlan')}
                                </Button>
                                <Button variant="contained" size="small" sx={{ bgcolor: 'warning.main', color: theme.palette.mode === 'dark' ? '#000' : '#fff', '&:hover': { bgcolor: 'warning.dark' } }}>
                                    {t('exportPlan')}
                                </Button>
                            </Stack>
                        </Stack>
                        
                        <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Stack direction="row" spacing={4}>
                                    <Box>
                                        <Typography variant="h3" fontWeight="bold" sx={{ color: 'inherit' }}>{plan.weeks?.reduce((acc: number, w: any) => acc + (w.tasks?.length || 0), 0) || 47}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 1, color: 'inherit', fontSize: '0.65rem' }}>{t('totalTasks')}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h3" fontWeight="bold" sx={{ color: 'inherit' }}>12</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 1, color: 'inherit', fontSize: '0.65rem' }}>{t('completed')}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h3" fontWeight="bold" sx={{ color: 'inherit' }}>{plan.weeks?.length || 4}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 1, color: 'inherit', fontSize: '0.65rem' }}>{t('weeks')}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                            
                            <Grid size={{ xs: 12, md: 4 }} display="flex" justifyContent="flex-end" alignItems="center">
                                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                    <CircularProgress 
                                        variant="determinate" 
                                        value={100} 
                                        size={140} 
                                        thickness={8} 
                                        sx={{ color: 'rgba(255,255,255,0.2)' }} 
                                    />
                                    <CircularProgress 
                                        variant="determinate" 
                                        value={26} 
                                        size={140} 
                                        thickness={8} 
                                        sx={{ 
                                            color: '#fff',
                                            position: 'absolute',
                                            left: 0,
                                            [`& .MuiCircularProgress-circle`]: { strokeLinecap: 'round' }
                                        }} 
                                    />
                                    <Box sx={{
                                        top: 0, left: 0, bottom: 0, right: 0, position: 'absolute',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                                    }}>
                                        <Typography variant="h3" fontWeight="bold" sx={{ color: 'inherit' }}>26%</Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', letterSpacing: 1 }}>{t('complete')}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ ml: 2, textAlign: 'left' }}>
                                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', fontSize: '0.65rem' }}>{t('daysRemaining', { days: 22 })}</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Card>

                    <Typography variant="h5" fontWeight="bold" textAlign="center" pt={4} pb={2}>
                        {t('weeklyActionPlan')}
                    </Typography>

                    {/* Weeks */}
                    {plan.weeks?.map((week: any, wIndex: number) => {
                         // Group tasks by category
                         const tasksByCategory: Record<string, any[]> = {};
                         week.tasks?.forEach((task: any) => {
                             const cat = task.category || 'General';
                             if (!tasksByCategory[cat]) tasksByCategory[cat] = [];
                             tasksByCategory[cat].push(task);
                         });

                         return (
                            <Box key={week.weekNumber}>
                                {/* Week Header */}
                                <Box sx={{ 
                                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                                    p: 2.5, 
                                    borderRadius: 3, 
                                    mb: 3,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                                            Week {week.weekNumber}: {week.focus}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Feb 1-7, 2024
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Chip 
                                            label={wIndex === 0 ? t('statusCompleted') : t('statusInProgress')} 
                                            size="small" 
                                            sx={{ 
                                                fontWeight: 'bold', 
                                                bgcolor: wIndex === 0 ? 'success.main' : 'warning.main',
                                                color: '#fff',
                                                fontSize: '0.65rem',
                                                letterSpacing: 0.5
                                            }} 
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {t('tasksCount', { completed: tasksByCategory ? Object.values(tasksByCategory).flat().length : 0, total: week.tasks?.length || 0 })}
                                        </Typography>
                                    </Stack>
                                </Box>

                                {/* Categories Grid */}
                                <Grid container spacing={3}>
                                    {Object.entries(tasksByCategory).map(([category, tasks]) => (
                                        <Grid size={{ xs: 12, md: 4 }} key={category}>
                                            <Card sx={{ 
                                                height: '100%', 
                                                bgcolor: alpha(theme.palette.background.paper, 0.4), 
                                                borderRadius: 3, 
                                                border: '1px solid', 
                                                borderColor: 'divider',
                                                boxShadow: 'none',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    borderColor: (theme.palette as any)[getCategoryColor(category)]?.main || theme.palette.primary.main,
                                                    boxShadow: `0 0 0 1px ${alpha((theme.palette as any)[getCategoryColor(category)]?.main || theme.palette.primary.main, 0.2)}`
                                                }
                                            }}>
                                                <CardContent sx={{ p: 3 }}>
                                                    <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
                                                        <Box sx={{ 
                                                            p: 1, 
                                                            borderRadius: 1.5, 
                                                            bgcolor: (theme.palette as any)[getCategoryColor(category)]?.main || theme.palette.primary.main,
                                                            color: '#fff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Icon icon={getCategoryIcon(category)} fontSize={20} />
                                                        </Box>
                                                        <Typography variant="subtitle2" fontWeight="bold">{category}</Typography>
                                                    </Stack>
                                                    
                                                    <Stack spacing={2}>
                                                        {tasks.map((task: any, tIndex: number) => (
                                                            <Stack key={tIndex} direction="row" spacing={1.5} alignItems="flex-start">
                                                                <Box sx={{ 
                                                                    mt: 0.5, 
                                                                    minWidth: 20, 
                                                                    height: 20, 
                                                                    borderRadius: 1, 
                                                                    border: '2px solid',
                                                                    borderColor: 'divider',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    cursor: 'pointer',
                                                                    '&:hover': { borderColor: 'primary.main' }
                                                                }} />
                                                                <Box>
                                                                    <Typography variant="body2" fontWeight="500">{task.title}</Typography>
                                                                    {task.estimatedHours && (
                                                                         <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                                             {task.estimatedHours}h
                                                                         </Typography>
                                                                    )}
                                                                </Box>
                                                            </Stack>
                                                        ))}
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                         );
                    })}

                    {/* Bottom Section: Goals & Resources */}
                    <Grid container spacing={4} sx={{ mt: 5 }}>
                        <Grid size={{ xs: 12, md: 7 }}>
                             <Typography variant="h6" fontWeight="bold" gutterBottom>{t('goals30Day')}</Typography>
                             <Card sx={{ 
                                 bgcolor: alpha(theme.palette.background.paper, 0.4), 
                                 borderRadius: 4, 
                                 p: 4,
                                 border: '1px solid',
                                 borderColor: 'divider'
                             }}>
                                <Stack spacing={3.5}>
                                    {plan.goals?.map((metric: any, i: number) => (
                                        <Box key={i}>
                                            <Stack direction="row" justifyContent="space-between" mb={1}>
                                                <Typography variant="subtitle2" fontWeight="600">{metric.metric}</Typography>
                                                <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'warning.main' }}>{metric.target}</Typography>
                                            </Stack>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={metric.target ? Math.min(((metric.current || 0) / metric.target) * 100, 100) : 0} 
                                                sx={{ 
                                                    height: 10, 
                                                    borderRadius: 5, 
                                                    bgcolor: alpha(theme.palette.warning.main, 0.15),
                                                    '& .MuiLinearProgress-bar': { 
                                                        bgcolor: 'warning.main',
                                                        borderRadius: 5
                                                    }
                                                }}
                                            />
                                            <Stack direction="row" justifyContent="space-between" mt={0.5}>
                                                <Typography variant="caption" color="text.secondary">{t('current', { value: metric.current || 0 })}</Typography>
                                                <Typography variant="caption" color="text.secondary">{t('target', { value: metric.target })}</Typography>
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                             </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>{t('helpfulResources')}</Typography>
                            <Card sx={{ 
                                bgcolor: 'secondary.main',
                                color: theme.palette.secondary.contrastText, 
                                borderRadius: 4, 
                                p: 3.5
                            }}>
                                <Stack spacing={3}>
                                    {[
                                        { key: 'seo', icon: 'tabler-book' },
                                        { key: 'social', icon: 'tabler-player-play' },
                                        { key: 'content', icon: 'tabler-bulb' }
                                    ].map((resource, i) => (
                                        <Stack key={i} direction="row" spacing={2}>
                                            <Box sx={{ 
                                                p: 1.5, 
                                                borderRadius: 2, 
                                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#fff',
                                                color: 'secondary.main',
                                                height: 'fit-content',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Icon icon={resource.icon} fontSize={24} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'inherit', mb: 0.5 }}>{t(`resources.${resource.key}.title`)}</Typography>
                                                <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mb: 1, lineHeight: 1.4 }}>{t(`resources.${resource.key}.desc`)}</Typography>
                                                <Button 
                                                    size="small" 
                                                    endIcon={<Icon icon="tabler-arrow-right" fontSize={14} />}
                                                    sx={{ 
                                                        color: theme.palette.secondary.contrastText, 
                                                        fontWeight: 'bold', 
                                                        fontSize: '0.75rem',
                                                        p: 0,
                                                        minWidth: 'auto',
                                                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                                                    }}
                                                >
                                                    {t('viewGuide')}
                                                </Button>
                                            </Box>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </Stack>

        </Box>
    </Stack>
  );
};
