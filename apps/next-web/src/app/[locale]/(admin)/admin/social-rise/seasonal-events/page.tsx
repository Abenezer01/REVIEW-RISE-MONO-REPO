/* eslint-disable import/no-unresolved */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Chip,
  Tooltip
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';

import { SystemMessageCode } from '@platform/contracts';

import { useTranslations } from 'next-intl';

import { useSystemMessages } from '@/shared/components/SystemMessageProvider';

import { BrandService } from '@/services/brand.service';
import { useBusinessId } from '@/hooks/useBusinessId';
import TableListing from '@/components/shared/listing/list-types/table-listing';
import ConfirmationDialog from '@/components/shared/dialog/confirmation-dialog';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number;[key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />;
};

const markets = ['Global', 'US', 'UK', 'EU', 'Asia', 'Northern Hemisphere', 'Southern Hemisphere'];

const SeasonalEventsPage = () => {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const { notify } = useSystemMessages();
  const { businessId } = useBusinessId();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    market: 'Global',
    description: ''
  });

  const fetchEvents = useCallback(async () => {
    if (!businessId) return;

    setLoading(true);

    try {
      const data = await BrandService.listPlannerEvents(businessId);

      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch events', error);
      notify(SystemMessageCode.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  }, [businessId, notify]);

  useEffect(() => {
    if (businessId) {
      fetchEvents();
    }
  }, [businessId, fetchEvents]);

  const handleOpen = useCallback((event?: any) => {
    if (event) {
      setEditingEvent(event);

      setFormData({
        name: event.name,
        date: new Date(event.date).toISOString().split('T')[0],
        market: event.market,
        description: event.description || ''
      });
    } else {
      setEditingEvent(null);

      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        market: 'Global',
        description: ''
      });
    }

    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);

    setEditingEvent(null);
  }, []);

  const handleSubmit = async () => {
    if (!businessId) return;

    try {
      if (editingEvent) {
        await BrandService.updatePlannerEvent(businessId, editingEvent.id, formData);
        notify(SystemMessageCode.ITEM_UPDATED);
      } else {
        await BrandService.createPlannerEvent(businessId, formData);
        notify(SystemMessageCode.ITEM_CREATED);
      }

      handleClose();

      fetchEvents();
    } catch (error) {
      console.error('Failed to save event', error);
      notify(SystemMessageCode.GENERIC_ERROR);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!businessId || !itemToDelete) return;

    try {
      await BrandService.deletePlannerEvent(businessId, itemToDelete);
      notify(SystemMessageCode.ITEM_DELETED);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event', error);
      notify(SystemMessageCode.GENERIC_ERROR);
    }
  };

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'name',
      headerName: t('seasonalEvents.eventName'),
      flex: 1,
      minWidth: 200
    },
    {
      field: 'date',
      headerName: t('seasonalEvents.date'),
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'market',
      headerName: t('seasonalEvents.market'),
      flex: 0.6,
      minWidth: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="tonal" color="primary" />
      )
    },
    {
      field: 'description',
      headerName: t('seasonalEvents.description'),
      flex: 2,
      minWidth: 300,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: tc('actions'),
      sortable: false,
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title={tc('common.edit')}>
            <IconButton onClick={() => handleOpen(params.row)} color="primary" size="small">
              <Icon icon="tabler-edit" fontSize={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title={tc('common.delete')}>
            <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
              <Icon icon="tabler-trash" fontSize={20} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [handleOpen, handleDelete, t, tc]);

  return (
    <Box sx={{ p: 6 }}>
      {/* Page Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={6}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            {t('seasonalEvents.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('seasonalEvents.subtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => handleOpen()}
          startIcon={<Icon icon="tabler-plus" fontSize={20} />}
          sx={{ px: 5, py: 2, borderRadius: 1.5 }}
        >
          {t('seasonalEvents.addEvent')}
        </Button>
      </Stack>

      {/* Listing */}
      <TableListing
        columns={columns}
        items={events}
        isLoading={loading}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
          {editingEvent ? t('seasonalEvents.editEvent') : t('seasonalEvents.addNewEvent')}
        </DialogTitle>
        <DialogContent sx={{ mt: 4 }}>
          <Stack spacing={4}>
            <TextField
              label={t('seasonalEvents.eventName')}
              fullWidth
              placeholder={t('seasonalEvents.eventNamePlaceholder')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
              <TextField
                label={t('seasonalEvents.date')}
                type="date"
                fullWidth
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select
                label={t('seasonalEvents.market')}
                fullWidth
                value={formData.market}
                onChange={(e) => setFormData({ ...formData, market: e.target.value })}
              >
                {markets.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TextField
              label={t('seasonalEvents.description')}
              fullWidth
              multiline
              rows={4}
              placeholder={t('seasonalEvents.descriptionPlaceholder')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 6, py: 4, borderTop: theme => `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleClose} color="inherit">{tc('common.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 1 }}>
            {editingEvent ? tc('common.save') : tc('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={deleteDialogOpen}
        handleClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        title={t('seasonalEvents.deleteTitle')}
        content={t('seasonalEvents.deleteConfirm')}
        type="delete"
      />
    </Box>
  );
};

export default SeasonalEventsPage;
