/* eslint-disable import/no-unresolved */
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

import {
    Box,
    Typography,
    CircularProgress,
    Chip,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    TextField,
    InputAdornment,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Language as WebIcon
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import type { GridColDef } from '@mui/x-data-grid';

import type { BusinessDto } from '@platform/contracts';
import { formatDynamicDate } from '@platform/utils';

import { BrandProfileService } from '@/services/brand-profile.service';
import apiClient from '@/lib/apiClient';
import { ListingProvider, ListingContent } from '@/components/shared/listing/listing';

interface BrandProfilesListProps {
    refreshTrigger?: number;
}

const BrandProfilesList = ({ refreshTrigger = 0 }: BrandProfilesListProps) => {
    const t = useTranslations('BrandProfiles');
    const theme = useTheme();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [businesses, setBusinesses] = useState<BusinessDto[]>([]);
    const [businessFilter, setBusinessFilter] = useState<string>('');

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
    const [reExtractingId, setReExtractingId] = useState<string | null>(null);

    const fetchProfiles = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await BrandProfileService.getAllBrandProfiles({
                page: page + 1,
                limit: rowsPerPage,
                search: search || undefined,
                status: statusFilter || undefined,
                businessId: businessFilter || undefined,
            });

            setProfiles(result.data);
            setTotalCount(result.pagination.total);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch brand profiles.');
            setProfiles([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, rowsPerPage, search, statusFilter, businessFilter]);

    const fetchBusinesses = async () => {
        try {
            const response = await apiClient.get<{ data: BusinessDto[] }>('/api/admin/businesses', {
                params: { limit: 100 },
            });

            setBusinesses(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch businesses:', err);
        }
    };

    useEffect(() => {
        fetchBusinesses();
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles, refreshTrigger]);

    const handleReExtract = useCallback(async (id: string) => {
        setReExtractingId(id);

        try {
            await apiClient.post(`/api/brands/${id}/re-extract`);
            fetchProfiles();
        } catch (err: any) {
            setError(err.message || 'Failed to re-extract brand profile.');
        } finally {
            setReExtractingId(null);
        }
    }, [fetchProfiles]);

    const handleDeleteClick = useCallback((id: string) => {
        setProfileToDelete(id);
        setDeleteModalOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!profileToDelete) return;

        try {
            await BrandProfileService.deleteBrandProfile(profileToDelete);
            fetchProfiles();
            setDeleteModalOpen(false);
            setProfileToDelete(null);
        } catch (err: any) {
            setError(err.message || 'Failed to delete brand profile.');
        }
    }, [profileToDelete, fetchProfiles]);

    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'extracting': return 'info';
            case 'pending_confirmation': return 'warning';
            case 'failed': return 'error';
            default: return 'default';
        }
    }, []);

    const getStatusLabel = useCallback((status: string) => {
        return t(`status.${status}` as any) || status;
    }, [t]);

    const columns = useMemo<GridColDef[]>(() => [
        {
            field: 'business',
            headerName: t('list.columns.business'),
            flex: 1.5,
            renderCell: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                        display: 'flex'
                    }}>
                        <FilterIcon fontSize="small" />
                    </Box>
                    <Typography variant="body2" fontWeight="700">
                        {params.row.business?.name || 'N/A'}
                    </Typography>
                </Stack>
            )
        },
        {
            field: 'title',
            headerName: t('list.columns.title') || 'Brand Title',
            flex: 1.5,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="500">
                    {params.value || params.row.currentExtractedData?.title || '-'}
                </Typography>
            )
        },
        {
            field: 'websiteUrl',
            headerName: t('list.columns.websiteUrl'),
            flex: 2,
            renderCell: (params) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <WebIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    <Typography
                        variant="body2"
                        component="a"
                        href={params.value}
                        target="_blank"
                        sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        {params.value}
                    </Typography>
                </Stack>
            )
        },
        {
            field: 'status',
            headerName: t('list.columns.status'),
            width: 180,
            renderCell: (params) => (
                <Chip
                    label={getStatusLabel(params.value)}
                    color={getStatusColor(params.value) as any}
                    size="small"
                    variant="tonal"
                    sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}
                />
            )
        },
        {
            field: 'createdAt',
            headerName: t('list.columns.createdAt'),
            width: 180,
            renderCell: (params) => (
                <Typography variant="caption" color="text.secondary">
                    {formatDynamicDate(params.value, 'MMM DD, YYYY HH:mm')}
                </Typography>
            )
        },
        {
            field: 'actions',
            headerName: '',
            width: 150,
            align: 'right',
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title={t('list.actions.view')}>
                        <IconButton
                            size="small"
                            href={`/admin/profiles/${params.row.id}`}
                            sx={{ color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) } }}
                        >
                            <ViewIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('list.actions.reExtract')}>
                        <IconButton
                            size="small"
                            onClick={() => handleReExtract(params.row.id)}
                            disabled={reExtractingId === params.row.id}
                            sx={{ color: 'info.main', '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.08) } }}
                        >
                            {reExtractingId === params.row.id ? <CircularProgress size={20} /> : <RefreshIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('list.actions.delete')}>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(params.row.id)}
                            sx={{ '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) } }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ], [theme, t, reExtractingId, getStatusLabel, handleReExtract, handleDeleteClick, getStatusColor]);

    return (
        <Box sx={{ p: 0 }}>
            {/* Filter Bar */}
            <Box sx={{
                p: 3,
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                bgcolor: alpha(theme.palette.background.default, 0.5)
            }}>
                <TextField
                    placeholder={t('list.searchLabel')}
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(0);
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        minWidth: 300,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper'
                        }
                    }}
                />

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="business-filter-label">{t('list.businessFilterLabel')}</InputLabel>
                    <Select
                        labelId="business-filter-label"
                        value={businessFilter}
                        label={t('list.businessFilterLabel')}
                        onChange={(e) => {
                            setBusinessFilter(e.target.value);
                            setPage(0);
                        }}
                        sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
                    >
                        <MenuItem value="">
                            <em>{t('list.allBusinesses')}</em>
                        </MenuItem>
                        {businesses.map((business) => (
                            <MenuItem key={business.id} value={business.id}>
                                {business.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="status-filter-label">{t('list.statusFilterLabel')}</InputLabel>
                    <Select
                        labelId="status-filter-label"
                        value={statusFilter}
                        label={t('list.statusFilterLabel')}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(0);
                        }}
                        sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
                    >
                        <MenuItem value="">
                            <em>{t('list.allStatuses')}</em>
                        </MenuItem>
                        <MenuItem value="extracting">{getStatusLabel('extracting')}</MenuItem>
                        <MenuItem value="pending_confirmation">{getStatusLabel('pending_confirmation')}</MenuItem>
                        <MenuItem value="completed">{getStatusLabel('completed')}</MenuItem>
                        <MenuItem value="failed">{getStatusLabel('failed')}</MenuItem>
                    </Select>
                </FormControl>

                <Tooltip title="Refresh Data">
                    <IconButton
                        onClick={fetchProfiles}
                        color="primary"
                        sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                        }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {error && (
                <Box sx={{ px: 3, py: 1.5, bgcolor: alpha(theme.palette.error.main, 0.05), borderBottom: 1, borderColor: alpha(theme.palette.error.main, 0.1) }}>
                    <Typography color="error" variant="caption" fontWeight="700">
                        {error}
                    </Typography>
                </Box>
            )}

            <ListingProvider
                items={profiles}
                isLoading={isLoading}
                error={error ? new Error(error) : null}
                initialLayout="table"
                tableColumns={columns}
                onRetry={fetchProfiles}
                pagination={{
            total: totalCount,
            pageSize: rowsPerPage,
            page: page + 1,
            lastPage: Math.ceil(totalCount / rowsPerPage)
          }}
                onPageChange={(newPage) => setPage(newPage - 1)}
                onPageSizeChange={(newSize) => {
                    setRowsPerPage(newSize);
                    setPage(0);
                }}
            >
                <ListingContent />
            </ListingProvider>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {t('list.deleteConfirmTitle') || 'Confirm Delete'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('list.deleteConfirm') || 'Are you sure you want to delete this brand profile? This action cannot be undone.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setDeleteModalOpen(false)}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        disableElevation
                        sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BrandProfilesList;
