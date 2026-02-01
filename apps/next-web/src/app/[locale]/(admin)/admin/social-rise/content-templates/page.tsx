/* eslint-disable import/no-unresolved */
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

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
  Tooltip,
  Grid
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';

import { useSystemMessages } from '@/shared/components/SystemMessageProvider';
import { SystemMessageCode } from '@platform/contracts';

import { BrandService } from '@/services/brand.service';
import { useBusinessId } from '@/hooks/useBusinessId';
import TableListing from '@/components/shared/listing/list-types/table-listing';
import ConfirmationDialog from '@/components/shared/dialog/confirmation-dialog';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />;
};

const ContentTemplatesPage = () => {
  const { notify } = useSystemMessages();
  const { businessId } = useBusinessId();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    industry: '',
    contentType: 'image',
    content: '',
    objective: 'Engagement'
  });

  const industries = ['Local Restaurant', 'Salon', 'Agency', 'Real Estate'];
  const contentTypes = ['image', 'video', 'carousel', 'text'];

  const fetchTemplates = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    
    try {
      const data = await BrandService.listPlannerTemplates(businessId);

      setTemplates(data || []); 
    } catch (error) {
      console.error('Failed to fetch templates', error);
      notify(SystemMessageCode.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchTemplates();
    }
  }, [businessId, fetchTemplates]);

  const handleOpen = useCallback((template?: any) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        title: template.title,
        industry: template.industry,
        contentType: template.contentType,
        content: template.content,
        objective: template.objective || 'Engagement'
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        title: '',
        industry: industries[0],
        contentType: 'image',
        content: '',
        objective: 'Engagement'
      });
    }

    setOpen(true);
  }, [industries]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditingTemplate(null);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!businessId || !itemToDelete) return;

    try {
      await BrandService.deletePlannerTemplate(businessId, itemToDelete);
      notify(SystemMessageCode.ITEM_DELETED);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to delete template', error);
      notify(SystemMessageCode.GENERIC_ERROR);
    }
  };

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'industry',
      headerName: 'Industry',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          variant="tonal" 
          color="primary"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'contentType',
      headerName: 'Type',
      flex: 0.6,
      minWidth: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          variant="outlined" 
          size="small" 
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'content',
      headerName: 'Content Preview',
      flex: 2,
      minWidth: 300,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            color: 'text.secondary',
            lineHeight: '70px'
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleOpen(params.row)} color="primary" size="small">
              <Icon icon="tabler-edit" fontSize={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
              <Icon icon="tabler-trash" fontSize={20} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [handleOpen, handleDelete]);

  const handleSubmit = async () => {
    if (!businessId) return;
    
    try {
      if (editingTemplate) {
        await BrandService.updatePlannerTemplate(businessId, editingTemplate.id, formData);
        notify(SystemMessageCode.ITEM_UPDATED);
      } else {
        await BrandService.createPlannerTemplate(businessId, formData);
        notify(SystemMessageCode.ITEM_CREATED);
      }
      
      handleClose();
      fetchTemplates();
    } catch (error) {
      console.error('Failed to save template', error);
      notify(SystemMessageCode.GENERIC_ERROR);
    }
  };

  return (
    <Box sx={{ p: 6 }}>
      {/* Page Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={6}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            Content Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and customize your brand&apos;s AI-powered content generation templates.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          onClick={() => handleOpen()} 
          startIcon={<Icon icon="tabler-plus" fontSize={20} />}
          sx={{ px: 5, py: 2, borderRadius: 1.5 }}
        >
          Add Template
        </Button>
      </Stack>

      {/* Listing */}
      <TableListing
        columns={columns}
        items={templates}
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
          {editingTemplate ? 'Edit Content Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent sx={{ mt: 4 }}>
          <Stack spacing={4}>
            <TextField
              label="Template Title"
              fullWidth
              placeholder="e.g., Weekly Special Highlight"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            
            <Grid container spacing={4}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  label="Industry"
                  fullWidth
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  {industries.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  label="Content Type"
                  fullWidth
                  value={formData.contentType}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                >
                  {contentTypes.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Content Structure"
              fullWidth
              multiline
              rows={6}
              placeholder="Describe how the content should be structured..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              helperText="Tip: Use [Placeholders] for dynamic content like [Business Name] or [Offer]."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.title || !formData.content}
          >
            {editingTemplate ? 'Save Changes' : 'Create Template'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={deleteDialogOpen}
        handleClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        title="Delete Content Template"
        content="Are you sure you want to delete this content template? This action cannot be undone."
        type="delete"
      />
    </Box>
  );
};

export default ContentTemplatesPage;
