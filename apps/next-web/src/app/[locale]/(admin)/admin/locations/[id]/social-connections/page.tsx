import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { SocialConnectionList } from './SocialConnectionList.client';

// Metadata? 
// import type { Metadata } from 'next';
// export const metadata: Metadata = { title: 'Social Connections' };

export default function SocialConnectionsPage() {
    const t = useTranslations('social');

    return (
        <Box>
            <Box mb={3}>
                <Typography variant="h4">{t('connections.title')}</Typography>
                <Typography color="textSecondary">
                    {t('connections.subtitle')}
                </Typography>
            </Box>
            <SocialConnectionList />
        </Box>
    );
}
