'use client';

import React from 'react';
import { Box, Typography, Button, Stack, useTheme, alpha, CircularProgress } from '@mui/material';
import { useTranslations } from 'next-intl';
import SyncIcon from '@mui/icons-material/Sync';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { useGbpPhotos, useSyncGbpPhotos, useUploadGbpPhoto } from '@/hooks/gbp/useGbpPhotos';
import { LocationPhotosGrid } from './LocationPhotosGrid';
import { Menu, MenuItem, ListItemIcon } from '@mui/material';
import { GbpPhotoCategory } from '@platform/contracts';
import { PHOTO_CATEGORIES } from './PhotosFilterToolbar';

interface LocationPhotosSectionProps {
    locationId: string;
}

const StatBox = ({ value, label, icon, color }: any) => {
    return (
        <Box
            sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2.5,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Box
                sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(color, 0.15),
                    color: color
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>{value}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
            </Box>
        </Box>
    );
};

export const LocationPhotosSection = ({ locationId }: LocationPhotosSectionProps) => {
    const t = useTranslations('gbpRocket.photos');
    const theme = useTheme();
    const { data: result } = useGbpPhotos(locationId);
    const { mutate: syncPhotos, isPending: isSyncing } = useSyncGbpPhotos();
    const { mutate: uploadPhoto, isPending: isUploading } = useUploadGbpPhoto();

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [uploadCategory, setUploadCategory] = React.useState<GbpPhotoCategory>(GbpPhotoCategory.COVER);

    const handleUploadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleSelectCategory = (category: GbpPhotoCategory) => {
        setUploadCategory(category);
        setAnchorEl(null);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            uploadPhoto({ locationId, file, category: uploadCategory });
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const stats = result?.meta?.stats || { total: 0, coverCount: 0, interiorCount: 0 };

    // Calculate last updated relative time
    const lastSyncedAt = result?.data?.[0]?.lastSyncedAt;

    const lastUpdatedLabel = lastSyncedAt
        ? new Date(lastSyncedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '--';

    const lastSyncedMinutesAgo = lastSyncedAt
        ? Math.floor((new Date().getTime() - new Date(lastSyncedAt).getTime()) / 60000)
        : 0;

    return (
        <Box sx={{ mt: 4 }}>
            {/* Header Area */}
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={700} mb={0.5}>{t('title')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('subtitle')}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={3} alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1.5, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                        <Typography variant="body2" color="success.main" fontWeight={500}>{t('connectedLocation')}</Typography>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
                        <SyncIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                        {t('lastSynced', { time: lastSyncedMinutesAgo })}
                    </Typography>

                    <Button
                        variant="outlined"
                        onClick={handleUploadClick}
                        disabled={isUploading}
                        startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadOutlinedIcon />}
                        sx={{ fontWeight: 600, px: 3, textTransform: 'none', borderRadius: 1.5, borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'text.primary', bgcolor: alpha(theme.palette.text.primary, 0.05) } }}
                    >
                        {isUploading ? t('uploading') : t('uploadPhoto')}
                    </Button>

                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={isSyncing ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                        onClick={() => syncPhotos(locationId)}
                        disabled={isSyncing}
                        sx={{ fontWeight: 600, px: 3, textTransform: 'none', borderRadius: 1.5 }}
                    >
                        {isSyncing ? t('syncing') : t('syncPhotos')}
                    </Button>
                </Stack>
            </Stack>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{ sx: { minWidth: 200, mt: 1, borderRadius: 2, boxShadow: theme.shadows[8], maxHeight: 400 } }}
            >
                {PHOTO_CATEGORIES.filter(cat => cat.value !== 'All').map((cat) => (
                    <MenuItem key={cat.value} onClick={() => handleSelectCategory(cat.value as GbpPhotoCategory)}>
                        <ListItemIcon><PhotoOutlinedIcon fontSize="small" /></ListItemIcon>
                        {t(`filter.${cat.labelKey}`)}
                    </MenuItem>
                ))}
            </Menu>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* Stats Row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mb={4}>
                <StatBox
                    value={stats.total.toLocaleString()}
                    label={t('stats.total')}
                    icon={<CollectionsOutlinedIcon fontSize="large" />}
                    color={theme.palette.info.main}
                />
                <StatBox
                    value={stats.coverCount.toLocaleString()}
                    label={t('stats.cover')}
                    icon={<PhotoOutlinedIcon fontSize="large" />}
                    color={theme.palette.secondary.main}
                />
                <StatBox
                    value={stats.interiorCount.toLocaleString()}
                    label={t('stats.interior')}
                    icon={<HomeOutlinedIcon fontSize="large" />}
                    color={theme.palette.success.main}
                />
                <StatBox
                    value={lastUpdatedLabel}
                    label={t('stats.lastUpdated')}
                    icon={<CalendarTodayOutlinedIcon fontSize="large" />}
                    color={theme.palette.warning.main}
                />
            </Stack>

            <LocationPhotosGrid locationId={locationId} />
        </Box>
    );
};
