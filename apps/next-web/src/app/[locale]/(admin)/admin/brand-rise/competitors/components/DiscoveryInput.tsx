'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Box, 
  Card,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';

interface DiscoveryInputProps {
  onDiscover: (keywords: string[]) => void;
  isLoading: boolean;
}

export const DiscoveryInput = ({ onDiscover, isLoading }: DiscoveryInputProps) => {
  const t = useTranslations('dashboard');
  const [inputValue, setInputValue] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue && !keywords.includes(inputValue)) {
      e.preventDefault();
      setKeywords([...keywords, inputValue]);
      setInputValue('');
    }
  };

  const removeKeyword = (kToDelete: string) => {
    setKeywords(keywords.filter((k) => k !== kToDelete));
  };

  const handleDiscover = () => onDiscover(keywords);

  return (
    <Card variant="outlined" sx={{ mb: 4, p: 2 }}>
      <Typography variant="h6" gutterBottom>{t('brandRise.competitors.discoveryTitle')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('brandRise.competitors.discoverySubtitle')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('brandRise.competitors.inputLabel')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          helperText={
             <Box component="span" sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                {keywords.map((k) => (
                    <Chip key={k} label={k} onDelete={() => removeKeyword(k)} size="small" />
                ))}
             </Box>
          }
        />
        <Button 
            variant="contained" 
            onClick={handleDiscover}
            disabled={isLoading || keywords.length === 0}
            sx={{ flexShrink: 0, bgcolor: '#7367F0', '&:hover': { bgcolor: '#665BE0' } }}
        >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : t('brandRise.competitors.discoverBtn')}
        </Button>
      </Box>
    </Card>
  );
};
