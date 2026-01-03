'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { BrandService } from '@/services/brand.service';
import { useBusinessId } from '@/hooks/useBusinessId';
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Stack, 
  Chip, 
  Paper, 
  useTheme, 
  alpha, 
  Tabs, 
  Tab 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import VerifiedIcon from '@mui/icons-material/Verified';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Helper: Ensure Array
const ensureArray = (data: any): string[] => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') return [data];
    return [];
};

// Helper Components
const SectionPaper = ({ title, children, color, icon }: { title: string, children: React.ReactNode, color?: string, icon?: React.ReactNode }) => (
    <Paper sx={{ p: 3, borderRadius: 2, height: '100%', ...(color && { borderTop: `4px solid ${color}` }) }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
            {icon && <Box sx={{ display: 'flex' }}>{icon}</Box>}
            <Typography variant="h6" fontWeight="bold" sx={{ color: color || 'text.primary' }}>{title}</Typography>
        </Stack>
        {children}
    </Paper>
);

const ListItems = ({ items, icon }: { items?: string[], icon: React.ReactNode }) => {
    if (!items || items.length === 0) return <Typography variant="body2" color="text.secondary">None identified.</Typography>;
    return (
        <Stack spacing={1.5}>
            {items.map((item, i) => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="start">
                    <Box sx={{ mt: 0.3 }}>{icon}</Box>
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                </Stack>
            ))}
        </Stack>
    );
};

