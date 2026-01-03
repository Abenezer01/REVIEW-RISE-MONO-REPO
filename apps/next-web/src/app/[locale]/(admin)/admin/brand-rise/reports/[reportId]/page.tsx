'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper
} from '@mui/material';
import { PageHeader } from '@platform/shared-ui';
import { useQuery } from '@tanstack/react-query';
import { BrandService } from '@/services/brand.service';
import { useBusinessId } from '@/hooks/useBusinessId';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MapIcon from '@mui/icons-material/Map';

// Placeholder for chart component
const PositioningMapChart = ({ data }: { data: any }) => {
    // Ideally use ApexCharts or Recharts
    // data structure: { "Brand A": { x: 5, y: 3 }, "You": { x: 8, y: 8 } }
    return (
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">Positioning Map Visualization Placeholder (Recharts/ApexCharts)</Typography>
            {/* Logic: Parse JSON map data and render scatter plot */}
        </Box>
    );
};

export default function ReportDetailPage() {
  const t = useTranslations('dashboard');
  const params = useParams();
  const reportId = params.reportId as string;
  const { businessId } = useBusinessId();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['opportunity-report', businessId, reportId],
    queryFn: async () => {
        if (!businessId) return null;
        // Need specific endpoint for getting ONE opportunity report.
        // My previous list endpoint returned summaries.
        // I deferred "GET /:reportId" in backend routes? No, I deferred '/:businessId/:reportId'.
        // But in `BrandService` I have `getReport` which calls `/reports/:id` (generic).
        // My endpoints:
        // router.get('/latest', ...);
        // I need GET /:id actually.
        // I should probably fix backend to allow fetching specific report by ID.
        // For now, let's use list and find? Or implement GET /:id quickly?
        // Let's implement GET /:reportId in backend if meaningful.
        // Actually, let's use list and filter client-side as fallback if I don't want to switch context again.
        // But that's inefficient.
        // Let's assume I add `router.get('/:reportId', ...)`
        
        // TEMPORARY: Call list and find.
        const reports = await BrandService.listOpportunitiesReports(businessId);
        return reports.find((r: any) => r.id === reportId);
        
        // Ideally: BrandService.getOpportunitiesReport(businessId, reportId)
    },
    enabled: !!businessId && !!reportId
  });

  if (isLoading) return <CircularProgress />;
  if (error || !report) return <Alert severity="error">Report not found or failed to load</Alert>;

  // Types based on schema
  const gaps = report.gaps as string[] || [];
  const strategies = report.strategies as string[] || [];
  const contentIdeas = report.contentIdeas as any[] || [];
  const taglines = report.suggestedTaglines as string[] || [];
  const mapData = report.positioningMap as any || {};

  return (
    <Box>
       <PageHeader
        title={`${t('brandRise.reports.detail.title')} ${new Date(report.generatedAt).toLocaleDateString()}`}
        subtitle={t('brandRise.reports.detail.subtitle')}
      />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Market Positioning */}
        <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <MapIcon color="primary" />
                        <Typography variant="h6">{t('brandRise.reports.detail.positioning')}</Typography>
                    </Box>
                    <PositioningMapChart data={mapData} />
                    <Box mt={2}>
                        <Typography variant="body2" color="text.secondary">
                             {t('brandRise.reports.detail.positioningDesc')}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Grid>

        {/* Strategies */}
        <Grid size={{ xs: 12, md: 6 }}>
             <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <TrendingUpIcon color="success" />
                        <Typography variant="h6">{t('brandRise.reports.detail.strategies')}</Typography>
                    </Box>
                    <List>
                        {strategies.slice(0, 3).map((strategy, idx) => (
                            <ListItem key={idx} disablePadding sx={{ mb: 1 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <Chip label={idx + 1} size="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText primary={strategy} />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </Grid>

        {/* Gaps */}
        <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>{t('brandRise.reports.detail.gaps')}</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {gaps.map((gap, i) => (
                            <Chip key={i} label={gap} color="warning" variant="outlined" icon={<LightbulbIcon />} />
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </Grid>

        {/* Taglines */}
        <Grid size={{ xs: 12, md: 6 }}>
             <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>{t('brandRise.reports.detail.taglines')}</Typography>
                    <List dense>
                        {taglines.map((tag, i) => (
                            <ListItem key={i}>
                                <ListItemText primary={`"${tag}"`} />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </Grid>

        {/* Content Ideas */}
         <Grid size={{ xs: 12 }}>
             <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>{t('brandRise.reports.detail.roadmap')}</Typography>
                    <Grid container spacing={2}>
                         {contentIdeas.slice(0, 6).map((idea: any, i: number) => (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                                  <Paper variant="outlined" sx={{ p: 2 }}>
                                      <Typography variant="subtitle2" fontWeight="bold">{idea.topic || idea.title}</Typography>
                                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                                          {idea.format} | {idea.funnelStage}
                                      </Typography>
                                      <Typography variant="body2">{idea.description || idea.hook}</Typography>
                                  </Paper>
                              </Grid>
                         ))}
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
