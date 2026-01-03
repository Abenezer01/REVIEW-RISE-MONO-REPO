'use client';

import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Chip, 
  Button,
  Stack,
  alpha
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import InsightsIcon from '@mui/icons-material/Insights';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

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
  ranking?: number; // Added ranking
  snapshots?: CompetitorSnapshot[];
}

interface CompetitorCardProps {
  competitor: Competitor;
  onAnalyze: (id: string) => void;
  onRemove: (id: string) => void;
  isAnalyzing: boolean;
  onViewReport?: () => void;
  rank: number;
}

export const CompetitorCard = ({ competitor, onAnalyze, onRemove, isAnalyzing, onViewReport, rank }: CompetitorCardProps) => {
  const getTypeColor = (type: string) => {
      switch(type) {
          case 'DIRECT_LOCAL': return { bg: alpha('#28C76F', 0.15), color: '#28C76F' };
          case 'CONTENT': return { bg: alpha('#00CFE8', 0.15), color: '#00CFE8' };
          case 'AGGREGATOR': return { bg: alpha('#A8AAAE', 0.15), color: '#A8AAAE' }; // Gray/Purple
          default: return { bg: alpha('#A8AAAE', 0.15), color: '#A8AAAE' };
      }
  };

  const typeStyle = getTypeColor(competitor.type);

  return (
    <Card 
        variant="outlined" 
        sx={{ 
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            mb: 2,
            boxShadow: 'none',
            '&:hover': {
                borderColor: 'primary.main',
                boxShadow: 1
            }
        }}
    >
      <CardContent sx={{ p: '16px !important', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Rank Box */}
            <Box 
                sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    bgcolor: '#D38E18', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.25rem'
                }}
            >
                {rank}
            </Box>

            {/* Domain Name */}
            <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 500 }}>
                {competitor.domain}
            </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Type Badge */}
            <Chip 
                label={competitor.type.replace('_', ' ')} 
                size="small" 
                sx={{ 
                    bgcolor: typeStyle.bg, 
                    color: typeStyle.color, 
                    fontWeight: 700, 
                    borderRadius: 1,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    height: 24
                }}
            />

            {/* Actions */}
            <IconButton size="small" sx={{ color: '#FF9F43' }}>
                <BookmarkBorderIcon />
            </IconButton>

            <IconButton onClick={() => onRemove(competitor.id)} size="small" sx={{ color: '#EA5455', bgcolor: alpha('#EA5455', 0.1) }}>
                <DeleteIcon fontSize="small" />
            </IconButton>

            <Button 
                variant="contained" 
                size="small" 
                startIcon={<InsightsIcon fontSize="small" />}
                onClick={onViewReport || (() => onAnalyze(competitor.id))}
                sx={{ 
                    bgcolor: '#9E69FD',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    px: 2,
                    '&:hover': { bgcolor: '#804BDF' }
                }}
            >
                Analyze
            </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
