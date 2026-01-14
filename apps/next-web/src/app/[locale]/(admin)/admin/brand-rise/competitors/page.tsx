'use client';

import { 
  Box, 

  Container,
  CircularProgress,
  Button
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { toast } from 'react-hot-toast';

import { DiscoveryInput } from '@/components/brand-rise/competitors/DiscoveryInput';
import { CompetitorList } from '@/components/brand-rise/competitors/CompetitorList';

import { useCompetitors } from './hooks/useCompetitors';

export default function CompetitorsPage() {
  const { 
    competitors, 
    isListLoading, 
    addMutation, 
    removeMutation, 
    extractMutation,
    analyzingIds,
    discoverMutation,
    discoveryStatus,
  } = useCompetitors();

  const handleExportList = () => {
    try {
      // Convert competitors to CSV
      const headers = ['Name', 'Domain', 'Type', 'Relevance Score', 'Source'];

      const rows = competitors.map(c => [
        c.name,
        c.domain || '',
        c.type,
        c.relevanceScore || '',
        c.source || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', `competitors-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Competitor list exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export competitor list');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={handleExportList}
            disabled={competitors.length === 0}
            sx={{ 
                bgcolor: '#D38E18', 
                color: 'white', 
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: '#B87A15' },
                '&:disabled': {
                  bgcolor: 'action.disabledBackground'
                }
            }}
        >
            Export List
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <DiscoveryInput 
          onDiscover={(keywords) => {
            discoverMutation.mutate(keywords);
          }}
          isLoading={discoveryStatus === 'discovering' || discoverMutation.isPending} 
        />
      </Box>

      <Box sx={{ mt: 4 }}>
        {isListLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#D38E18' }} />
            </Box>
        ) : (
            <CompetitorList 
                competitors={competitors}
                onAdd={(c) => addMutation.mutate(c)}
                onRemove={(id) => removeMutation.mutate(id)}
                onAnalyze={(id) => extractMutation.mutate(id)}
                analyzingIds={analyzingIds}
            />
        )}
      </Box>
    </Container>
  );
}