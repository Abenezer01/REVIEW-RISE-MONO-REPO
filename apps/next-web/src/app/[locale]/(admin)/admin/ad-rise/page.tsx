/* eslint-disable import/no-unresolved */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import {
  Grid,
  Typography,
  Card,
  Button,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  Chip,
  Stack,
  useTheme,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Edit as EditIcon,
  ContentCopy as DuplicateIcon,
  Add as AddIcon,
  Campaign as CampaignIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  AutoFixHigh as AutoFixHighIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircleOutline as ActiveIcon,
  HistoryEdu as DraftIcon,
  DoneAll as CompletedIcon
} from '@mui/icons-material';

import { useTranslations } from 'next-intl';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import { useBusinessId } from '@/hooks/useBusinessId';
import { usePermissions } from '@/hooks/usePermissions';
import { getSessions, getSessionWithLatestVersion, updateSessionStatus } from '@/app/actions/adrise';
import StatisticsCard from '@/components/statistics/StatisticsCard';
import TableListing from '@/components/shared/listing/list-types/table-listing';

import AdRiseWizard from './AdRiseWizard';

const AdminAdRisePage = () => {
  const theme = useTheme();
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const { businessId } = useBusinessId();
  const { canEdit, loading: permissionsLoading } = usePermissions();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();
  const [initialData, setInitialData] = useState<any | undefined>();
  
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<{ el: HTMLElement, sessionId: string } | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);

    try {
      const result = await getSessions(businessId);

      if (result.success) {
        setSessions(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const stats = [
    {
      stats: sessions.length.toString(),
      title: 'Total Sessions',
      color: 'primary' as const,
      icon: 'tabler-chart-pie-2'
    },
    {
      stats: sessions.filter(s => s.status === 'active').length.toString(),
      title: 'Active Plans',
      color: 'success' as const,
      icon: 'tabler-circle-check'
    },
    {
      stats: sessions.filter(s => s.mode === 'PRO').length.toString(),
      title: 'Pro Mode',
      color: 'info' as const,
      icon: 'tabler-star'
    },
    {
      stats: sessions.filter(s => s.status === 'draft').length.toString(),
      title: 'Drafts',
      color: 'warning' as const,
      icon: 'tabler-pencil'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const handleCreateNew = useCallback(() => {
    setSelectedSessionId(undefined);
    setInitialData(undefined);
    setIsWizardOpen(true);
  }, []);

  const handleEdit = useCallback(async (sessionId: string) => {
    setLoading(true);

    try {
      const result = await getSessionWithLatestVersion(sessionId);

      if (result.success && result.data) {
        const session = result.data;

        // Use session.inputs as the primary source of truth for current state
        const inputs = (session.inputs || session.latestInputs || {}) as any;

        setInitialData({
          sessionName: inputs.sessionName || '',
          industry: session.industryCode || '',
          offer: inputs.offer || '',
          goal: session.objective || '',
          budgetMonthly: session.budgetMonthly || 1000,
          locations: session.geo || [],
          brandTone: inputs.brandTone || '',
          mode: session.mode || 'QUICK',
          competitors: inputs.competitors || [],
          geoRadius: inputs.geoRadius || 10,
          audienceNotes: inputs.audienceNotes || '',
          seasonality: inputs.seasonality || 'none',
          status: session.status || 'active'
        });
        setSelectedSessionId(sessionId);
        setIsWizardOpen(true);
      }
    } catch (error) {
      console.error('Failed to load session for editing:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDuplicate = useCallback(async (sessionId: string) => {
    setLoading(true);

    try {
      const result = await getSessionWithLatestVersion(sessionId);

      if (result.success && result.data) {
        const session = result.data;

        // Use session.inputs as the primary source of truth for current state
        const inputs = (session.inputs || session.latestInputs || {}) as any;

        setInitialData({
          sessionName: `${inputs.sessionName || ''} (Copy)`,
          industry: session.industryCode || '',
          offer: inputs.offer || '',
          goal: session.objective || '',
          budgetMonthly: session.budgetMonthly || 1000,
          locations: session.geo || [],
          brandTone: inputs.brandTone || '',
          mode: session.mode || 'QUICK',
          competitors: inputs.competitors || [],
          geoRadius: inputs.geoRadius || 10,
          audienceNotes: inputs.audienceNotes || '',
          seasonality: inputs.seasonality || 'none',
          status: 'active'
        });
        setSelectedSessionId(undefined); // Duplicating creates a new session
        setIsWizardOpen(true);
      }
    } catch (error) {
      console.error('Failed to load session for duplicating:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusUpdate = useCallback(async (sessionId: string, newStatus: string) => {
    setLoading(true);
    setStatusMenuAnchor(null);

    try {
      const result = await updateSessionStatus(sessionId, newStatus);

      if (result.success) {
        await fetchSessions();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchSessions]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'name',
      headerName: t('adrise.sessions.name'),
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => {
        const session = params.row;
        const name = (session.inputs as any)?.sessionName || 'Unnamed Session';

        return (
          <Stack direction="row" spacing={3} alignItems="center" sx={{ height: '100%' }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              display: 'flex'
            }}>
              <CampaignIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {name}
              </Typography>
            </Box>
          </Stack>
        );
      }
    },
    {
      field: 'mode',
      headerName: t('adrise.basics.mode'),
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Chip 
            label={params.value} 
            size="small" 
            variant="tonal"
            color={params.value === 'PRO' ? 'info' : 'secondary'}
            sx={{ fontWeight: 500 }}
          />
        </Box>
      )
    },
    {
      field: 'status',
      headerName: t('adrise.sessions.status'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Chip 
            label={t(`adrise.status.${params.value || 'draft'}`)} 
            size="small" 
            color={getStatusColor(params.value)}
            variant="tonal"
            icon={params.value === 'active' ? <CheckCircleIcon /> : <PendingIcon />}
            sx={{ fontWeight: 500, cursor: canEdit ? 'pointer' : 'default' }}
            onClick={(e) => {
              if (canEdit) {
                e.stopPropagation();
                setStatusMenuAnchor({ el: e.currentTarget, sessionId: params.row.id });
              }
            }}
          />
        </Box>
      )
    },
    {
      field: 'createdAt',
      headerName: t('adrise.sessions.date'),
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2">
            {new Date(params.value).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: t('adrise.sessions.actions'),
      width: 120,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center" sx={{ height: '100%', pr: 2 }}>
          <Tooltip title={canEdit ? t('adrise.sessions.edit') : tc('common.view')}>
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(params.row.id);
              }}
              sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08) }}
            >
              {canEdit ? <EditIcon fontSize="small" /> : <ViewIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          {canEdit && (
            <Tooltip title={t('adrise.sessions.duplicate')}>
              <IconButton 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicate(params.row.id);
                }}
                sx={{ color: 'secondary.main', bgcolor: alpha(theme.palette.secondary.main, 0.08) }}
              >
                <DuplicateIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )
    }
  ], [theme, t, tc, canEdit, handleEdit, handleDuplicate, setStatusMenuAnchor]);

  const handleWizardSuccess = () => {
    setIsWizardOpen(false);
    fetchSessions();
  };

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant='h3' sx={{ fontWeight: 700, mb: 0.5 }}>
              {t('navigation.ad-rise')}™
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              {t('adrise.subtitle')}
            </Typography>
          </Box>
          {!isWizardOpen && canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              sx={{ 
                px: 6, 
                py: 2.5,
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                '&:hover': {
                  boxShadow: theme.shadows[6]
                }
              }}
            >
              {tc('common.add')}
            </Button>
          )}
        </Box>
      </Grid>

      {!isWizardOpen && (
        <>
          <Grid size={{ xs: 12 }}>
            <StatisticsCard 
              data={stats} 
              title="Campaign Overview" 
              actionText="Real-time data"
              gridItemSize={{ xs: 12, sm: 6, md: 3 }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            {loading || permissionsLoading ? (
              <Card sx={{ p: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 3 }}>
                <CircularProgress />
              </Card>
            ) : sessions.length > 0 ? (
              <TableListing
                columns={columns}
                items={sessions}
                isLoading={loading}
                onRowClick={(params) => handleEdit(params.id as string)}
              />
            ) : (
              <Card sx={{ borderRadius: 3, p: 10 }}>
                <Box sx={{ 
                  py: 10, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  px: 5
                }}>
                  <Box sx={{ 
                    mb: 4, 
                    p: 4, 
                    borderRadius: '50%', 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }}>
                    <AutoFixHighIcon sx={{ fontSize: 48 }} />
                  </Box>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    {t('adrise.sessions.noSessions')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 6, maxWidth: 400 }}>
                    {t('adrise.sessions.noSessionsDesc')}
                  </Typography>
                  {canEdit && (
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      onClick={handleCreateNew}
                      sx={{ borderRadius: 2 }}
                    >
                      {t('adrise.sessions.createFirst')}
                    </Button>
                  )}
                </Box>
              </Card>
            )}
          </Grid>
        </>
      )}

      {isWizardOpen && (
        <Grid size={{ xs: 12 }}>
          <Box>
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={() => setIsWizardOpen(false)}
              sx={{ mb: 4, fontWeight: 600 }}
            >
              {t('adrise.sessions.backToSessions')}
            </Button>
            <AdRiseWizard
              businessId={businessId || ''}
              sessionId={selectedSessionId}
              initialData={initialData}
              onSuccess={handleWizardSuccess}
              readOnly={!canEdit}
            />
          </Box>
        </Grid>
      )}

      <Menu
        anchorEl={statusMenuAnchor?.el}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              boxShadow: theme.shadows[4],
              borderRadius: 2,
              mt: 1
            }
          }
        }}
      >
        <MenuItem onClick={() => statusMenuAnchor && handleStatusUpdate(statusMenuAnchor.sessionId, 'active')}>
          <ListItemIcon>
            <ActiveIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText primary={t('adrise.status.active')} />
        </MenuItem>
        <MenuItem onClick={() => statusMenuAnchor && handleStatusUpdate(statusMenuAnchor.sessionId, 'draft')}>
          <ListItemIcon>
            <DraftIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText primary={t('adrise.status.draft')} />
        </MenuItem>
        <MenuItem onClick={() => statusMenuAnchor && handleStatusUpdate(statusMenuAnchor.sessionId, 'completed')}>
          <ListItemIcon>
            <CompletedIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText primary={t('adrise.status.completed')} />
        </MenuItem>
      </Menu>
    </Grid>
  );
};

export default AdminAdRisePage;
