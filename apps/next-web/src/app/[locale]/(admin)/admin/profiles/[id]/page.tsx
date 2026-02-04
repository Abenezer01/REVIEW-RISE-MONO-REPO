/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

import { useEffect, useState, use, useCallback } from 'react';

import { useRouter } from 'next/navigation';

import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Container,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';

import { SystemMessageCode } from '@platform/contracts';

import { useSystemMessages } from '@/shared/components/SystemMessageProvider';

import { BrandProfileService } from '@/services/brand-profile.service';
import type { BrandProfile } from '@/services/brand-profile.service';

// Components
import ProfileHeader from './_components/ProfileHeader';
import ProfileMetrics from './_components/ProfileMetrics';
import ProfileTabs from './_components/ProfileTabs';

const fadeIn = {
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  animation: 'fadeIn 0.5s ease-out forwards',
};

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function BrandProfileDetailsPage({ params }: PageProps) {
  const { notify } = useSystemMessages();
  const { id, locale } = use(params);
  const router = useRouter();
  const theme = useTheme();
  const t = useTranslations('BrandProfiles'); // Ensure you have translations or use fallback

  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isReExtracting, setIsReExtracting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [isConfirming, setIsConfirming] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleUpdateProfile = async (data: any) => {
    setIsUpdating(true);

    try {
      const updated = await BrandProfileService.updateBrandProfile(id, data);

      setProfile(updated);
      notify(SystemMessageCode.BRAND_PROFILE_UPDATED);
      fetchLogs(); // Refresh history
    } catch (error) {
      console.error('Update failed:', error);
      notify(SystemMessageCode.GENERIC_ERROR);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchProfile = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);

    try {
      const data = await BrandProfileService.getBrandProfile(id);

      setProfile(data);

      return data;
    } catch (err) {
      console.log(err)
      if (!silent) notify(SystemMessageCode.GENERIC_ERROR);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [id, notify]);

  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);

    try {
      const logs = await BrandProfileService.getAuditLogs(id);
      
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchLogs();
    }
  }, [id, fetchProfile, fetchLogs]);

  // Polling for extraction status
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (profile?.status === 'extracting' || profile?.status === 'pending') {
      intervalId = setInterval(async () => {
        const updatedProfile = await fetchProfile(true);

        if (updatedProfile && updatedProfile.status !== 'extracting' && updatedProfile.status !== 'pending') {
          clearInterval(intervalId);
          notify(SystemMessageCode.SUCCESS);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [profile?.status, id, fetchProfile, notify]);

  const handleReExtract = async () => {
    if (!profile) return;
    setIsReExtracting(true);

    try {
      await BrandProfileService.reExtractBrandProfile(id);
      notify(SystemMessageCode.SUCCESS);
      fetchProfile(true); // Refresh to show extracting status
    } catch (err) {
      console.log(err)
      notify(SystemMessageCode.GENERIC_ERROR);
    } finally {
      setIsReExtracting(false);
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);

    try {
      await BrandProfileService.confirmExtraction(id);
      notify(SystemMessageCode.SUCCESS);
      fetchProfile(); // Full refresh to show updated relations
      fetchLogs(); // Refresh history
    } catch (err) {
      notify(SystemMessageCode.GENERIC_ERROR);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await BrandProfileService.deleteBrandProfile(id);
      notify(SystemMessageCode.BRAND_PROFILE_DELETED);
      router.push(`/${locale}/admin/profiles`);
    } catch (err) {
      notify(SystemMessageCode.GENERIC_ERROR);
      setIsDeleting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    notify(SystemMessageCode.COPIED_TO_CLIPBOARD);
  };

  const handleCopyAllColors = () => {
    if (!profile?.colors) return;
    const allColors = profile.colors.map(c => `${c.type}: ${c.hexCode}`).join('\n');

    navigator.clipboard.writeText(allColors);
    notify(SystemMessageCode.COPIED_TO_CLIPBOARD);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" color="error">{t('detail.notFound')}</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mt: 2 }}>
          {t('detail.backToList')}
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, ...fadeIn }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 5,
          borderRadius: 5,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.05)}`,
        }}
      >
        {/* Background Decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            zIndex: 0,
            filter: 'blur(40px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: '10%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.secondary.main, 0.02),
            zIndex: 0,
            filter: 'blur(30px)',
          }}
        />

        <ProfileHeader
          profile={profile}
          t={t}
          isConfirming={isConfirming}
          isReExtracting={isReExtracting}
          onBack={() => router.back()}
          onConfirm={handleConfirm}
          onReExtract={handleReExtract}
          onDelete={() => setDeleteDialogOpen(true)}
        />

        <Box sx={{ mt: 4 }}>
          <ProfileMetrics profile={profile} />
        </Box>
      </Paper>

      <ProfileTabs
            profile={profile}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onCopy={handleCopy}
            onCopyAllColors={handleCopyAllColors}
            onUpdateProfile={handleUpdateProfile}
            isUpdating={isUpdating}
            auditLogs={auditLogs}
            isLoadingLogs={isLoadingLogs}
          />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>{t('detail.deleteTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('detail.deleteConfirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting} sx={{ borderRadius: 2 }}>
            {t('detail.cancel') || 'Cancel'}
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disableElevation
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {isDeleting ? t('detail.deleting') : t('detail.deletePermanently')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
