'use client';

import { useTranslations } from 'next-intl';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Chip,
  Button,
  Divider,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsightsIcon from '@mui/icons-material/Insights';
import LanguageIcon from '@mui/icons-material/Language';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

export interface CompetitorSnapshot {
  uvp?: string;
  serviceList?: string[];
  differentiators?: {
    strengths?: string[];
    weaknesses?: string[];
    unique?: string[];
  };
  whatToLearn?: string[];
  whatToAvoid?: string[];
}

export interface Competitor {
  id: string;
  domain: string;
  name: string;
  type: string;
  relevanceScore?: number;
  isUserAdded: boolean;
  snapshots?: CompetitorSnapshot[];
}

interface CompetitorCardProps {
  competitor: Competitor;
  onAnalyze: (id: string) => void;
  onRemove: (id: string) => void;
  isAnalyzing: boolean;
}

export const CompetitorCard = ({ competitor, onAnalyze, onRemove, isAnalyzing }: CompetitorCardProps) => {
  const t = useTranslations('dashboard');
  const snapshot = competitor.snapshots?.[0]; // Get latest snapshot

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" noWrap>{competitor.name}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
                <LanguageIcon fontSize="small" color="disabled" />
                <Typography variant="caption" color="text.secondary">{competitor.domain}</Typography>
            </Stack>
          </Box>
          <Box>
            <Chip 
              label={competitor.type} 
              size="small" 
              color={competitor.type === 'DIRECT_LOCAL' ? 'primary' : 'default'} 
              sx={{ mr: 1 }}
            />
            <IconButton onClick={() => onRemove(competitor.id)} color="default" size="small">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Snapshot Content or Empty State */}
        {snapshot ? (
          <Box>
            {snapshot.uvp && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="primary.main">{t('brandRise.competitors.uvp')}</Typography>
                    <Typography variant="body2">{snapshot.uvp}</Typography>
                </Box>
            )}

            {snapshot.serviceList && snapshot.serviceList.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('brandRise.competitors.services')}</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {snapshot.serviceList.slice(0, 5).map((s, i) => (
                            <Chip key={i} label={s} size="small" variant="outlined" />
                        ))}
                    </Stack>
                </Box>
            )}

            {snapshot.differentiators && (
                <Box>
                     <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('brandRise.competitors.analysis')}</Typography>
                     <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <ThumbUpIcon color="success" fontSize="small" />
                            <Typography variant="caption">{t('brandRise.competitors.strategy', { value: snapshot.differentiators.unique?.[0] || 'N/A' })}</Typography>
                        </Box>
                         <Box display="flex" alignItems="center" gap={1}>
                            <LightbulbIcon color="warning" fontSize="small" />
                            <Typography variant="caption">{t('brandRise.competitors.learn', { value: snapshot.whatToLearn?.[0] || 'N/A' })}</Typography>
                        </Box>
                     </Stack>
                </Box>
            )}
          </Box>
        ) : (
          <Box textAlign="center" py={2}>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('brandRise.competitors.noAnalysis')}
            </Typography>
            <Button 
                variant="outlined" 
                size="small" 
                startIcon={isAnalyzing ? <CircularProgress size={16} /> : <InsightsIcon />}
                onClick={() => onAnalyze(competitor.id)}
                disabled={isAnalyzing}
            >
                {isAnalyzing ? t('brandRise.competitors.analyzing') : t('brandRise.competitors.analyzeWebsite')}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
