import { Box, Typography } from '@mui/material';

import { SocialConnectionList } from './SocialConnectionList.client';

// Metadata? 
// import type { Metadata } from 'next';
// export const metadata: Metadata = { title: 'Social Connections' };

export default function SocialConnectionsPage() {
    return (
        <Box>
            <Box mb={3}>
                <Typography variant="h4">Social Integrations</Typography>
                <Typography color="textSecondary">
                    Connect your social media accounts to sync posts and reviews.
                </Typography>
            </Box>
            <SocialConnectionList />
        </Box>
    );
}