const LinkTypography = ({ domain }: { domain?: string | null }) => {
    if (!domain) return null;
    return (
        <Typography 
            component="a" 
            href={domain.startsWith('http') ? domain : `https://${domain}`} 
            target="_blank" 
            rel="noopener noreferrer"
            variant="body2" 
            color="primary" 
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
            {domain}
        </Typography>
    );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`competitor-tabpanel-${index}`}
      aria-labelledby={`competitor-tab-${index}`}
      {...other}
      style={{ minHeight: 300 }}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default function CompetitorDetailPage() {
  const t = useTranslations('dashboard');
  const theme = useTheme();
  const params = useParams();
  const competitorId = params.competitorId as string;
  const { businessId } = useBusinessId();
  const [tabValue, setTabValue] = useState(0);

  const { data: competitor, isLoading, error } = useQuery({
    queryKey: ['competitor', businessId, competitorId],
    queryFn: async () => {
        if (!businessId || !competitorId) return null;
        return BrandService.getCompetitor(businessId, competitorId);
    },
    enabled: !!businessId && !!competitorId
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error || !competitor) return <Box p={4}><Alert severity="error">Competitor not found or failed to load.</Alert></Box>;

  const snapshot = competitor.snapshots?.[0] || {};

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
           <Button 
                onClick={() => window.history.back()} 
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2, color: 'text.secondary' }}
           >
                {t('brandRise.competitors.listTitle')}
           </Button>
           
           <Box display="flex" justifyContent="space-between" alignItems="center" pb={3} borderBottom={`1px solid ${theme.palette.divider}`}>
                <Stack direction="row" spacing={3} alignItems="center">
                    {competitor.logo ? (
                        <Box component="img" src={competitor.logo} sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'contain', bgcolor: 'background.paper', boxShadow: 1 }} />
                    ) : (
                        <Box sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.5rem', boxShadow: 1 }}>
                            {competitor.name?.substring(0, 1) || competitor.domain?.substring(0, 1)}
                        </Box>
                    )}
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={2} mb={0.5}>
                             <Typography variant="h4" fontWeight="bold">{competitor.name || competitor.domain}</Typography>
                             <Chip 
                                label={competitor.type.replace('_', ' ')} 
                                size="small" 
                                color={competitor.type === 'DIRECT_LOCAL' ? 'success' : 'default'} 
                                sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                            />
                        </Stack>
                        <LinkTypography domain={competitor.domain} />
                    </Box>
                </Stack>
                {/* Actions could go here */}
           </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="competitor details tabs">
          <Tab label="Overview" sx={{ fontWeight: 600 }} />
          <Tab label="Strategic Analysis" sx={{ fontWeight: 600 }} />
          <Tab label="Signals & Cues" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ mt: 2 }}>
        
        {/* TAB 1: OVERVIEW */}
        <TabPanel value={tabValue} index={0}>
            <Stack spacing={4}>
                {/* UVP Hero Section */}
                <Paper sx={{ p: 4, borderRadius: 2, background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 1)})`, borderLeft: `6px solid ${theme.palette.primary.main}` }}>
                    <Typography variant="overline" color="primary" fontWeight="bold" sx={{ letterSpacing: 1.5 }}>Unique Value Proposition</Typography>
                    <Typography variant="h5" fontWeight="500" sx={{ mt: 2, fontStyle: 'italic', color: 'text.primary', lineHeight: 1.5 }}>
                        "{snapshot.uvp || "No UVP extracted yet."}"
                    </Typography>
                </Paper>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    {/* Services */}
                    <Box sx={{ flex: 1 }}>
                        <SectionPaper title="Service Offerings" icon={<VerifiedIcon color="info" />}>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {snapshot.serviceList?.map((service: string, i: number) => (
                                    <Chip key={i} label={service} size="medium" variant="outlined" sx={{ borderRadius: 1 }} />
                                )) || <Typography variant="body2" color="text.secondary">No services listed.</Typography>}
                            </Stack>
                        </SectionPaper>
                    </Box>

                    {/* Differentiators */}
                    <Box sx={{ flex: 1 }}>
                        <SectionPaper title="Unique Differentiators" icon={<AutoGraphIcon color="secondary" />}>
                             <Stack spacing={2}>
                                {ensureArray(snapshot.differentiators?.unique).map((item, i) => (
                                    <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <Box sx={{ minWidth: 24, height: 24, borderRadius: '50%', bgcolor: theme.palette.secondary.main, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', mt: 0.3 }}>
                                            {i + 1}
                                        </Box>
                                        <Typography variant="body1">{item}</Typography>
                                    </Box>
                                ))}
                                {ensureArray(snapshot.differentiators?.unique).length === 0 && <Typography variant="body2" color="text.secondary">None found.</Typography>}
                             </Stack>
                        </SectionPaper>
                    </Box>
                </Stack>
            </Stack>
        </TabPanel>

        {/* TAB 2: STRATEGIC ANALYSIS */}
        <TabPanel value={tabValue} index={1}>
            <Stack direction="row" flexWrap="wrap" spacing={3} useFlexGap>
                {/* Strengths */}
                <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                    <SectionPaper title="Strengths" color={theme.palette.success.main} icon={<CheckCircleIcon color="success" />}>
                        <ListItems items={ensureArray(snapshot.differentiators?.strengths)} icon={<CheckCircleIcon color="success" fontSize="small" />} />
                    </SectionPaper>
                </Box>
                {/* Weaknesses */}
                <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                    <SectionPaper title="Weaknesses" color={theme.palette.error.main} icon={<CancelIcon color="error" />}>
                        <ListItems items={ensureArray(snapshot.differentiators?.weaknesses)} icon={<CancelIcon color="error" fontSize="small" />} />
                    </SectionPaper>
                </Box>
                {/* What to Learn */}
                <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                    <SectionPaper title="What to Learn" color={theme.palette.warning.main} icon={<LightbulbIcon color="warning" />}>
                        <ListItems items={ensureArray(snapshot.whatToLearn)} icon={<CheckCircleIcon color="warning" fontSize="small" />} />
                    </SectionPaper>
                </Box>
                {/* What to Avoid */}
                <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                    <SectionPaper title="What to Avoid" color={theme.palette.error.dark} icon={<CancelIcon sx={{ color: theme.palette.error.dark }} />}>
                         <ListItems items={ensureArray(snapshot.whatToAvoid)} icon={<CancelIcon sx={{ color: theme.palette.error.dark }} fontSize="small" />} />
                    </SectionPaper>
                </Box>
            </Stack>
        </TabPanel>

        {/* TAB 3: SIGNALS */}
        <TabPanel value={tabValue} index={2}>
            <Stack direction="row" flexWrap="wrap" spacing={3} useFlexGap>
                <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                    <SectionPaper title="Trust Signals" color={theme.palette.info.main} icon={<VerifiedIcon color="info" />}>
                        <Stack flexWrap="wrap" gap={1} direction="row">
                            {ensureArray((snapshot as any).trustSignals).map((s: string, i: number) => (
                                <Chip key={i} label={s} size="small" sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.dark, fontWeight: 500 }} />
                            ))}
                            {ensureArray((snapshot as any).trustSignals).length === 0 && <Typography variant="caption" color="text.secondary">None</Typography>}
                        </Stack>
                    </SectionPaper>
                </Box>
                <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                    <SectionPaper title="Pricing Cues" color={theme.palette.success.main} icon={<PriceCheckIcon color="success" />}>
                         <Stack flexWrap="wrap" gap={1} direction="row">
                            {ensureArray((snapshot as any).pricingCues).map((s: string, i: number) => (
                                <Chip key={i} label={s} size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark, fontWeight: 500 }} />
                            ))}
                            {ensureArray((snapshot as any).pricingCues).length === 0 && <Typography variant="caption" color="text.secondary">None</Typography>}
                        </Stack>
                    </SectionPaper>
                </Box>
                <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                    <SectionPaper title="CTA Styles" color={theme.palette.primary.main} icon={<AdsClickIcon color="primary" />}>
                         <Stack flexWrap="wrap" gap={1} direction="row">
                            {ensureArray((snapshot as any).ctaStyles).map((s: string, i: number) => (
                                <Chip key={i} label={s} size="small" variant="outlined" color="primary" sx={{ fontWeight: 500 }} />
                            ))}
                            {ensureArray((snapshot as any).ctaStyles).length === 0 && <Typography variant="caption" color="text.secondary">None</Typography>}
                        </Stack>
                    </SectionPaper>
                </Box>
            </Stack>
        </TabPanel>
      </Box>
    </Container>
  );
}
