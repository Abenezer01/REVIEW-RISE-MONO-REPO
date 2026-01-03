import { useTranslations } from 'next-intl';
import { 
  Grid,
  Box,
  Typography
} from '@mui/material';
import { CompetitorCard, Competitor } from './CompetitorCard';

interface CompetitorListProps {
  competitors: Competitor[];
  onAdd: (competitor: Competitor) => void;
  onRemove: (id: string) => void;
  onAnalyze: (id: string) => void;
  analyzingIds: string[];
}

export const CompetitorList = ({ competitors, onAdd, onRemove, onAnalyze, analyzingIds }: CompetitorListProps) => {
  const t = useTranslations('dashboard');

  if (competitors.length === 0) {
    return (
      <Box textAlign="center" py={4}>
         <Typography variant="body1" color="text.secondary">
            {t('brandRise.competitors.noCompetitors')}
         </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {competitors.map((competitor) => (
        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={competitor.id}>
          <CompetitorCard
            competitor={competitor}
            onAnalyze={onAnalyze}
            onRemove={onRemove}
            isAnalyzing={analyzingIds.includes(competitor.id)}
          />
        </Grid>
      ))}
    </Grid>
  );
};
