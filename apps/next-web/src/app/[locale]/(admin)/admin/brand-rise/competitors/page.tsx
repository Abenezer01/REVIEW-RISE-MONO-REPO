'use client';

import { 
  Box, 

  Container,
  CircularProgress,
  Button
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

import { DiscoveryInput } from './components/DiscoveryInput';
import { CompetitorList } from './components/CompetitorList';

import { useCompetitors } from './hooks/useCompetitors';

export default function CompetitorsPage() {
  const { 
    competitors, 
    isListLoading, 
    addMutation, 
    removeMutation, 
    extractMutation,
    analyzingIds,

  } = useCompetitors();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            sx={{ 
                bgcolor: '#D38E18', 
                color: 'white', 
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: '#B87A15' }
            }}
        >
            Export List
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <DiscoveryInput 
          onDiscover={(keywords) => {
             // Trigger discovery logic here (mocked for now or wired to existing)
             // For now assuming existing addMutation works as single add, 
             // but discovery usually implies batch finding.
             // We'll just pass the first keyword to addMutation as a placeholder
             // or keep the UI interaction.
             console.log('Discovering for:', keywords);
          }}
          isLoading={false} 
        />
      </Box>

      {/* Show Progress when discovering (mocked state for visual clone) */}
      {/* <DiscoveryProgress /> */} 

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