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
import toast from 'react-hot-toast';

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
  const { id, locale } = use(params);
  const router = useRouter();
  const theme = useTheme();
  const t = useTranslations('BrandProfiles'); // Ensure you have translations or use fallback

  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      toast.success('Brand profile updated');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update brand profile');
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
      if (!silent) toast.error('Failed to load brand profile');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id, fetchProfile]);

  // Polling for extraction status
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (profile?.status === 'extracting' || profile?.status === 'pending') {
      intervalId = setInterval(async () => {
        const updatedProfile = await fetchProfile(true);

        if (updatedProfile && updatedProfile.status !== 'extracting' && updatedProfile.status !== 'pending') {
          clearInterval(intervalId);
          toast.success(`Extraction ${updatedProfile.status}`);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [profile?.status, id, fetchProfile]);

  const handleReExtract = async () => {
    if (!profile) return;
    setIsReExtracting(true);

    try {
      await BrandProfileService.reExtractBrandProfile(id);
      toast.success('Re-extraction started');
      fetchProfile(true); // Refresh to show extracting status
    } catch (err) {
      console.log(err)
      toast.error('Failed to start re-extraction');
    } finally {
      setIsReExtracting(false);
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);

    try {
      await BrandProfileService.confirmExtraction(id);
      toast.success('Extraction confirmed');
      fetchProfile(); // Full refresh to show updated relations
    } catch (err) {
      toast.error('Failed to confirm extraction');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await BrandProfileService.deleteBrandProfile(id);
      toast.success('Brand profile deleted');
      router.push(`/${locale}/admin/profiles`);
    } catch (err) {
      toast.error('Failed to delete brand profile');
      setIsDeleting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleCopyAllColors = () => {
    if (!profile?.colors) return;
    const allColors = profile.colors.map(c => `${c.type}: ${c.hexCode}`).join('\n');

    navigator.clipboard.writeText(allColors);
    toast.success('All colors copied to clipboard');
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
        <Typography variant="h5" color="error">Profile not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mt: 2 }}>
          Back to List
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
          />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Brand Profile</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this brand profile? This action will permanently remove all extracted data and assets. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting} sx={{ borderRadius: 2 }}>
            Cancel
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
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
