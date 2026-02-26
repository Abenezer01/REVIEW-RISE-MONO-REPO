import React from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  alpha,
  useTheme
} from '@mui/material';
import { useTranslations } from 'next-intl';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';

interface PhotosFilterToolbarProps {
  category: string;
  onCategoryChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  view: 'grid' | 'list';
  onViewChange: (value: 'grid' | 'list') => void;
}

export const PhotosFilterToolbar = ({
  category,
  onCategoryChange,
  sort,
  onSortChange,
  view,
  onViewChange
}: PhotosFilterToolbarProps) => {
  const t = useTranslations('gbp-rocket.photos');
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        p: 2,
        mb: 4,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Search */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        minWidth: 250,
        bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
        borderRadius: 1,
        px: 1.5,
        py: 0.75
      }}>
        <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
        <InputBase
          placeholder={t('filter.searchPlaceholder')}
          sx={{ flex: 1, fontSize: 14 }}
        />
      </Box>

      {/* Filters */}
      <Stack direction="row" spacing={3} alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{t('filter.category')}</Typography>
          <Select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            size="small"
            variant="standard"
            disableUnderline
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: 'text.primary',
              '& .MuiSelect-select': { py: 0.5, pr: '32px !important' },
              '& .MuiSelect-icon': { right: 0 }
            }}
          >
            <MenuItem value="All">{t('filter.all')}</MenuItem>
            <MenuItem value="COVER">{t('filter.cover')}</MenuItem>
            <MenuItem value="INTERIOR">{t('filter.interior')}</MenuItem>
            <MenuItem value="EXTERIOR">{t('filter.exterior')}</MenuItem>
            <MenuItem value="FOOD">{t('filter.food')}</MenuItem>
            <MenuItem value="TEAM">{t('filter.team')}</MenuItem>
          </Select>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{t('filter.sort')}</Typography>
          <Select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            size="small"
            variant="standard"
            disableUnderline
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: 'text.primary',
              '& .MuiSelect-select': { py: 0.5, pr: '32px !important' },
              '& .MuiSelect-icon': { right: 0 }
            }}
          >
            <MenuItem value="Newest">{t('filter.newest')}</MenuItem>
            <MenuItem value="Oldest">{t('filter.oldest')}</MenuItem>
          </Select>
        </Stack>

        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => onViewChange('grid')}
            sx={{
              bgcolor: view === 'grid' ? alpha(theme.palette.warning.main, 0.2) : 'transparent',
              color: view === 'grid' ? 'warning.main' : 'text.secondary',
              borderRadius: 1
            }}
          >
            <GridViewIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onViewChange('list')}
            sx={{
              bgcolor: view === 'list' ? alpha(theme.palette.warning.main, 0.2) : 'transparent',
              color: view === 'list' ? 'warning.main' : 'text.secondary',
              borderRadius: 1
            }}
          >
            <ViewListIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};
