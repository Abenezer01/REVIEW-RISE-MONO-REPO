/* eslint-disable import/no-unresolved */
'use client';

import React, { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { alpha, useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import SyncIcon from '@mui/icons-material/Sync';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import { useLocationFilter } from '@/hooks/useLocationFilter';
import { useTranslation } from '@/hooks/useTranslation';
import apiClient from '@/lib/apiClient';

type NapRecord = {
  name: string;
  address: string;
  phone: string;
};

type DirectoryListing = {
  id: string;
  platform: string;
  isApi: boolean;
  editUrl: string;
  createUrl: string;
  live: NapRecord | null;
  duplicates?: Array<{ id: string; address: string; phone: string }>;
};

type FixState = 'idle' | 'updating' | 'done';

const EMPTY_MASTER: NapRecord = {
  name: '',
  address: '',
  phone: ''
};

const buildListings = (master: NapRecord): DirectoryListing[] => ([
  {
    id: 'google',
    platform: 'Google',
    isApi: true,
    editUrl: 'https://business.google.com/',
    createUrl: 'https://business.google.com/create',
    live: {
      name: master.name,
      address: master.address.replace('Suite 100', '#100'),
      phone: master.phone
    }
  },
  {
    id: 'yelp',
    platform: 'Yelp',
    isApi: false,
    editUrl: 'https://biz.yelp.com/',
    createUrl: 'https://biz.yelp.com/signup',
    live: {
      name: `${master.name} LLC`,
      address: master.address,
      phone: master.phone
    },
    duplicates: [
      {
        id: 'yelp-dup-1',
        address: master.address.replace('Suite 100', 'Ste 100'),
        phone: master.phone
      }
    ]
  },
  {
    id: 'bing',
    platform: 'Bing',
    isApi: true,
    editUrl: 'https://www.bingplaces.com/',
    createUrl: 'https://www.bingplaces.com/',
    live: null
  },
  {
    id: 'apple',
    platform: 'Apple Maps',
    isApi: false,
    editUrl: 'https://businessconnect.apple.com/',
    createUrl: 'https://businessconnect.apple.com/',
    live: {
      name: master.name,
      address: master.address,
      phone: master.phone.replace('333', '330')
    }
  },
  {
    id: 'facebook',
    platform: 'Facebook',
    isApi: true,
    editUrl: 'https://business.facebook.com/',
    createUrl: 'https://business.facebook.com/',
    live: {
      name: master.name,
      address: master.address,
      phone: master.phone
    }
  }
]);

const calcAccuracy = (listings: DirectoryListing[], master: NapRecord) => {
  if (listings.length === 0) return 0;

  const totalFields = listings.length * 3;
  let matches = 0;

  listings.forEach((listing) => {
    if (!listing.live) return;
    matches += listing.live.name === master.name ? 1 : 0;
    matches += listing.live.address === master.address ? 1 : 0;
    matches += listing.live.phone === master.phone ? 1 : 0;
  });

  return Math.round((matches / totalFields) * 100);
};

const statusBadge = (accuracy: number) => {
  if (accuracy >= 90) return { key: 'statusHealthy', color: 'success' as const };
  if (accuracy >= 75) return { key: 'statusWarning', color: 'warning' as const };

  return { key: 'statusCritical', color: 'error' as const };
};

const diffHighlight = (master: string, value: string, missingLabel: string) => {
  if (!value) return <Typography color="error.main">{missingLabel}</Typography>;

  const maxLen = Math.max(master.length, value.length);
  const spans: React.ReactNode[] = [];

  for (let i = 0; i < maxLen; i += 1) {
    const masterChar = master[i];
    const valueChar = value[i];
    const mismatch = masterChar !== valueChar;

    if (valueChar) {
      spans.push(
        <Box
          component="span"
          key={`${value}-${i}`}
          sx={{
            color: mismatch ? 'error.main' : 'text.primary',
            fontWeight: mismatch ? 700 : 500,
            backgroundColor: mismatch ? 'rgba(255, 0, 0, 0.08)' : 'transparent',
            borderRadius: 0.5
          }}
        >
          {valueChar}
        </Box>
      );
    } else if (masterChar) {
      spans.push(
        <Box
          component="span"
          key={`${value}-missing-${i}`}
          sx={{
            color: 'error.main',
            fontWeight: 700,
            backgroundColor: 'rgba(255, 0, 0, 0.08)',
            borderRadius: 0.5
          }}
        >
          {masterChar}
        </Box>
      );
    }
  }

  return <>{spans}</>;
};

const ListingsManager = () => {
  const t = useTranslation('dashboard');
  const theme = useTheme();
  const { locationId } = useLocationFilter();

  const [masterRecord, setMasterRecord] = useState<NapRecord>(EMPTY_MASTER);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingMaster, setEditingMaster] = useState(false);
  const [savingMaster, setSavingMaster] = useState(false);
  const [masterDraft, setMasterDraft] = useState<NapRecord>(EMPTY_MASTER);
  const [listings, setListings] = useState<DirectoryListing[]>([]);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [fixing, setFixing] = useState<Record<string, FixState>>({});

  useEffect(() => {
    const nextListings = buildListings(masterRecord);

    setListings(nextListings);
    setFixing({});
    setLastSyncAt(null);
  }, [masterRecord]);

  useEffect(() => {
    const loadMasterRecord = async () => {
      if (!locationId) return;

      setLoadingMaster(true);
      setLoadError(null);

      try {
        const response = await apiClient.get<{
          id: string;
          name: string | null;
          address: string | null;
          phone: string | null;
        }>(`/api/admin/locations/${locationId}/nap-master`);
        
        const record = response.data as unknown as { name: string | null; address: string | null; phone: string | null };
        const name = record.name || '';
        const address = record.address || '';
        const phone = record.phone || '';
        const next = { name, address, phone };

        setMasterRecord(next);
        setMasterDraft(next);
      } catch (error) {
        console.error('Failed to load master record:', error);
        setLoadError(t('seo.listings.loadFailed'));
        setMasterRecord(EMPTY_MASTER);
      } finally {
        setLoadingMaster(false);
      }
    };

    loadMasterRecord();
  }, [locationId, t]);

  const accuracy = useMemo(() => calcAccuracy(listings, masterRecord), [listings, masterRecord]);
  const badge = statusBadge(accuracy);

  const missingCount = listings.filter((listing) => !listing.live).length;
  const duplicateCount = listings.filter((listing) => (listing.duplicates || []).length > 0).length;

  const mismatchCount = listings.filter((listing) => {
    if (!listing.live) return true;

    return (
      listing.live.name !== masterRecord.name ||
      listing.live.address !== masterRecord.address ||
      listing.live.phone !== masterRecord.phone
    );
  }).length;

  const matchedCount = Math.max(0, listings.length - mismatchCount);

  const pendingFixes = listings.filter((listing) => {
    if (!listing.live) return true;

    return (
      listing.live.name !== masterRecord.name ||
      listing.live.address !== masterRecord.address ||
      listing.live.phone !== masterRecord.phone
    );
  });

  const visibilityLift = Math.min(22, pendingFixes.length * 2 + Math.ceil(pendingFixes.length / 2));

  // Placeholder endpoint: https://api.localseodata.com/v1/geogrid/scan
  // Expected auth (placeholder): Authorization: Bearer $LOCALSEODATA_API_KEY

  const handleSync = async () => {
    setSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLastSyncAt(new Date());
    setSyncing(false);
  };

  const handleEditMaster = () => {
    setMasterDraft(masterRecord);
    setEditingMaster(true);
  };

  const handleCancelMaster = () => {
    setMasterDraft(masterRecord);
    setEditingMaster(false);
  };

  const handleSaveMaster = async () => {
    if (!locationId) return;
    setSavingMaster(true);

    try {
      const response = await apiClient.patch(`/api/admin/locations/${locationId}/nap-master`, {
        name: masterDraft.name,
        address: masterDraft.address,
        phone: masterDraft.phone
      });

      const record = response.data as unknown as { name: string | null; address: string | null; phone: string | null };

      const next = {
        name: record.name || '',
        address: record.address || '',
        phone: record.phone || ''
      };

      setMasterRecord(next);
      setMasterDraft(next);
      setEditingMaster(false);
    } catch (error) {
      console.error('Failed to update master record:', error);
    } finally {
      setSavingMaster(false);
    }
  };

  const handleOneClickFix = async () => {
    const apiTargets = listings.filter((listing) => listing.isApi);
    const duplicateTargets = listings.filter((listing) => (listing.duplicates || []).length > 0);
    const updatedFixing: Record<string, FixState> = {};

    [...apiTargets, ...duplicateTargets].forEach((listing) => {
      updatedFixing[listing.id] = 'updating';
    });

    setFixing((prev) => ({ ...prev, ...updatedFixing }));

    for (const listing of apiTargets) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setListings((prev) =>
        prev.map((item) => {
          if (item.id !== listing.id) return item;

          return {
            ...item,
            live: { ...masterRecord },
            duplicates: []
          };
        })
      );
      setFixing((prev) => ({ ...prev, [listing.id]: 'done' }));
    }

    if (duplicateTargets.length > 0) {
      setListings((prev) =>
        prev.map((item) =>
          (item.duplicates || []).length > 0
            ? { ...item, duplicates: [] }
            : item
        )
      );
      duplicateTargets.forEach((listing) => {
        setFixing((prev) => ({ ...prev, [listing.id]: 'done' }));
      });
    }

    setLastSyncAt(new Date());
  };

  const handleManualFix = (id: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, live: { ...masterRecord } }
          : item
      )
    );
  };

  const handleCopyMaster = async () => {
    const text = `${masterRecord.name}\n${masterRecord.address}\n${masterRecord.phone}`;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // no-op fallback
    }
  };

  if (!locationId) {
    return (
      <Card sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t('seo.listings.title')}
        </Typography>
        <Typography color="text.secondary">
          {t('seo.listings.noLocation')}
        </Typography>
      </Card>
    );
  }

  if (loadingMaster) {
    return (
      <Card sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t('seo.listings.title')}
        </Typography>
        <Typography color="text.secondary">
          {t('seo.listings.loadingMaster')}
        </Typography>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t('seo.listings.title')}
        </Typography>
        <Typography color="error.main">
          {loadError}
        </Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Card
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.info.main, 0.08)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              {t('seo.listings.title')}
            </Typography>
            <Typography color="text.secondary">
              {t('seo.listings.subtitle')}
            </Typography>
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
              <Chip label={`${matchedCount}/${listings.length} ${t('seo.listings.match')}`} color="success" variant="outlined" />
              <Chip label={`${missingCount} ${t('seo.listings.missingListings')}`} color={missingCount ? 'warning' : 'default'} variant="outlined" />
              <Chip label={`${duplicateCount} ${t('seo.listings.duplicateFinder')}`} color={duplicateCount ? 'warning' : 'default'} variant="outlined" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                <Typography variant="caption" color="text.secondary">
                  {t('seo.listings.accuracyScore')}
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
                  {accuracy}%
                </Typography>
              </Box>
              <Box sx={{ flex: 1, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                <Typography variant="caption" color="text.secondary">
                  {t('seo.listings.status')}
                </Typography>
                <Chip label={t(`seo.listings.${badge.key}`)} color={badge.color} sx={{ mt: 0.5, fontWeight: 700 }} />
              </Box>
            </Stack>
            <Box sx={{ mt: 2, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
              <Typography variant="caption" color="text.secondary">
                {t('seo.listings.lastSync')}
              </Typography>
              <Typography fontWeight={700}>
                {lastSyncAt ? lastSyncAt.toLocaleString() : t('seo.listings.never')}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={2}>
              <Button
                variant="outlined"
                startIcon={syncing ? <CircularProgress size={16} /> : <SyncIcon />}
                onClick={handleSync}
                disabled={syncing}
                sx={{ textTransform: 'none' }}
              >
                {syncing ? t('seo.listings.syncing') : t('seo.listings.runSync')}
              </Button>
              <Button
                variant="contained"
                startIcon={<AutoFixHighIcon />}
                onClick={handleOneClickFix}
                sx={{ textTransform: 'none' }}
              >
                {t('seo.listings.oneClickFix')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 3, boxShadow: 6 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} mb={2}>
              <Typography variant="h6" fontWeight={700}>
                {t('seo.listings.masterRecord')}
              </Typography>
              {!editingMaster ? (
                <Button variant="outlined" size="small" onClick={handleEditMaster}>
                  {t('seo.listings.editMaster')}
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button variant="text" size="small" onClick={handleCancelMaster} disabled={savingMaster}>
                    {t('seo.listings.cancel')}
                  </Button>
                  <Button variant="contained" size="small" onClick={handleSaveMaster} disabled={savingMaster}>
                    {savingMaster ? t('seo.listings.saving') : t('seo.listings.saveMaster')}
                  </Button>
                </Stack>
              )}
            </Stack>
            <Grid container spacing={2}>
              {[
                { key: 'name', label: t('seo.listings.name'), value: masterRecord.name },
                { key: 'address', label: t('seo.listings.address'), value: masterRecord.address },
                { key: 'phone', label: t('seo.listings.phone'), value: masterRecord.phone }
              ].map((field) => (
                <Grid key={field.key} size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: alpha(theme.palette.primary.main, 0.04), height: '100%' }}>
                    <Typography variant="caption" color="text.secondary">{field.label}</Typography>
                    {!editingMaster ? (
                      <Typography fontWeight={700} sx={{ mt: 1 }}>{field.value || t('seo.listings.empty')}</Typography>
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={masterDraft[field.key as keyof NapRecord] || ''}
                        onChange={(event) =>
                          setMasterDraft((prev) => ({
                            ...prev,
                            [field.key]: event.target.value
                          }))
                        }
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                {t('seo.listings.consistencyMap')}
              </Typography>
              <Chip label={`${pendingFixes.length} ${t('seo.listings.issuesFound')}`} color={pendingFixes.length ? 'warning' : 'success'} />
            </Stack>
            <TableContainer sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: theme.palette.grey[50], fontWeight: 700 }}>{t('seo.listings.platform')}</TableCell>
                    <TableCell sx={{ backgroundColor: theme.palette.grey[50], fontWeight: 700 }}>{t('seo.listings.match')}</TableCell>
                    <TableCell sx={{ backgroundColor: theme.palette.grey[50], fontWeight: 700 }}>{t('seo.listings.name')}</TableCell>
                    <TableCell sx={{ backgroundColor: theme.palette.grey[50], fontWeight: 700 }}>{t('seo.listings.address')}</TableCell>
                    <TableCell sx={{ backgroundColor: theme.palette.grey[50], fontWeight: 700 }}>{t('seo.listings.phone')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listings.map((listing) => {
                    const live = listing.live;
                    const nameMatch = live?.name === masterRecord.name;
                    const addressMatch = live?.address === masterRecord.address;
                    const phoneMatch = live?.phone === masterRecord.phone;
                    const allMatch = !!live && nameMatch && addressMatch && phoneMatch;
                    const fixState = fixing[listing.id] || 'idle';

                    return (
                      <TableRow key={listing.id} sx={{ backgroundColor: !allMatch ? alpha(theme.palette.error.main, 0.04) : 'transparent' }}>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: alpha(theme.palette.primary.main, 0.14), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                              {listing.platform.charAt(0)}
                            </Box>
                            <Typography fontWeight={600}>{listing.platform}</Typography>
                          </Stack>
                          {fixState === 'updating' && (
                            <LinearProgress sx={{ mt: 1 }} />
                          )}
                        </TableCell>
                        <TableCell>
                          {allMatch ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                        </TableCell>
                        <TableCell sx={{ color: nameMatch ? 'text.primary' : 'error.main' }}>
                          {live ? diffHighlight(masterRecord.name, live.name, t('seo.listings.notFound')) : t('seo.listings.notFound')}
                        </TableCell>
                        <TableCell sx={{ color: addressMatch ? 'text.primary' : 'error.main' }}>
                          {live ? diffHighlight(masterRecord.address, live.address, t('seo.listings.notFound')) : t('seo.listings.notFound')}
                        </TableCell>
                        <TableCell sx={{ color: phoneMatch ? 'text.primary' : 'error.main' }}>
                          {live ? diffHighlight(masterRecord.phone, live.phone, t('seo.listings.notFound')) : t('seo.listings.notFound')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 3, boxShadow: 6 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t('seo.listings.missingListings')}
            </Typography>
            <Stack spacing={2}>
              {listings.filter((listing) => !listing.live).map((listing) => (
                <Box key={listing.id} sx={{ p: 2, borderRadius: 2, border: `1px dashed ${theme.palette.warning.main}`, backgroundColor: alpha(theme.palette.warning.main, 0.06) }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                      <Typography fontWeight={700}>{listing.platform}</Typography>
                      <Typography variant="body2" color="text.secondary">{t('seo.listings.missingDesc')}</Typography>
                    </Box>
                    <Button variant="outlined" size="small" endIcon={<LaunchIcon />} component="a" href={listing.createUrl} target="_blank" rel="noreferrer">
                      {t('seo.listings.createListing')}
                    </Button>
                  </Stack>
                </Box>
              ))}
              {!listings.some((listing) => !listing.live) && (
                <Typography color="text.secondary">{t('seo.listings.noMissing')}</Typography>
              )}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 3, boxShadow: 6 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t('seo.listings.duplicateFinder')}
            </Typography>
            <Stack spacing={2}>
              {listings.filter((listing) => (listing.duplicates || []).length > 0).map((listing) => (
                <Box key={listing.id} sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: alpha(theme.palette.warning.main, 0.04) }}>
                  <Typography fontWeight={700}>{listing.platform}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('seo.listings.duplicateDesc')}
                  </Typography>
                  <Button variant="text" size="small" endIcon={<LaunchIcon />} component="a" href={listing.editUrl} target="_blank" rel="noreferrer">
                    {t('seo.listings.requestMerge')}
                  </Button>
                </Box>
              ))}
              {!listings.some((listing) => (listing.duplicates || []).length > 0) && (
                <Typography color="text.secondary">{t('seo.listings.noDuplicates')}</Typography>
              )}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 6 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t('seo.listings.manualTasks')}
            </Typography>
            <Stack spacing={2}>
              {listings.filter((listing) => !listing.isApi && listing.live).map((listing) => {
                const live = listing.live as NapRecord;
                const needsFix = live.name !== masterRecord.name || live.address !== masterRecord.address || live.phone !== masterRecord.phone;

                return (
                  <Box key={listing.id} sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: needsFix ? alpha(theme.palette.warning.main, 0.08) : alpha(theme.palette.success.main, 0.04) }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                      <Box>
                        <Typography fontWeight={700}>{listing.platform}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {needsFix ? t('seo.listings.fixNeeded') : t('seo.listings.fixOk')}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" size="small" startIcon={<ContentCopyIcon />} onClick={handleCopyMaster}>
                          {t('seo.listings.copyInfo')}
                        </Button>
                        <Button variant="contained" size="small" endIcon={<LaunchIcon />} component="a" href={listing.editUrl} target="_blank" rel="noreferrer">
                          {t('seo.listings.manualFix')}
                        </Button>
                        {needsFix && (
                          <Button variant="text" size="small" onClick={() => handleManualFix(listing.id)}>
                            {t('seo.listings.markFixed')}
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 3, boxShadow: 6 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t('seo.listings.localInsights')}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, mb: 3 }}>
              {Array.from({ length: 25 }).map((_, idx) => {
                const strength = idx === 12 ? 4 : (idx % 5);

                const colors = [
                  theme.palette.error.light,
                  theme.palette.warning.light,
                  theme.palette.info.light,
                  theme.palette.success.light,
                  theme.palette.success.main
                ];

                return (
                  <Box
                    key={`grid-${idx}`}
                    sx={{
                      width: '100%',
                      paddingTop: '100%',
                      borderRadius: 1,
                      backgroundColor: colors[strength],
                      position: 'relative'
                    }}
                  />
                );
              })}
            </Box>
            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
              <Typography fontWeight={700}>
                {t('seo.listings.visibilityIncrease', { value: visibilityLift })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('seo.listings.visibilityHint')}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ListingsManager;
