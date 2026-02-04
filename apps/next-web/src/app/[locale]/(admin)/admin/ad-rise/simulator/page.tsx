import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { useTranslations } from 'next-intl';

import { CampaignSimulator } from '@/components/ad-rise/simulator/CampaignSimulator';

export default function SimulatorPage() {
    const t = useTranslations('simulator');

    return (
        <Box sx={{ height: 'calc(100vh - 84px)', display: 'flex', flexDirection: 'column', p: 3 }}>
            <Box mb={3}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                    <Link underline="hover" color="inherit" href="/admin/dashboard">
                        {t('breadcrumb.admin')}
                    </Link>
                    <Link underline="hover" color="inherit" href="/admin/ad-rise">
                        {t('breadcrumb.ad_rise')}
                    </Link>
                    <Typography color="text.primary">{t('breadcrumb.simulator')}</Typography>
                </Breadcrumbs>
                <Typography variant="h4" fontWeight="bold">
                    {t('title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('description')}
                </Typography>
            </Box>

            <CampaignSimulator />
        </Box>
    );
}
