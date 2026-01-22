import { useParams } from 'next/navigation';

import Typography from '@mui/material/Typography';

import { SocialConnectionList as SocialConnectionListView } from '@/components/admin/locations/social/SocialConnectionList';
import { useTranslation } from '@/hooks/useTranslation';
import { useBusinessId } from '@/hooks/useBusinessId';

export const SocialConnectionList = () => {
  const { id } = useParams();
  const t = useTranslation('dashboard');
  const { businessId } = useBusinessId();



  if (!businessId || !id) {
    return (
      <Typography color="textSecondary">
        {t('locations.detail.notFound')}
      </Typography>
    );
  }

  return <SocialConnectionListView businessId={businessId} locationId={id as string} />;
};
