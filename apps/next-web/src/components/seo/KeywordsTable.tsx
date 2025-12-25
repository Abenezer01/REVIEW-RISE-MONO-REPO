'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import type { KeywordDTO } from '@platform/contracts';

interface KeywordsTableProps {
  keywords: KeywordDTO[];
  loading?: boolean;
  onViewHistory?: (keyword: KeywordDTO) => void;
}

const KeywordsTable: React.FC<KeywordsTableProps> = ({ keywords, loading, onViewHistory }) => {
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [menuKeyword, setMenuKeyword] = React.useState<KeywordDTO | null>(null);

  const columns: GridColDef[] = [
    {
      field: 'keyword',
      headerName: 'Keyword',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'currentRank',
      headerName: 'Rank',
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        const rank = params.value as number | undefined;
        let color: 'success' | 'warning' | 'error' | 'default' | 'info' = 'default';

        if (rank && rank <= 3) color = 'success';
        else if (rank && rank <= 10) color = 'info';
        else if (rank && rank <= 20) color = 'warning';
        else if (rank) color = 'error';

        return rank ? (
          <Chip
            label={rank}
            color={color}
            size="small"
            variant={rank <= 10 ? 'filled' : 'outlined'}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">-</Typography>
        );
      }
    },
    {
      field: 'mapPackPosition',
      headerName: 'Map Pack',
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        const rank = params.value as number | undefined;

        
return rank ? (
          <Chip label={rank} color="primary" size="small" />
        ) : (
          <Typography variant="caption" color="text.secondary">-</Typography>
        );
      }
    },
    {
      field: 'dailyChange',
      headerName: 'Change',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const delta = params.value as number | undefined
        const significant = (params.row as KeywordDTO).significantChange

        if (delta == null) {
          return <Typography variant="caption" color="text.secondary">-</Typography>
        }

        const isUp = delta > 0
        const label = `${isUp ? '▲' : delta < 0 ? '▼' : '—'} ${Math.abs(delta)}`
        const color: 'success' | 'error' | 'default' | 'warning' = isUp ? 'success' : delta < 0 ? 'error' : 'default'
        const variant = significant ? 'filled' : 'outlined'

        
return (
          <Tooltip title={significant ? 'Significant change' : 'Change since yesterday'}>
            <Chip label={label} color={color} size="small" variant={variant} />
          </Tooltip>
        )
      }
    },
    {
      field: 'searchVolume',
      headerName: 'Volume',
      width: 100,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value?.toLocaleString() || '-'}
        </Typography>
      )
    },
    {
      field: 'difficulty',
      headerName: 'KD %',
      width: 100,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => {
        const val = params.value as number | undefined;
        let color = 'success.main';

        if (val && val > 70) color = 'error.main';
        else if (val && val > 40) color = 'warning.main';

        return val ? (
          <Typography variant="body2" color={color} fontWeight="medium">
            {val}
          </Typography>
        ) : '-';
      }
    },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const tags = params.value as string[];

        
return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', my: 1 }}>
            {tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.75rem', height: 20 }} />
            ))}
          </Box>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'active' ? 'success' : 'default'}
          variant="outlined"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={(e) => {
            setMenuAnchor(e.currentTarget);
            setMenuKeyword(params.row as KeywordDTO);
          }}
        >
          ⋮
        </IconButton>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%', height: 600 }}>
      <DataGrid
        rows={keywords}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        density="comfortable"
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderColor: 'divider',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'action.hover',
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
        }}
      />
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setMenuKeyword(null);
        }}
      >
        <MenuItem
          onClick={() => {
            if (menuKeyword && onViewHistory) onViewHistory(menuKeyword);
            setMenuAnchor(null);
            setMenuKeyword(null);
          }}
        >
          View Ranking History
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default KeywordsTable;
