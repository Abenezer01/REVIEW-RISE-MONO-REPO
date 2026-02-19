'use client';


import { useParams, usePathname, useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import AnalyticsIcon from '@mui/icons-material/Analytics';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DescriptionIcon from '@mui/icons-material/Description';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import StarIcon from '@mui/icons-material/Star';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { useTranslations } from 'next-intl';
import {
    Alert,
    alpha,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from '@mui/material';

import { useBusinessId } from '@/hooks/useBusinessId';
import { BrandService } from '@/services/brand.service';

const ensureArray = (data: any): string[] => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') return [data];
    
return [];
};

export default function CompetitorDetailPage() {
  const t = useTranslations('dashboard');
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const competitorId = params.competitorId as string;
  const { businessId } = useBusinessId();

  // Get base path for back navigation (remove competitorId from pathname)
  const basePath = pathname.replace(`/${competitorId}`, '');

  const { data: competitor, isLoading, error } = useQuery({
    queryKey: ['competitor', businessId, competitorId],
    queryFn: async () => {
        if (!businessId || !competitorId) return null;
        
return BrandService.getCompetitor(businessId, competitorId);
    },
    enabled: !!businessId && !!competitorId
  });

  if (isLoading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error || !competitor) return <Box p={4}><Alert severity="error">{t('brandRise.competitors.notFound')}</Alert></Box>;

  const snapshot = competitor.snapshots?.[0] || {};

  // Extract data from snapshot
  const strengths = ensureArray(snapshot.differentiators?.strengths);
  const weaknesses = ensureArray(snapshot.differentiators?.weaknesses);
  const whatToLearn = ensureArray(snapshot.whatToLearn);
  const whatToAvoid = ensureArray(snapshot.whatToAvoid);
  const uniqueDifferentiators = ensureArray(snapshot.differentiators?.unique);
  const services = ensureArray(snapshot.serviceList);
  const pricingCues = ensureArray(snapshot.pricingCues);

  // Trust Metrics from AI analysis or parsed from trustSignals
  const trustMetrics = snapshot.metrics?.trustMetrics || {};
  const rating = trustMetrics.rating || snapshot.trustSignals?.avgRating || null;
  const clientCount = trustMetrics.clientCount || snapshot.trustSignals?.reviewCount || null;
  const awardCount = trustMetrics.awardCount || null;

  const techStack = [
      { name: 'WordPress', icon: <CodeIcon fontSize="small" /> },
      { name: 'Google Analytics', icon: <AnalyticsIcon fontSize="small" /> }
  ];

  const comparisonData = [
      { feature: 'Free Audit Offer', competitor: true, growthHub: false },
      { feature: 'Transparent Pricing', competitor: true, growthHub: true },
      { feature: 'Client Portal', competitor: true, growthHub: false },
      { feature: 'Performance Guarantee', competitor: true, growthHub: false },
  ];

  const cardStyle = {
      borderRadius: 3,
      bgcolor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
      overflow: 'hidden'
  };

  // Style for text that may overflow
  const textOverflowStyle = {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical' as const
  };

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Back Button */}
        <Button 
            onClick={() => router.push(basePath)} 
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 3, color: theme.palette.text.secondary, textTransform: 'none' }}
        >
            {t('brandRise.competitors.backToList')}
        </Button>

        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'start', md: 'center' }} mb={4} spacing={2}>
          <Box>
              <Typography variant="h4" fontWeight="bold" color="text.primary">{t('brandRise.competitors.detail.analysisTitle')}</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>{t('brandRise.competitors.detail.insightsFrom', { name: competitor.name })}</Typography>
          </Box>
          <Stack direction="row" spacing={2}>
              <Button variant="outlined" startIcon={<CompareArrowsIcon />} sx={{ borderColor: theme.palette.divider, color: theme.palette.text.secondary, textTransform: 'none' }}>{t('brandRise.competitors.detail.compare')}</Button>
              <Button variant="contained" sx={{ bgcolor: theme.palette.warning.main, color: 'white', textTransform: 'none', '&:hover': { bgcolor: theme.palette.warning.dark } }} startIcon={<DescriptionIcon />}>{t('brandRise.reports.generate')}</Button>
          </Stack>
        </Stack>

        {/* Main Content Row */}
        <Grid container spacing={3} sx={{ mb: 4 }} alignItems="flex-start">
          {/* LEFT: Main Info */}
          <Grid size={{ xs: 12, lg: 8 }}>
              <Card sx={cardStyle}>
                  <CardContent sx={{ p: 4 }}>
                      {/* Company Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="start" mb={4}>
                          <Box>
                              <Typography variant="h5" fontWeight="bold" color="text.primary">{competitor.name}</Typography>
                              <Typography 
                                  component="a" 
                                  href={competitor.domain?.startsWith('http') ? competitor.domain : `https://${competitor.domain}`} 
                                  target="_blank"
                                  variant="body2" 
                                  sx={{ color: theme.palette.info.main, textDecoration: 'none' }}
                              >
                                  {competitor.domain}
                              </Typography>
                          </Box>
                          {competitor.type === 'DIRECT_LOCAL' && (
                               <Chip label={t('brandRise.competitors.stats.directLocal')} size="small" sx={{ borderRadius: 1, fontWeight: 'bold', bgcolor: theme.palette.success.main, color: 'white', fontSize: '0.7rem' }} />
                          )}
                      </Stack>

                      {/* UVP */}
                      <Box mb={4}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1, display: 'block', mb: 1.5 }}>{t('brandRise.competitors.uvp')}</Typography>
                          <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7, ...textOverflowStyle, WebkitLineClamp: 4 }}>
                              {snapshot.uvp || t('brandRise.competitors.noAnalysis')}
                          </Typography>
                      </Box>

                      {/* Services */}
                      <Box mb={4}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1, display: 'block', mb: 2 }}>{t('brandRise.competitors.services')}</Typography>
                          <Stack spacing={1.5}>
                              {services.length > 0 ? services.slice(0, 4).map((service, i) => (
                                  <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                                      <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                                      <Typography variant="body2" color="text.primary">{service}</Typography>
                                  </Stack>
                              )) : (
                                  <Typography variant="body2" color="text.secondary">{t('brandRise.competitors.detail.noServices')}</Typography>
                              )}
                          </Stack>
                      </Box>

                      {/* Pricing */}
                      <Box mb={4}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1, display: 'block', mb: 2 }}>{t('brandRise.competitors.detail.pricingTitle')}</Typography>
                          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                              {pricingCues.length > 0 ? pricingCues.map((price, i) => (
                                  <Chip 
                                      key={i} 
                                      label={price} 
                                      size="small"
                                      sx={{ 
                                          bgcolor: 'transparent', 
                                          border: `1px solid ${theme.palette.warning.main}`,
                                          color: theme.palette.warning.main,
                                          fontWeight: 600,
                                          borderRadius: 1,
                                          fontSize: '0.75rem'
                                      }} 
                                  />
                              )) : (
                                  <Typography variant="body2" color="text.secondary">{t('brandRise.competitors.detail.noPricing')}</Typography>
                              )}
                          </Stack>
                      </Box>

                      {/* Trust Signals */}
                      <Box mb={4}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1, display: 'block', mb: 2 }}>{t('brandRise.competitors.detail.trustSignals')}</Typography>
                          <Stack direction="row" spacing={6} mt={1}>
                              <Box textAlign="center">
                                  <StarIcon sx={{ fontSize: 28, mb: 0.5, color: theme.palette.warning.main }} />
                                  <Typography variant="h6" fontWeight="bold" color="text.primary">{rating ? `${rating}/5` : 'N/A'}</Typography>
                                  <Typography variant="caption" color="text.secondary">{t('brandRise.competitors.detail.ratingLabel')}</Typography>
                              </Box>
                              <Box textAlign="center">
                                  <GroupsIcon sx={{ fontSize: 28, mb: 0.5, color: theme.palette.info.main }} />
                                  <Typography variant="h6" fontWeight="bold" color="text.primary">{clientCount || 'N/A'}</Typography>
                                  <Typography variant="caption" color="text.secondary">{t('brandRise.competitors.detail.clientsLabel')}</Typography>
                              </Box>
                              <Box textAlign="center">
                                  <EmojiEventsIcon sx={{ fontSize: 28, mb: 0.5, color: theme.palette.success.main }} />
                                  <Typography variant="h6" fontWeight="bold" color="text.primary">{awardCount || 'N/A'}</Typography>
                                  <Typography variant="caption" color="text.secondary">{t('brandRise.competitors.detail.awardsLabel')}</Typography>
                              </Box>
                          </Stack>
                      </Box>

                      {/* CTA */}
                      <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1, display: 'block', mb: 2 }}>{t('brandRise.competitors.detail.ctaTitle')}</Typography>
                          <Button 
                              fullWidth 
                              variant="contained" 
                              size="large"
                              sx={{ 
                                  background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                                  '&:hover': { background: `linear-gradient(90deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)` },
                                  textTransform: 'none',
                                  fontWeight: 'bold',
                                  py: 1.5,
                                  borderRadius: 2
                              }}
                          >
                              {t('brandRise.competitors.detail.ctaAudit')}
                          </Button>
                      </Box>
                  </CardContent>
              </Card>
          </Grid>

          {/* RIGHT: Insights */}
          <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={3}>
                  {/* What to Learn */}
                  <Card sx={{ ...cardStyle, background: `linear-gradient(180deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${theme.palette.background.paper} 100%)` }}>
                      <CardContent sx={{ p: 3 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                              <LightbulbIcon sx={{ color: theme.palette.secondary.main }} />
                              <Typography variant="h6" fontWeight="bold" color="text.primary">{t('brandRise.competitors.detail.toLearn')}</Typography>
                          </Stack>
                          <Stack spacing={2.5}>
                              {whatToLearn.length > 0 ? whatToLearn.slice(0, 3).map((item, i) => (
                                  <Box key={i}>
                                      <Typography variant="caption" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold', letterSpacing: 1 }}>{t('brandRise.competitors.detail.insightNumber', { number: i + 1 })}</Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6, ...textOverflowStyle, WebkitLineClamp: 3 }}>{item}</Typography>
                                  </Box>
                              )) : (
                                  <Typography variant="body2" color="text.secondary">{t('brandRise.competitors.detail.noInsights')}</Typography>
                              )}
                          </Stack>
                      </CardContent>
                  </Card>

                  {/* What to Avoid */}
                  <Card sx={{ ...cardStyle, background: `linear-gradient(180deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${theme.palette.background.paper} 100%)` }}>
                      <CardContent sx={{ p: 3 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                              <ReportProblemIcon sx={{ color: theme.palette.error.main }} />
                              <Typography variant="h6" fontWeight="bold" color="text.primary">{t('brandRise.competitors.detail.toAvoid')}</Typography>
                          </Stack>
                          <Stack spacing={2.5}>
                              {whatToAvoid.length > 0 ? whatToAvoid.slice(0, 3).map((item, i) => (
                                  <Box key={i}>
                                      <Typography variant="caption" sx={{ color: theme.palette.error.main, fontWeight: 'bold', letterSpacing: 1 }}>{t('brandRise.competitors.detail.cautionNumber', { number: i + 1 })}</Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6, ...textOverflowStyle, WebkitLineClamp: 3 }}>{item}</Typography>
                                  </Box>
                              )) : (
                                  <Typography variant="body2" color="text.secondary">{t('brandRise.competitors.detail.noWarnings')}</Typography>
                              )}
                          </Stack>
                      </CardContent>
                  </Card>

                  {/* Tech Stack */}
                  <Card sx={cardStyle}>
                      <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" fontWeight="bold" mb={2} color="text.primary">{t('brandRise.competitors.detail.techStack')}</Typography>
                          <Stack direction="row" flexWrap="wrap" gap={1.5}>
                              {techStack.map((tech, i) => (
                                  <Chip 
                                      key={i} 
                                      icon={tech.icon} 
                                      label={tech.name} 
                                      variant="outlined" 
                                      size="small"
                                      sx={{ 
                                          borderColor: theme.palette.divider,
                                          color: theme.palette.text.primary,
                                          '& .MuiChip-icon': { color: theme.palette.text.secondary }
                                      }} 
                                  />
                              ))}
                          </Stack>
                      </CardContent>
                  </Card>
              </Stack>
          </Grid>
        </Grid>

        {/* Strengths & Weaknesses Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Strengths */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ ...cardStyle, background: `linear-gradient(180deg, ${alpha(theme.palette.success.main, 0.06)} 0%, ${theme.palette.background.paper} 100%)` }}>
                    <CardContent sx={{ p: 4 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                            <ThumbUpIcon sx={{ color: theme.palette.success.main }} />
                            <Typography variant="h6" fontWeight="bold" color="text.primary">{t('brandRise.competitors.detail.strengths')}</Typography>
                        </Stack>
                        <Stack spacing={2}>
                            {strengths.length > 0 ? strengths.map((item, i) => (
                                <Stack key={i} direction="row" spacing={1.5} alignItems="start">
                                    <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 20, mt: 0.3 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, ...textOverflowStyle, WebkitLineClamp: 2 }}>{item}</Typography>
                                </Stack>
                            )) : (
                                <Typography variant="body2" color="text.secondary">{t('brandRise.competitors.detail.noStrengths')}</Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>

            {/* Weaknesses */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ ...cardStyle, background: `linear-gradient(180deg, ${alpha(theme.palette.error.main, 0.06)} 0%, ${theme.palette.background.paper} 100%)` }}>
                    <CardContent sx={{ p: 4 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                            <ThumbDownIcon sx={{ color: theme.palette.error.main }} />
                            <Typography variant="h6" fontWeight="bold" color="text.primary">{t('brandRise.competitors.detail.weaknesses')}</Typography>
                        </Stack>
                        <Stack spacing={2}>
                            {weaknesses.length > 0 ? weaknesses.map((item, i) => (
                                <Stack key={i} direction="row" spacing={1.5} alignItems="start">
                                    <CancelIcon sx={{ color: theme.palette.error.main, fontSize: 20, mt: 0.3 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, ...textOverflowStyle, WebkitLineClamp: 2 }}>{item}</Typography>
                                </Stack>
                            )) : (
                                <Typography variant="body2" color="text.secondary">{t('brandRise.competitors.detail.noWeaknesses')}</Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>

        {/* Differentiators Row */}
        <Box sx={{ mb: 4 }}>
            <Card sx={{ ...cardStyle, background: `linear-gradient(180deg, ${alpha(theme.palette.warning.main, 0.06)} 0%, ${theme.palette.background.paper} 100%)` }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="bold" mb={3} color="text.primary">{t('brandRise.competitors.detail.diffTitle')}</Typography>
                    <Stack spacing={3}>
                        {uniqueDifferentiators.length > 0 ? uniqueDifferentiators.slice(0, 3).map((diff, i) => (
                            <Stack key={i} direction="row" spacing={2.5} alignItems="start">
                                <Box sx={{ 
                                    minWidth: 36, 
                                    height: 36, 
                                    borderRadius: 1.5, 
                                    bgcolor: theme.palette.warning.main, 
                                    color: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                }}>
                                    {i + 1}
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>{t('brandRise.competitors.detail.diffNumber', { number: i + 1 })}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, ...textOverflowStyle, WebkitLineClamp: 3 }}>{diff}</Typography>
                                </Box>
                            </Stack>
                        )) : (
                            <Typography variant="body2" color="text.secondary">{t('brandRise.competitors.detail.noDifferentiators')}</Typography>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </Box>

        {/* Feature Comparison Matrix Row */}
        <Box>
             <Card sx={cardStyle}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="bold" mb={3} color="text.primary">{t('brandRise.competitors.detail.matrixTitle')}</Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none', color: theme.palette.text.secondary, fontSize: '0.7rem', letterSpacing: 1, pb: 2 }}>{t('brandRise.competitors.detail.feature')}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: 'none', color: theme.palette.text.primary, pb: 2 }}>{competitor.name?.split(' ')[0] || t('brandRise.competitors.detail.competitor')}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: 'none', color: theme.palette.text.primary, pb: 2 }}>{t('brandRise.competitors.detail.growthHub')}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: 'none', color: theme.palette.text.primary, pb: 2 }}>{t('brandRise.competitors.detail.yourBrand')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {comparisonData.map((row, i) => (
                                    <TableRow key={i} sx={{ '& td': { borderBottom: `1px solid ${theme.palette.divider}`, py: 2.5 } }}>
                                        <TableCell sx={{ color: theme.palette.text.primary }}>{row.feature}</TableCell>
                                        <TableCell align="center">
                                            {row.competitor ? <CheckCircleIcon sx={{ color: theme.palette.success.main }} /> : <CancelIcon sx={{ color: theme.palette.error.main }} />}
                                        </TableCell>
                                        <TableCell align="center">
                                            {row.growthHub ? <CheckCircleIcon sx={{ color: theme.palette.success.main }} /> : <CancelIcon sx={{ color: theme.palette.error.main }} />}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color="text.secondary">—</Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
             </Card>
        </Box>
      </Container>
    </Box>
  );
}
