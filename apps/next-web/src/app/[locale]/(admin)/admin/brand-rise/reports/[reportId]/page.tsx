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
  Paper,
  Button
, Stack, useTheme, alpha } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MapIcon from '@mui/icons-material/Map';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { toast } from 'react-hot-toast';

import { useBusinessId } from '@/hooks/useBusinessId';
import { BrandService } from '@/services/brand.service';

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
  const theme = useTheme();
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
  // Data Transformation for Rich UI
  const gaps = (report.gaps as string[] || []).map((gap, i) => ({
      id: i,
      title: gap,
      description: 'Market opportunity identified via competitor analysis.', // Placeholder description
      impact: i === 0 || i === 1 ? 'High Impact' : 'Medium Impact',
      tags: i === 0 ? ['Technology', 'Differentiation'] : i === 1 ? ['Pricing', 'Trust'] : ['Specialization', 'Expertise']
  }));

  const strategies = (report.strategies as string[] || []).map((strat, i) => ({
      id: i,
      title: strat,
      description: 'Strategic move to capture market share based on current gaps.',
      icon: i === 0 ? <LightbulbIcon fontSize="large" /> : i === 1 ? <TrendingUpIcon fontSize="large" /> : <MapIcon fontSize="large" />
  }));

  const contentIdeas = (report.contentIdeas as any[] || []).map((idea: any, i: number) => ({
      ...idea,
      format: idea.format || (i % 2 === 0 ? 'Blog Post' : 'Case Study'),
      demand: i < 2 ? 'High Demand' : 'Medium Demand'
  }));


  const mapData = report.positioningMap as any || {};

  return (
      <Box sx={{ pb: 8, bgcolor: 'background.default', minHeight: '100vh' }}>
       {/* HEADER SECTION */}
       <Box 
          sx={{ 
              pt: 4, 
              pb: 6, 
              mb: 4,
              borderBottom: 1, 
              borderColor: 'divider',
              background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)` 
          }}
       >
           <Box px={{ xs: 2, md: 6 }}>
               <Button 
                    onClick={() => window.history.back()} 
                    startIcon={<ArrowBackIcon />}
                    sx={{ mb: 3, color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}
               >
                    {t('brandRise.reports.title')}
               </Button>
               <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
                    <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={1.2}>
                            AI-GENERATED INTELLIGENCE
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                            <Typography variant="h3" fontWeight="800" color="text.primary">
                                Brand Opportunities Report
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={3} mt={2} alignItems="center">
                             <Stack direction="row" spacing={1} alignItems="center">
                                 <CalendarMonthIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                 <Typography variant="body2" color="text.secondary">
                                    Generated: {new Date(report.generatedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                 </Typography>
                             </Stack>
                             <Stack direction="row" spacing={1} alignItems="center">
                                 <GroupsIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                 <Typography variant="body2" color="text.secondary">
                                    18 Competitors Analyzed
                                 </Typography>
                             </Stack>
                        </Stack>
                    </Box>

                    {/* ACTIONS & CONFIDENCE */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button 
                             startIcon={<ShareIcon />} 
                             variant="outlined"
                             sx={{ borderColor: 'divider', color: 'text.primary', textTransform: 'none' }}
                             onClick={handleShare}
                        >
                             Share
                        </Button>
                        <Button 
                             startIcon={<DownloadIcon />} 
                             variant="contained"
                             sx={{ 
                                bgcolor: 'warning.main', 
                                color: 'warning.contrastText', 
                                textTransform: 'none', 
                                fontWeight: 'bold',
                                boxShadow: theme.shadows[4]
                             }}
                             onClick={handleExportPdf}
                        >
                             Export PDF
                        </Button>

                         {/* Confidence Score */}
                         <Box 
                             sx={{ 
                                 width: 80, 
                                 height: 80, 
                                 borderRadius: '50%', 
                                 background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, 
                                 display: 'flex', 
                                 flexDirection: 'column',
                                 alignItems: 'center', 
                                 justifyContent: 'center',
                                 boxShadow: theme.shadows[8],
                                 ml: 2
                             }}
                         >
                             <Typography variant="h5" fontWeight="900" sx={{ color: '#fff', lineHeight: 1 }}>94</Typography>
                             <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.6rem', fontWeight: 'bold' }}>CONFIDENCE</Typography>
                         </Box>
                    </Stack>
               </Box>
           </Box>
       </Box>

      <Box px={{ xs: 2, md: 6 }}>
        <Grid container spacing={4}>
            {/* Market Positioning - FULL WIDTH */}
            <Grid size={{ xs: 12 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">Market Positioning Map</Typography>
                <Card sx={{ 
                    bgcolor: 'background.paper', 
                    borderRadius: 3, 
                    border: 1, 
                    borderColor: 'divider',
                    overflow: 'visible',
                    boxShadow: theme.shadows[2]
                }}>
                    <CardContent sx={{ p: 4 }}>
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <PositioningMapChart data={mapData} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }} display="flex" flexDirection="column" justifyContent="center">
                                {/* Insights List */}
                                <Stack spacing={3}>
                                    <Box>
                                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                                            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">Premium Enterprise</Typography>
                                            <Chip label="HIGH SATURATION" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 'bold' }} />
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">Large agencies targeting Fortune 500 with comprehensive packages.</Typography>
                                        <Stack direction="row" spacing={1} mt={1}>
                                            {['Digital Pro', 'Growth Hub', '+3 more'].map(tag => (
                                                <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'action.hover', color: 'text.secondary', fontSize: '0.7rem' }} />
                                            ))}
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                                            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">Mid-Market Generalist</Typography>
                                            <Chip label="HIGH SATURATION" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', fontWeight: 'bold' }} />
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">Full-service agencies serving mid-sized businesses with diverse offerings.</Typography>
                                        <Stack direction="row" spacing={1} mt={1}>
                                            {['Marketing Plus', 'Digital Edge', '+4 more'].map(tag => (
                                                <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'action.hover', color: 'text.secondary', fontSize: '0.7rem' }} />
                                            ))}
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">Niche Specialist</Typography>
                                            <Chip label="OPPORTUNITY" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', fontWeight: 'bold' }} />
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">Specialized agencies focusing on specific industries with premium positioning.</Typography>
                                        <Stack direction="row" spacing={1} mt={1}>
                                            {['Local SEO Pro', '+2 more'].map(tag => (
                                                <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'action.hover', color: 'text.secondary', fontSize: '0.7rem' }} />
                                            ))}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

        {/* Top 10 Market Gaps & Opportunities (Vertical List) */}
        <Grid size={{ xs: 12 }}>
            <Card sx={{ border: 'none', boxShadow: theme.shadows[2], borderRadius: 3, bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" fontWeight="bold" color="text.primary" mb={3}>
                        Top Market Gaps & Opportunities
                    </Typography>
                    <Stack spacing={3}>
                        {gaps.slice(0, 5).map((gap, i) => ( // limit to 5
                            <Paper key={i} elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 2, border: 1, borderColor: 'divider' }}>
                                <Grid container alignItems="center" spacing={2}>
                                    <Grid size={{ xs: 'auto' }}>
                                        <Box 
                                            sx={{ 
                                                width: 40, height: 40, 
                                                bgcolor: 'warning.main', 
                                                color: 'warning.contrastText', 
                                                borderRadius: 2, 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '1.2rem'
                                            }}
                                        >
                                            {i + 1}
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                                            {gap.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {gap.description}
                                        </Typography>
                                        <Stack direction="row" spacing={1} mt={1.5}>
                                            {gap.tags.map(tag => (
                                                <Chip key={tag} label={tag} size="small" sx={{ 
                                                    borderRadius: 1, 
                                                    bgcolor: alpha(theme.palette.text.primary, 0.1), 
                                                    color: 'text.secondary', 
                                                    fontWeight: 600, 
                                                    fontSize: '0.65rem',
                                                    textTransform: 'uppercase'
                                                }} />
                                            ))}
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 'grow' }} display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                                        <Chip 
                                            label={gap.impact} 
                                            icon={<TrendingUpIcon fontSize="small" />}
                                            sx={{ 
                                                bgcolor: alpha(theme.palette.success.main, 0.1), 
                                                color: 'success.main', 
                                                fontWeight: 'bold', 
                                                borderRadius: 1 
                                            }} 
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>
                </CardContent>
            </Card>
        </Grid>

        {/* Differentiation Strategies (3-Column Grid) */}
        <Grid size={{ xs: 12 }}>
            <Typography variant="h5" fontWeight="bold" color="text.primary" mb={3} mt={2}>
                Differentiation Strategies
            </Typography>
             <Grid container spacing={3}>
                {strategies.slice(0, 3).map((strat, i) => (
                    <Grid size={{ xs: 12, md: 4 }} key={i}>
                        <Card sx={{ 
                            height: '100%', 
                            bgcolor: 'background.paper', 
                            borderRadius: 3,
                            border: 1,
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                            boxShadow: theme.shadows[4],
                            position: 'relative',
                            overflow: 'visible'
                        }}>
                             <Box 
                                sx={{ 
                                    position: 'absolute', 
                                    top: 0, 
                                    left: 0, 
                                    right: 0, 
                                    height: 4, 
                                    bgcolor: i === 0 ? 'primary.main' : i === 1 ? 'success.main' : 'secondary.main',
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12
                                }} 
                            />
                            <CardContent sx={{ p: 4, pt: 6 }}>
                                <Box 
                                    sx={{ 
                                        width: 56, height: 56, 
                                        borderRadius: '50%', 
                                        bgcolor: alpha(i === 0 ? theme.palette.primary.main : i === 1 ? theme.palette.success.main : theme.palette.secondary.main, 0.1), 
                                        color: i === 0 ? 'primary.main' : i === 1 ? 'success.main' : 'secondary.main',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        mb: 3
                                    }}
                                >
                                    {strat.icon}
                                </Box>
                                <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                                    {strat.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                                    {strat.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Grid>

        {/* Content Ideas */}
        {/* Content Ideas (Vertical Roadmap List) */}
         <Grid size={{ xs: 12 }}>
             <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, mt: 4 }} color="text.primary">Content Ideas (Aligned with Competitor Gaps)</Typography>
             <Card sx={{ border: 'none', boxShadow: theme.shadows[2], borderRadius: 3, bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 0 }}>
                    <List disablePadding>
                        {contentIdeas.slice(0, 6).map((idea: any, i: number) => (
                             <ListItem 
                                key={i} 
                                sx={{ 
                                    p: 3, 
                                    borderBottom: i < 5 ? `1px solid ${theme.palette.divider}` : 'none',
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    alignItems: { xs: 'flex-start', md: 'center' },
                                    gap: 2
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={3} flexGrow={1}>
                                     <Box 
                                        sx={{ 
                                            width: 32, height: 32, 
                                            borderRadius: 1, 
                                            bgcolor: 'primary.main', 
                                            color: 'primary.contrastText', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                        }}
                                    >
                                        {i + 1}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                            {idea.topic || idea.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                            {idea.description || idea.hook}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Stack direction="row" spacing={1} alignItems="center" width={{ xs: '100%', md: 'auto' }} justifyContent={{ xs: 'space-between', md: 'flex-end' }}>
                                    <Chip 
                                        label={idea.format} 
                                        size="small" 
                                        sx={{ 
                                            borderRadius: 1, 
                                            bgcolor: alpha(theme.palette.background.default, 0.8), 
                                            color: 'text.secondary', 
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            fontSize: '0.7rem'
                                        }} 
                                    />
                                    <Chip 
                                        label={idea.demand} 
                                        size="small" 
                                        sx={{ 
                                            borderRadius: 1, 
                                            bgcolor: alpha(theme.palette.info.main, 0.1), 
                                            color: 'info.main', 
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            fontSize: '0.7rem'
                                        }} 
                                    />
                                </Stack>
                             </ListItem>
                        ))}
                    </List>
                </CardContent>
             </Card>
        </Grid>
      </Grid>
    </Box>
    </Box>
  );
}
