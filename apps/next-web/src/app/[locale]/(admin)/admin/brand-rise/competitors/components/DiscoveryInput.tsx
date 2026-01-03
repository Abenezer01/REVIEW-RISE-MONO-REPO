'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Box, 
  Card,
  TextField,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Chip as Badge,
  alpha,
  useTheme
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';

interface DiscoveryInputProps {
  onDiscover: (keywords: string[]) => void;
  isLoading: boolean;
}

export const DiscoveryInput = ({ onDiscover, isLoading }: DiscoveryInputProps) => {
  const t = useTranslations('dashboard');
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [keywords, setKeywords] = useState<string[]>([
    'digital marketing agency',
    'local SEO services',
    'content marketing strategy',
    'social media management',
    'PPC advertising'
  ]);

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
    <Card 
      elevation={0}
      sx={{ 
        p: 4,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        boxShadow: theme.shadows[1]
      }}
    >
      {/* AI-Powered Badge */}
      <Badge
        icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
        label="AI-Powered"
        size="small"
        sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          bgcolor: alpha('#9E69FD', 0.15),
          color: '#9E69FD',
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: 1,
          px: 0.5,
          '& .MuiChip-icon': {
            color: '#9E69FD'
          }
        }}
      />

      {/* Input Field */}
      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder={t('brandRise.competitors.inputLabel') || 'Enter keywords to discover competitors...'}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        variant="outlined"
        sx={{
          mb: 3,
          mt: 4,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'warning.main',
            '&.Mui-focused fieldset': {
                borderColor: 'warning.main',
                borderWidth: 2
            }
          }
        }}
      />

      {/* Keywords Chips */}
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3, gap: 1 }}>
        {keywords.map((k) => (
          <Chip 
            key={k} 
            label={k} 
            onDelete={() => removeKeyword(k)} 
            size="medium"
            deleteIcon={<span style={{ fontSize: 18 }}>×</span>}
            sx={{
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              color: 'warning.dark',
              fontWeight: 500,
              borderRadius: 2,
              border: 'none',
              '& .MuiChip-deleteIcon': {
                color: 'warning.main',
                opacity: 0.7,
                '&:hover': {
                  opacity: 1,
                  color: 'warning.dark'
                }
              }
            }}
          />
        ))}
      </Stack>

      {/* Discover Button */}
      <Button 
        variant="contained" 
        onClick={handleDiscover}
        disabled={isLoading || keywords.length === 0}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
        fullWidth
        sx={{ 
          bgcolor: '#D38E18', // Gold color from screenshot
          color: 'white',
          py: 1.5,
          fontWeight: 700,
          fontSize: '1rem',
          borderRadius: 2,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': { 
            bgcolor: '#B87A15',
            boxShadow: 'none'
          },
          '&:disabled': {
            bgcolor: 'action.disabledBackground'
          }
        }}
      >
        {isLoading ? t('brandRise.competitors.discovering') : 'Discover Competitors'}
      </Button>
    </Card>
  );
};
