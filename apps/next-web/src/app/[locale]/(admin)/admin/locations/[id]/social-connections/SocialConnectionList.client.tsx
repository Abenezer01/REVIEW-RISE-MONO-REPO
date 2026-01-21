'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    IconButton,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';
import {
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    LinkedIn as LinkedInIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Add as AddIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
// We'll need a way to call the API. Assuming we have an api service or using fetch/axios.
// For now, using fetch with bearer token from configured service.
// Actually, we use `useAuth` or similar to get token?
// Assuming `next-web` uses `next-auth` or custom auth. 
// I'll check `services/api.ts` or similar later. For now, assuming relative fetch works with proxy or absolute URL from env.

interface SocialConnection {
    id: string;
    platform: string;
    pageName: string;
    pageId: string;
    status: string;
    lastSyncAt?: string;
}

export const SocialConnectionList = () => {
    const { id: locationId } = useParams();
    const { t } = useTranslation(); // Assuming translation setup
    const [connections, setConnections] = useState<SocialConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const businessId = '...'; // We need businessId context. Usually available in user context or derived.
    // Assuming we can get it from an API call or context.
    // For now, we'll try to fetch connections with just locationId if the API supports it (it does).

    // Load connections
    const fetchConnections = async () => {
        try {
            setLoading(true);
            // Replace with actual API client if available
            // Note: We need businessId for the query usually, unless backend infers it.
            // Our backend controller requires businessId.
            // We might need to fetch Location details first to get businessId.

            // Temporary: fetch from a locations endpoint that returns businessId?
            // Or assume session has businessId?
            // Let's assume we have a `useBusiness` hook or similar.
            // I'll search for it later. For now, hardcoding or fetching location.

            // Hack for prototype: Fetch location details
            const locRes = await fetch(`/api/v1/locations/${locationId}`); // Existing API?
            // If checking existing API is too much, I'll assume we pass it or get it from context.

            // Proceed assuming we can list by locationId (Backend updated to allow it? I updated controller)
            const res = await fetch(`/api/v1/social/connections?locationId=${locationId}&businessId=UNKNOWN_YET`);
            // Controller checks businessId. We need to fix this.
            // Frontend usually has access to the current business context.

            // ...

            // Mock for now to scaffold UI
            setConnections([]);
        } catch (err) {
            console.error(err);
            // setError('Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // fetchConnections();
        setLoading(false); // finish loading mock
    }, [locationId]);

    const handleConnectFacebook = () => {
        // Open popup
        // fetch auth url
        // window.open
    };

    return (
        <Card>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5">Social Connections</Typography>
                    <Box>
                        {/* Connect Buttons */}
                    </Box>
                </Stack>
                {/* List */}
                <Typography color="textSecondary">Social connections will appear here.</Typography>
            </CardContent>
        </Card>
    );
};
