/* eslint-disable import/no-unresolved */
'use client';

import Grid from '@mui/material/Grid';
import { useTranslations } from 'next-intl';

import {
  Palette as PaletteIcon,
  TextFields as FontIcon,
  Image as AssetsIcon,
  Share as SocialIcon,
} from '@mui/icons-material';

import MetricCard from '@/components/shared/analytics/MetricCard';
import type { BrandProfile } from '@/services/brand-profile.service';

interface ProfileMetricsProps {
  profile: BrandProfile;
}

export default function ProfileMetrics({ profile }: ProfileMetricsProps) {
  const t = useTranslations('BrandProfiles');

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title={t('metrics.colors')}
          value={profile.colors?.length || 0}
          icon={<PaletteIcon sx={{ color: 'primary.main' }} />}
          color="primary"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title={t('metrics.fonts')}
          value={profile.fonts?.length || 0}
          icon={<FontIcon sx={{ color: 'info.main' }} />}
          color="info"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title={t('metrics.assets')}
          value={profile.assets?.length || 0}
          icon={<AssetsIcon sx={{ color: 'success.main' }} />}
          color="success"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title={t('metrics.social')}
          value={profile.socialLinks?.length || 0}
          icon={<SocialIcon sx={{ color: 'warning.main' }} />}
          color="warning"
        />
      </Grid>
    </Grid>
  );
}
