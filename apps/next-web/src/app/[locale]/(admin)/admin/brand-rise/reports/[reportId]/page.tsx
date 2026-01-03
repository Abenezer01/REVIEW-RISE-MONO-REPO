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
  Paper,
  Button
} from '@mui/material';
import { PageHeader } from '@platform/shared-ui';
import { useQuery } from '@tanstack/react-query';
import { BrandService } from '@/services/brand.service';
import { useBusinessId } from '@/hooks/useBusinessId';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MapIcon from '@mui/icons-material/Map';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { toast } from 'react-hot-toast';

// Chart Component
const PositioningMapChart = ({ data }: { data: any }) => {
    // Transform data for Recharts
    // Expected data: { "Brand A": { x: 5, y: 3 }, "You": { x: 8, y: 8 } }
    // Transform to array: [{ name: "Brand A", x: 5, y: 3, fill: "#..." }]
    
    // Fallback if data is empty or invalid
    const chartData = Object.entries(data?.positions || {}).map(([name, pos]: any) => ({
        name,
        x: pos.x || 50,
        y: pos.y || 50,
        fill: name === 'You' || name === 'Tech Cafe' ? '#7367F0' : '#A8AAAE'
    }));

    // If no data, showing mock for visual verification until real data flows
    const finalData = chartData.length > 0 ? chartData : [
        { name: 'You', x: 85, y: 80, fill: '#7367F0' },
        { name: 'Competitor A', x: 45, y: 60, fill: '#A8AAAE' },
        { name: 'Competitor B', x: 30, y: 40, fill: '#A8AAAE' },
    ];

    return (
        <Box sx={{ p: 2, height: 350, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name={data?.axes?.x || 'Price/Speed'} unit="" domain={[0, 100]} />
                    <YAxis type="number" dataKey="y" name={data?.axes?.y || 'Quality/Scope'} unit="" domain={[0, 100]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Brands" data={finalData} fill="#8884d8">
                        <LabelList dataKey="name" position="top" />
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
             <Typography variant="caption" align="center" display="block" color="text.secondary">
                X: {data?.axes?.x || 'Price/Speed'} | Y: {data?.axes?.y || 'Quality/Scope'}
            </Typography>
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
        // Basic fallback search until GET /:id is fully integrated if list is cached
        const reports = await BrandService.listOpportunitiesReports(businessId);
        return reports.find((r: any) => r.id === reportId);
        // Ideally: BrandService.getOpportunitiesReport(reportId);
    },
    enabled: !!businessId && !!reportId
  });

  const handleExportPdf = async () => {
      try {
           const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/api/v1/brands/reports/opportunities/${reportId}/pdf`);
           if (!response.ok) throw new Error('Download failed');
           
           const blob = await response.blob();
           const url = window.URL.createObjectURL(blob);
           const a = document.createElement('a');
           a.href = url;
           a.download = `report-${reportId}.pdf`;
           document.body.appendChild(a);
           a.click();
           window.URL.revokeObjectURL(url);
           toast.success('PDF downloaded successfully');
      } catch (e) {
          console.error(e);
          toast.error('Failed to download PDF');
      }
  };

  const handleShare = () => {
      // Copy current URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Report link copied to clipboard');
  };

  if (isLoading) return <CircularProgress />;
  if (error || !report) return <Alert severity="error">Report not found or failed to load</Alert>;

  // Types based on schema
  const gaps = report.gaps as string[] || [];
  const strategies = report.strategies as string[] || [];
  const contentIdeas = report.contentIdeas as any[] || [];
  const taglines = report.suggestedTaglines as string[] || [];
  const mapData = report.positioningMap as any || {};

  return (
    <Box sx={{ pb: 4 }}>
       <Box mb={4}>
           <Button 
                onClick={() => window.history.back()} 
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2, color: 'text.secondary' }}
           >
                {t('brandRise.reports.title')}
           </Button>
           <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {t('brandRise.reports.detail.title')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {new Date(report.generatedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button 
                        variant="outlined" 
                        startIcon={<ShareIcon />} 
                        onClick={handleShare}
                        sx={{ borderColor: '#E0E0E0', color: 'text.primary' }}
                    >
                        {t('brandRise.reports.share')}
                    </Button>
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: '#7367F0', boxShadow: '0 4px 14px 0 rgba(115, 103, 240, 0.39)', '&:hover': { bgcolor: '#665BE0', boxShadow: '0 6px 20px 0 rgba(115, 103, 240, 0.23)' } }}
                        startIcon={<DownloadIcon />} 
                        onClick={handleExportPdf}
                    >
                        {t('brandRise.reports.exportPdf')}
                    </Button>
                </Box>
           </Box>
       </Box>

      <Grid container spacing={4}>
        {/* Market Positioning - FULL WIDTH */}
        <Grid xs={12}>
            <Card sx={{ border: 'none', boxShadow: '0 4px 18px -4px rgba(76, 78, 100, 0.1)', borderRadius: 3, overflow: 'visible' }}>
                <CardContent sx={{ p: 4 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Box p={1} bgcolor="#E8EAF6" borderRadius={2} color="#7367F0">
                             <MapIcon />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">{t('brandRise.reports.detail.positioning')}</Typography>
                            <Typography variant="body2" color="text.secondary">{t('brandRise.reports.detail.positioningDesc')}</Typography>
                        </Box>
                    </Box>
                    
                    <Grid container spacing={4}>
                        <Grid xs={12} md={8}>
                             <PositioningMapChart data={mapData} />
                        </Grid>
                        <Grid xs={12} md={4} display="flex" alignItems="center">
                            <Box p={3} bgcolor="#F8F7FA" borderRadius={2} border="1px dashed #DBDADE" width="100%">
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                                    Strategic Insight
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                     {mapData.description || "The analysis places your brand in a unique position relative to competitors. Use this data to refine your pricing and quality messaging."}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Grid>

        {/* Strategies & Gaps Row */}
        <Grid xs={12} md={7}>
             <Card sx={{ height: '100%', border: 'none', boxShadow: '0 4px 18px -4px rgba(76, 78, 100, 0.1)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Box p={1} bgcolor="#E0F2F1" borderRadius={2} color="#009688">
                            <TrendingUpIcon />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">{t('brandRise.reports.detail.strategies')}</Typography>
                    </Box>
                    <List disablePadding>
                        {strategies.slice(0, 3).map((strategy, idx) => (
                            <ListItem key={idx} sx={{ px: 0, py: 2, borderBottom: idx < 2 ? '1px solid #F5F5F9' : 'none' }}>
                                <ListItemIcon sx={{ minWidth: 48 }}>
                                    <Box 
                                        sx={{ 
                                            width: 32, 
                                            height: 32, 
                                            borderRadius: '50%', 
                                            bgcolor: '#7367F0', 
                                            color: '#fff', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {idx + 1}
                                    </Box>
                                </ListItemIcon>
                                <ListItemText 
                                    primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                                    secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary', mt: 0.5 }}
                                    primary={strategy} // Assuming strategy is a string, if object adjust accordingly
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </Grid>

        <Grid xs={12} md={5}>
            <Card sx={{ height: '100%', border: 'none', boxShadow: '0 4px 18px -4px rgba(76, 78, 100, 0.1)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                     <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Box p={1} bgcolor="#FFF3E0" borderRadius={2} color="#FF9800">
                             <LightbulbIcon />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">{t('brandRise.reports.detail.gaps')}</Typography>
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={1.5}>
                        {gaps.map((gap, i) => (
                            <Chip 
                                key={i} 
                                label={gap} 
                                sx={{ 
                                    bgcolor: '#FFF8E1', 
                                    color: '#FF6F00', 
                                    fontWeight: 500,
                                    borderRadius: '8px',
                                    '& .MuiChip-icon': { color: '#FF6F00' }
                                }} 
                                icon={<LightbulbIcon fontSize="small" />} 
                            />
                        ))}
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Typography variant="h6" fontWeight="bold">{t('brandRise.reports.detail.taglines')}</Typography>
                    </Box>
                    <List dense disablePadding>
                        {taglines.slice(0, 3).map((tag, i) => (
                            <ListItem key={i} sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 30, color: '#FF9800' }}>•</ListItemIcon>
                                <ListItemText 
                                    primary={tag}
                                    primaryTypographyProps={{ fontStyle: 'italic', color: 'text.secondary' }} 
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </Grid>

        {/* Content Ideas */}
         <Grid xs={12}>
             <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, mt: 2 }}>{t('brandRise.reports.detail.roadmap')}</Typography>
             <Grid container spacing={3}>
                  {contentIdeas.slice(0, 6).map((idea: any, i: number) => (
                       <Grid xs={12} sm={6} md={4} key={i}>
                           <Card sx={{ height: '100%', border: '1px solid #F0F0F0', boxShadow: 'none', borderRadius: 2, transition: '0.3s', '&:hover': { boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)', transform: 'translateY(-2px)' } }}>
                               <CardContent>
                                   <Chip label={idea.format || 'Blog Post'} size="small" sx={{ mb: 2, bgcolor: '#E3F2FD', color: '#1976D2', fontWeight: 600, borderRadius: 1 }} />
                                   <Typography variant="h6" fontWeight="600" gutterBottom sx={{ lineHeight: 1.3 }}>
                                       {idea.topic || idea.title}
                                   </Typography>
                                   <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                       {idea.description || idea.hook}
                                   </Typography>
                                   <Divider sx={{ my: 1 }} />
                                   <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                        <Typography variant="caption" fontWeight="bold" color="text.disabled">
                                            {idea.funnelStage || 'AWARENESS'}
                                        </Typography>
                                        <Button size="small" color="primary">Create Draft</Button>
                                   </Box>
                               </CardContent>
                           </Card>
                       </Grid>
                  ))}
             </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
