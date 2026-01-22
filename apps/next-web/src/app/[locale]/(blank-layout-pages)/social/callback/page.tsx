'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';
import apiClient from '@/lib/apiClient';
import { SERVICES } from '@/configs/services';

const SocialCallbackPage = () => {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        // Identify provider from state or URL path? 
        // State is base64 encoded JSON: { businessId, locationId }
        // We don't strictly know if it is FB or LinkedIn just from params unless we deduce from state format or try both.
        // A better way is to different routes: /social/callback/facebook, /social/callback/linkedin
        // BUT the backend service defines the redirect URI.
        // Let's assume this page handles BOTH if we can distinguish, 
        // OR we make 2 pages. 
        // Facebook adds `?code=...`
        // LinkedIn adds `?code=...`

        // Let's rely on a 'provider' query param if we set it in the auth-url? 
        // We can't easily add query params to the redirect URI without registering them fastidiously in some providers.
        // So separate pages are safer: /social/callback/facebook

        // Wait, I will just make this a generic handler if possible, otherwise I'll move it.
        // For now, let's look at the `state`.
        // If I can't determine provider, I might default to one or try to guess.
        // Actually, let's create two separate folders to be clean: 
        // /social/callback/facebook/page.tsx
        // /social/callback/linkedin/page.tsx
        // /social/callback/instagram/page.tsx (usually same as FB)

    }, [searchParams]);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" p={4}>
            {status === 'loading' && (
                <>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" sx={{ mt: 3 }}>
                        Finalizing connection...
                    </Typography>
                </>
            )}
            {status === 'success' && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Connection successful! You can close this window.
                </Alert>
            )}
            {status === 'error' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMessage || 'Authentication failed'}
                </Alert>
            )}
        </Box>
    );
};

export default SocialCallbackPage;
