import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Box,
  Typography,
  Stack,
  Chip,
  alpha
} from '@mui/material';
import { CompetitorCard, Competitor } from './CompetitorCard';
import { CompetitorStatsFooter } from './CompetitorStatsFooter';

interface CompetitorListProps {
  competitors: Competitor[];
  onAdd: (competitor: Competitor) => void;
  onRemove: (id: string) => void;
  onAnalyze: (id: string) => void;
  analyzingIds: string[];
}

import { useRouter, usePathname } from 'next/navigation';

export const CompetitorList = ({ competitors, onAdd, onRemove, onAnalyze, analyzingIds }: CompetitorListProps) => {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<'ALL' | 'DIRECT_LOCAL' | 'CONTENT' | 'AGGREGATOR'>('ALL');

  const counts = {
      total: competitors.length,
      directLocal: competitors.filter(c => c.type === 'DIRECT_LOCAL').length,
      content: competitors.filter(c => c.type === 'CONTENT').length,
      aggregators: competitors.filter(c => c.type === 'AGGREGATOR').length
  };

  const filteredCompetitors = competitors.filter(c => {
      if (filter === 'ALL') return true;
      return c.type === filter;
  });

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
    <>
      <CompetitorStatsFooter 
        total={counts.total} 
        directLocal={counts.directLocal} 
        content={counts.content} 
        aggregators={counts.aggregators} 
      />

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <FilterChip label={`${counts.total} All`} active={filter === 'ALL'} onClick={() => setFilter('ALL')} color="#FF9F43" />
        <Box flex={1} />
        <Box sx={{ width: 40, height: 40, bgcolor: alpha('#28C76F', 0.2), borderRadius: 1 }} />
        <Box sx={{ width: 40, height: 40, bgcolor: alpha('#00CFE8', 0.2), borderRadius: 1 }} />
        <Box sx={{ width: 40, height: 40, bgcolor: alpha('#A8AAAE', 0.2), borderRadius: 1 }} />
      </Stack>

      <Stack spacing={0}>
        {filteredCompetitors.map((competitor, index) => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              onAnalyze={onAnalyze}
              onRemove={onRemove}
              isAnalyzing={analyzingIds.includes(competitor.id)}
              onViewReport={() => router.push(`${pathname}/${competitor.id}`)}
              rank={index + 1}
            />
        ))}
      </Stack>
    </>
  );
};

const FilterChip = ({ label, active, onClick, color }: { label: string, active: boolean, onClick: () => void, color: string }) => (
    <Chip 
        label={label} 
        onClick={onClick}
        sx={{ 
            bgcolor: active ? alpha(color, 0.15) : 'transparent', 
            color: active ? color : 'text.secondary',
            fontWeight: 700,
            borderRadius: 1,
            border: active ? `1px solid ${color}` : '1px solid transparent',
            '&:hover': {
                bgcolor: alpha(color, 0.25)
            }
        }} 
    />
);
