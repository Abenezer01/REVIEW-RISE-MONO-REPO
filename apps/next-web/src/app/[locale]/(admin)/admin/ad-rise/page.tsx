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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  ContentCopy as DuplicateIcon,
  Add as AddIcon,
  Campaign as CampaignIcon,
  AutoFixHigh as AutoFixHighIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
  FactCheck as GuideIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

import { useTranslations } from 'next-intl';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import { useBusinessId } from '@/hooks/useBusinessId';
import { usePermissions } from '@/hooks/usePermissions';
import { getSessions, getSessionWithLatestVersion, updateChecklist, deleteSession, duplicateSession, getChecklist } from '@/app/actions/adrise';
import StatisticsCard from '@/components/statistics/StatisticsCard';
import TableListing from '@/components/shared/listing/list-types/table-listing';

import AdRiseWizard from './AdRiseWizard';
import ExecutionGuide from './ExecutionGuide';

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

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [sessionForGuide, setSessionForGuide] = useState<any | null>(null);
  const [isUpdatingChecklist, setIsUpdatingChecklist] = useState(false);
  const [budgetConfig, setBudgetConfig] = useState({ lowMax: 500, midMax: 1500 });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) return;
    const storageKey = `adrise_budget_config_${businessId}`;
    const stored = localStorage.getItem(storageKey);

    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      const lowMax = Math.max(1, Number(parsed?.lowMax || 500));
      const midMax = Math.max(lowMax + 1, Number(parsed?.midMax || 1500));
      const nextConfig = { lowMax, midMax };

      setBudgetConfig(nextConfig);
    } catch (error) {
      console.error('Failed to parse AdRise budget config:', error);
    }
  }, [businessId]);

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
      stats: sessions.filter(s => Array.isArray(s.outputs) && s.outputs.length > 0).length.toString(),
      title: 'Generated Plans',
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
      stats: sessions.filter(s => s.mode === 'QUICK').length.toString(),
      title: 'Quick Mode',
      color: 'warning' as const,
      icon: 'tabler-pencil'
    }
  ];

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

        const knownIndustries = new Set([
          'ecommerce',
          'saas',
          'real_estate',
          'healthcare',
          'fashion',
          'food_beverage',
          'travel',
          'automotive',
          'finance',
          'legal',
          'education',
          'local'
        ]);

        const industryCode = session.industryCode || '';

        // Use session.inputs as the primary source of truth for current state
        const inputs = (session.inputs || session.latestInputs || {}) as any;
        const latestOutput = Array.isArray(session.outputs) && session.outputs.length > 0 ? (session.outputs[0] as any)?.output : null;
        const latestPlan = latestOutput?.plan || null;

        setInitialData({
          sessionName: inputs.sessionName || '',
          industry: industryCode,
          industryCustom: inputs.industryCustom || (industryCode && !knownIndustries.has(industryCode) ? industryCode : ''),
          offer: inputs.offer || '',
          goal: session.objective || '',
          budgetMonthly: session.budgetMonthly || 1000,
          locations: session.geo || [],
          brandTone: inputs.brandTone || '',
          mode: session.mode || 'QUICK',
          competitors: inputs.competitors || [],
          geoCenter: inputs.geoCenter || '',
          geoRadius: inputs.geoRadius || 10,
          audienceNotes: inputs.audienceNotes || '',
          seasonality: inputs.seasonality || 'none',
          seasonalityStart: inputs.seasonalityStart || '',
          seasonalityEnd: inputs.seasonalityEnd || '',
          promoWindow: inputs.promoWindow || 7,
          landingPage: inputs.landingPage || '',
          campaignStart: inputs.campaignStart || '',
          campaignEnd: inputs.campaignEnd || '',
          pacing: inputs.pacing || 'even',
          strategyNarrative: inputs.strategyNarrative || latestPlan?.narrative || null,
          planningAssumptions: inputs.planningAssumptions || latestPlan?.assumptions || [],
          savedAllocation: latestPlan?.allocation || null
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
      const duplicateResult = await duplicateSession(sessionId);

      if (duplicateResult.success && duplicateResult.data?.id) {
        await fetchSessions();
        await handleEdit(duplicateResult.data.id);
      }
    } catch (error) {
      console.error('Failed to load session for duplicating:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchSessions, handleEdit]);

  const handleOpenGuide = useCallback(async (session: any) => {
    try {
      const checklistResult = await getChecklist(session.id);
      const checklist = checklistResult.success ? (checklistResult.data?.checklist || {}) : ((session.inputs as any)?.checklist || {});

      setSessionForGuide({
        ...session,
        inputs: {
          ...(session.inputs || {}),
          checklist
        }
      });
    } catch (error) {
      console.error('Failed to load checklist for guide:', error);
      setSessionForGuide(session);
    } finally {
      setIsGuideOpen(true);
    }
  }, []);

  const handleToggleStep = useCallback(async (stepId: string, completed: boolean) => {
    if (!sessionForGuide) return;
    setIsUpdatingChecklist(true);

    try {
      const result = await updateChecklist(sessionForGuide.id, stepId, completed);

      if (result.success) {
        // Update local state to reflect change immediately
        setSessionForGuide((prev: any) => {
          const inputs = (prev.inputs || {}) as any;
          const checklist = inputs.checklist || {};

          return {
            ...prev,
            inputs: {
              ...inputs,
              checklist: {
                ...checklist,
                [stepId]: completed
              }
            }
          };
        });

        // Also update the sessions list
        setSessions(prev => prev.map(s => (s.id === sessionForGuide.id ? {
          ...s,
          inputs: {
            ...(s.inputs || {}),
            checklist: {
              ...((s.inputs || {}).checklist || {}),
              [stepId]: completed
            }
          }
        } : s)));
      }
    } catch (error) {
      console.error('Failed to update step:', error);
    } finally {
      setIsUpdatingChecklist(false);
    }
  }, [sessionForGuide]);

  const handleDeleteClick = useCallback((sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!sessionToDelete) return;
    setLoading(true);
    setDeleteDialogOpen(false);

    try {
      const result = await deleteSession(sessionToDelete);

      if (result.success) {
        await fetchSessions();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setLoading(false);
      setSessionToDelete(null);
    }
  }, [sessionToDelete, fetchSessions]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  }, []);

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
      field: 'latestVersion',
      headerName: 'Version',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Chip
            label={`v${params.value || 1}`}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 600 }}
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
      width: 200,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center" sx={{ height: '100%', pr: 2 }}>
          <Tooltip title={t('adrise.sessions.viewGuide')}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenGuide(params.row);
              }}
              sx={{ color: 'info.main', bgcolor: alpha(theme.palette.info.main, 0.08) }}
            >
              <GuideIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
            <>
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
              <Tooltip title={t('adrise.sessions.delete')}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(params.row.id);
                  }}
                  sx={{ color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.08) }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      )
    }
  ], [theme, t, tc, canEdit, handleEdit, handleDuplicate, handleDeleteClick, handleOpenGuide]);

  const handleWizardSuccess = () => {
    setIsWizardOpen(false);
    fetchSessions();
  };

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box className="hide-on-print">
            <Typography variant='h3' sx={{ fontWeight: 700, mb: 0.5 }}>
              {t('navigation.ad-rise')}™
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              {t('adrise.subtitle')}
            </Typography>
          </Box>
          {!isWizardOpen && canEdit && (
            <Stack direction="row" spacing={2} className="hide-on-print">
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
            </Stack>
          )}
        </Box>
      </Grid>

      {!isWizardOpen && !isGuideOpen && (
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
              className="hide-on-print"
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
              budgetConfig={budgetConfig}
            />
          </Box>
        </Grid>
      )}

      {isGuideOpen && sessionForGuide && (
        <Grid size={{ xs: 12 }}>
          <Box>
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={() => setIsGuideOpen(false)}
              className="hide-on-print"
              sx={{ mb: 4, fontWeight: 600 }}
            >
              {t('adrise.sessions.backToSessions')}
            </Button>
            <ExecutionGuide
              sessionId={sessionForGuide.id}
              sessionContext={{
                sessionName: (sessionForGuide.inputs as any)?.sessionName,
                industry: sessionForGuide.industryCode,
                goal: sessionForGuide.objective,
                budgetMonthly: sessionForGuide.budgetMonthly,
                mode: sessionForGuide.mode,
                locations: sessionForGuide.geo
              }}
              initialChecklist={(sessionForGuide.inputs as any)?.checklist || {}}
              onToggleStep={handleToggleStep}
              isSaving={isUpdatingChecklist}
            />
          </Box>
        </Grid>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {t('adrise.sessions.deleteConfirmTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('adrise.sessions.deleteConfirmMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2 }}>
          <Button onClick={handleDeleteCancel} variant="outlined">
            {tc('common.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" autoFocus>
            {tc('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default AdminAdRisePage;
