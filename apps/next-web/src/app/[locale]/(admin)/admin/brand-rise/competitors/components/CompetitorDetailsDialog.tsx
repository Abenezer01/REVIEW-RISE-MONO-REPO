import { useTranslations } from 'next-intl';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Stack,
  Chip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Competitor } from './CompetitorCard';

interface CompetitorDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  competitor: Competitor | null;
}

export const CompetitorDetailsDialog = ({ open, onClose, competitor }: CompetitorDetailsDialogProps) => {
  const t = useTranslations('dashboard');
  const theme = useTheme();

  if (!competitor) return null;

  const snapshot = competitor.snapshots?.[0] || {};

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
            {competitor.logo ? (
                <Box component="img" src={competitor.logo} sx={{ width: 40, height: 40, borderRadius: 1 }} />
            ) : (
                <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    {competitor.name?.substring(0, 1) || competitor.domain?.substring(0, 1)}
                </Box>
            )}
            <Box>
                <Typography variant="h6" fontWeight="bold">{competitor.name || competitor.domain}</Typography>
                <Typography variant="body2" color="text.secondary">{competitor.domain}</Typography>
            </Box>
            <Chip 
                label={competitor.type.replace('_', ' ')} 
                size="small" 
                color={competitor.type === 'DIRECT_LOCAL' ? 'success' : 'default'} 
                sx={{ fontWeight: 600 }}
            />
        </Stack>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
            {/* Left Column: Core Differentiators */}
            <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                    <SectionPaper title="Unique Value Proposition" color={theme.palette.primary.main}>
                        <Typography variant="body1" fontWeight="500">
                            {snapshot.uvp || "No UVP extracted yet."}
                        </Typography>
                    </SectionPaper>

                    <SectionPaper title="Service List" color={theme.palette.info.main}>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {snapshot.serviceList?.map((service, i) => (
                                <Chip key={i} label={service} size="small" variant="outlined" />
                            )) || <Typography variant="body2" color="text.secondary">No services listed.</Typography>}
                        </Stack>
                    </SectionPaper>

                    <SectionPaper title="Strengths" color={theme.palette.success.main}>
                        <ListItems items={snapshot.differentiators?.strengths} icon={<CheckCircleIcon color="success" fontSize="small" />} />
                    </SectionPaper>

                    <SectionPaper title="Weaknesses" color={theme.palette.error.main}>
                        <ListItems items={snapshot.differentiators?.weaknesses} icon={<CancelIcon color="error" fontSize="small" />} />
                    </SectionPaper>
                </Stack>
            </Grid>

            {/* Right Column: Deep Dive & Comparison */}
            <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                            <LightbulbIcon color="warning" />
                            <Typography variant="h6" fontWeight="bold">What to Learn</Typography>
                        </Stack>
                        <Grid container spacing={2}>
                            {snapshot.whatToLearn?.map((item, i) => (
                                <Grid item xs={12} sm={6} key={i}>
                                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2, height: '100%' }}>
                                        <Typography variant="body2" fontWeight="500">{item}</Typography>
                                    </Box>
                                </Grid>
                            )) || <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No insights available.</Typography>}
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                         <Typography variant="h6" fontWeight="bold" mb={2}>Unique Differentiators</Typography>
                         <Stack spacing={2}>
                            {snapshot.differentiators?.unique?.map((item, i) => (
                                <Box key={i} sx={{ display: 'flex', gap: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    <Box sx={{ minWidth: 24, height: 24, borderRadius: '50%', bgcolor: theme.palette.secondary.main, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold' }}>
                                        {i + 1}
                                    </Box>
                                    <Typography variant="body2">{item}</Typography>
                                </Box>
                            )) || <Typography variant="body2" color="text.secondary">No unique differentiators found.</Typography>}
                         </Stack>
                    </Paper>
                </Stack>
            </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

const SectionPaper = ({ title, children, color }: { title: string, children: React.ReactNode, color: string }) => (
    <Paper sx={{ p: 2, borderRadius: 2, borderTop: `4px solid ${color}` }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color }}>{title}</Typography>
        {children}
    </Paper>
);

const ListItems = ({ items, icon }: { items?: string[], icon: React.ReactNode }) => {
    if (!items || items.length === 0) return <Typography variant="body2" color="text.secondary">None identified.</Typography>;
    return (
        <Stack spacing={1}>
            {items.map((item, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="start">
                    <Box sx={{ mt: 0.5 }}>{icon}</Box>
                    <Typography variant="body2">{item}</Typography>
                </Stack>
            ))}
        </Stack>
    );
};