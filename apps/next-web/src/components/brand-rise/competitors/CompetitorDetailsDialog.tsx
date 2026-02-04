import React, { useState } from 'react';

import { useTranslations } from 'next-intl';


import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
 
  Paper, 
  Typography, 
  Box,
  Stack,
  Chip,
  useTheme,
  alpha,
  Tabs,
  Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import VerifiedIcon from '@mui/icons-material/Verified';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import AdsClickIcon from '@mui/icons-material/AdsClick';

import type { Competitor } from './CompetitorCard';

const ensureArray = (data: any): string[] => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') return [data];
    
return [];
};

interface CompetitorDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  competitor: Competitor | null;
}

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
      style={{ height: '100%', overflowY: 'auto' }}
    >
      {value === index && (
        <Box sx={{ p: 4 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export const CompetitorDetailsDialog = ({ open, onClose, competitor }: CompetitorDetailsDialogProps) => {
  const t = useTranslations('dashboard.brandRise.competitors.detail');
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  if (!competitor) return null;

  const snapshot = competitor.snapshots?.[0] || {};

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: '80vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" spacing={2} alignItems="center">
            {competitor.logo ? (
                <Box component="img" src={competitor.logo} sx={{ width: 48, height: 48, borderRadius: 1.5, objectFit: 'contain', bgcolor: 'background.paper' }} />
            ) : (
                <Box sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {competitor.name?.substring(0, 1) || competitor.domain?.substring(0, 1)}
                </Box>
            )}
            <Box>
                <Typography variant="h5" fontWeight="bold">{competitor.name || competitor.domain}</Typography>
                <LinkTypography domain={competitor.domain} />
            </Box>
            <Chip 
                label={competitor.type.replace('_', ' ')} 
                size="small" 
                color={competitor.type === 'DIRECT_LOCAL' ? 'success' : 'default'} 
                sx={{ ml: 2, fontWeight: 600, textTransform: 'capitalize' }}
            />
        </Stack>
        <IconButton onClick={onClose} size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="competitor details tabs">
          <Tab label={t('tabs.overview')} sx={{ fontWeight: 600 }} />
          <Tab label={t('tabs.strategic')} sx={{ fontWeight: 600 }} />
          <Tab label={t('tabs.signals')} sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
        
        {/* TAB 1: OVERVIEW */}
        <TabPanel value={tabValue} index={0}>
            <Stack spacing={3}>
                {/* UVP Hero Section */}
                <Paper sx={{ p: 3, borderRadius: 2, background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 1)})`, borderLeft: `6px solid ${theme.palette.primary.main}` }}>
                    <Typography variant="overline" color="primary" fontWeight="bold">{t('uvpTitle')}</Typography>
                    <Typography variant="h6" fontWeight="500" sx={{ mt: 1, fontStyle: 'italic', color: 'text.primary' }}>
                        { '"' }{snapshot.uvp || t('noUvp')}{ '"' }
                    </Typography>
                </Paper>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    {/* Services */}
                    <Box sx={{ flex: 1 }}>
                        <SectionPaper title={t('servicesTitle')} icon={<VerifiedIcon color="info" />}>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {snapshot.serviceList?.map((service: string, i: number) => (
                                    <Chip key={i} label={service} size="medium" variant="outlined" sx={{ borderRadius: 1 }} />
                                )) || <Typography variant="body2" color="text.secondary">{t('noServices')}</Typography>}
                            </Stack>
                        </SectionPaper>
                    </Box>

                    {/* Differentiators */}
                    <Box sx={{ flex: 1 }}>
                        <SectionPaper title={t('diffTitle')} icon={<AutoGraphIcon color="secondary" />}>
                             <Stack spacing={1.5}>
                                {ensureArray(snapshot.differentiators?.unique).map((item, i) => (
                                    <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <Box sx={{ minWidth: 20, height: 20, borderRadius: '50%', bgcolor: theme.palette.secondary.main, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold', mt: 0.3 }}>
                                            {i + 1}
                                        </Box>
                                        <Typography variant="body2">{item}</Typography>
                                    </Box>
                                ))}
                                {ensureArray(snapshot.differentiators?.unique).length === 0 && <Typography variant="body2" color="text.secondary">{t('noneFound')}</Typography>}
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
                    <SectionPaper title={t('strengths')} color={theme.palette.success.main} icon={<CheckCircleIcon color="success" />}>
                        <ListItems items={ensureArray(snapshot.differentiators?.strengths)} icon={<CheckCircleIcon color="success" fontSize="small" />} tNone={t('noneIdentified')} />
                    </SectionPaper>
                </Box>
                {/* Weaknesses */}
                <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                    <SectionPaper title={t('weaknesses')} color={theme.palette.error.main} icon={<CancelIcon color="error" />}>
                        <ListItems items={ensureArray(snapshot.differentiators?.weaknesses)} icon={<CancelIcon color="error" fontSize="small" />} tNone={t('noneIdentified')} />
                    </SectionPaper>
                </Box>
                {/* What to Learn */}
                <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                    <SectionPaper title={t('toLearn')} color={theme.palette.warning.main} icon={<LightbulbIcon color="warning" />}>
                        <ListItems items={ensureArray(snapshot.whatToLearn)} icon={<CheckCircleIcon color="warning" fontSize="small" />} tNone={t('noneIdentified')} />
                    </SectionPaper>
                </Box>
                {/* What to Avoid */}
                <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                    <SectionPaper title={t('toAvoid')} color={theme.palette.error.dark} icon={<CancelIcon sx={{ color: theme.palette.error.dark }} />}>
                         <ListItems items={ensureArray(snapshot.whatToAvoid)} icon={<CancelIcon sx={{ color: theme.palette.error.dark }} fontSize="small" />} tNone={t('noneIdentified')} />
                    </SectionPaper>
                </Box>
            </Stack>
        </TabPanel>

        {/* TAB 3: SIGNALS */}
        <TabPanel value={tabValue} index={2}>
            <Stack direction="row" flexWrap="wrap" spacing={3} useFlexGap>
                <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                    <SectionPaper title={t('trustSignals')} color={theme.palette.info.main} icon={<VerifiedIcon color="info" />}>
                        <Stack flexWrap="wrap" gap={1} direction="row">
                            {ensureArray((snapshot as any).trustSignals).map((s: string, i: number) => (
                                <Chip key={i} label={s} size="small" sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.dark, fontWeight: 500 }} />
                            ))}
                            {ensureArray((snapshot as any).trustSignals).length === 0 && <Typography variant="caption" color="text.secondary">{t('none')}</Typography>}
                        </Stack>
                    </SectionPaper>
                </Box>
                <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                    <SectionPaper title={t('pricingTitle')} color={theme.palette.success.main} icon={<PriceCheckIcon color="success" />}>
                         <Stack flexWrap="wrap" gap={1} direction="row">
                            {ensureArray((snapshot as any).pricingCues).map((s: string, i: number) => (
                                <Chip key={i} label={s} size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark, fontWeight: 500 }} />
                            ))}
                            {ensureArray((snapshot as any).pricingCues).length === 0 && <Typography variant="caption" color="text.secondary">{t('none')}</Typography>}
                        </Stack>
                    </SectionPaper>
                </Box>
                <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                    <SectionPaper title={t('ctaTitle')} color={theme.palette.primary.main} icon={<AdsClickIcon color="primary" />}>
                         <Stack flexWrap="wrap" gap={1} direction="row">
                            {ensureArray((snapshot as any).ctaStyles).map((s: string, i: number) => (
                                <Chip key={i} label={s} size="small" variant="outlined" color="primary" sx={{ fontWeight: 500 }} />
                            ))}
                            {ensureArray((snapshot as any).ctaStyles).length === 0 && <Typography variant="caption" color="text.secondary">{t('none')}</Typography>}
                        </Stack>
                    </SectionPaper>
                </Box>
            </Stack>
        </TabPanel>

      </DialogContent>
    </Dialog>
  );
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

const ListItems = ({ items, icon, tNone }: { items?: string[], icon: React.ReactNode, tNone: string }) => {
    if (!items || items.length === 0) return <Typography variant="body2" color="text.secondary">{tNone}</Typography>;
    
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