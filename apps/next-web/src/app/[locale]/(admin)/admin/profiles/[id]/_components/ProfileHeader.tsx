'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useTheme, alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Language as WebIcon,
  Business as BusinessIcon,
  CheckCircle as ConfirmIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useTranslations, useFormatter } from 'next-intl';

import type { BrandProfile } from '@/services/brand-profile.service';

interface ProfileHeaderProps {
  profile: BrandProfile;
  t: (key: string) => string;
  isConfirming: boolean;
  isReExtracting: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onReExtract: () => void;
  onDelete: () => void;
}

export default function ProfileHeader({
  profile,
  t,
  isConfirming,
  isReExtracting,
  onBack,
  onConfirm,
  onReExtract,
  onDelete,
}: ProfileHeaderProps) {
  const tc = useTranslations('common');
  const format = useFormatter();
  const theme = useTheme();

  return (
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4, gap: 3 }}>
        <IconButton
          onClick={onBack}
          sx={{
            bgcolor: 'background.paper',
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderColor: 'primary.main',
              color: 'primary.main',
              transform: 'translateX(-4px)',
            },
            transition: 'all 0.2s',
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Tooltip title={profile.title || profile.currentExtractedData?.title || 'Brand Profile'}>
              <Typography
                variant="h3"
                fontWeight="900"
                letterSpacing="-0.03em"
                noWrap
                sx={{ maxWidth: { xs: '200px', sm: '400px', md: '600px', lg: '800px' } }}
              >
                {profile.title || profile.currentExtractedData?.title || 'Brand Profile'}
              </Typography>
            </Tooltip>
            <Chip
              label={t(`status.${profile.status}`)}
              color={
                profile.status === 'completed' ? 'success' :
                  profile.status === 'failed' ? 'error' :
                    profile.status === 'extracting' ? 'info' : 'warning'
              }
              sx={{
                fontWeight: 800,
                textTransform: 'uppercase',
                fontSize: '0.65rem',
                height: 22,
                borderRadius: 1.5,
                boxShadow: (theme) => `0 2px 4px ${alpha(theme.palette.common.black, 0.05)}`
              }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 4 }} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ minWidth: 0 }}>
            <Tooltip title={profile.websiteUrl}>
              <Box
                component="a"
                href={profile.websiteUrl}
                target="_blank"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  '&:hover': { textDecoration: 'underline' },
                  minWidth: 0,
                  maxWidth: '300px'
                }}
              >
                <WebIcon sx={{ mr: 1, fontSize: 18, flexShrink: 0 }} />
                <Typography variant="inherit" noWrap>
                  {profile.websiteUrl.replace(/^https?:\/\//, '')}
                </Typography>
              </Box>
            </Tooltip>
            {profile.business?.name && (
              <Tooltip title={profile.business.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontWeight: 600, fontSize: '0.9rem', minWidth: 0, maxWidth: '300px' }}>
                  <BusinessIcon sx={{ mr: 1, fontSize: 18, flexShrink: 0 }} />
                  <Typography variant="inherit" noWrap>
                    {profile.business.name}
                  </Typography>
                </Box>
              </Tooltip>
            )}
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
              <HistoryIcon sx={{ mr: 0.75, fontSize: 16 }} />
              {tc('form.success-updated')} {format.dateTime(new Date(profile.updatedAt), { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1.5}>
          {profile.status === 'pending_confirmation' && (
            <Button
              variant="contained"
              disableElevation
              startIcon={isConfirming ? <CircularProgress size={20} color="inherit" /> : <ConfirmIcon />}
              onClick={onConfirm}
              disabled={isConfirming}
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 800,
                boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}`
              }}
            >
              {tc('common.confirm')}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={isReExtracting ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={onReExtract}
            disabled={isReExtracting || profile.status === 'extracting'}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 700,
              bgcolor: 'background.paper',
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.02) }
            }}
          >
            {t('list.actions.reExtract')}
          </Button>
          <Tooltip title={tc('common.delete')}>
            <IconButton
              color="error"
              onClick={onDelete}
              sx={{
                borderRadius: 2,
                width: 44,
                height: 44,
                border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                bgcolor: alpha(theme.palette.error.main, 0.04),
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08), borderColor: 'error.main' }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
}
