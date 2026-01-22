'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';
import apiClient from '@/lib/apiClient';
import { SERVICES } from '@/configs/services';

export default function LinkedInCallbackPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const error = searchParams.get('error');
            const errorDesc = searchParams.get('error_description');

            if (error) {
                setStatus('error');
                setErrorMessage(errorDesc || 'LinkedIn declined the authorization.');
                return;
            }

            if (!code || !state) {
                setStatus('error');
                setErrorMessage('Missing code or state parameter.');
                return;
            }

            try {
                // Exchange code for token via backend
                const res = await apiClient.post(`${SERVICES.social.url}/linkedin/callback`, {
                    code,
                    state
                });

                // Post message to opener
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'LINKEDIN_AUTH_SUCCESS',
                        accessToken: res.data.accessToken,
                        refreshToken: res.data.refreshToken,
                        expiresIn: res.data.expiresIn
                    }, window.location.origin);

                    setStatus('success');
                    setTimeout(() => window.close(), 1500);
                } else {
                    setStatus('error');
                    setErrorMessage('Window opener not found.');
                }

            } catch (err: any) {
                console.error('Callback error:', err);
                setStatus('error');
                setErrorMessage(err.response?.data?.message || 'Failed to exchange token.');
            }
        };

        processCallback();
    }, [searchParams]);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" p={4}>
            {status === 'loading' && (
                <>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" sx={{ mt: 3 }}>
                        Connecting to LinkedIn...
                    </Typography>
                </>
            )}
            {status === 'success' && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    LinkedIn connected successfully! Closing window...
                </Alert>
            )}
            {status === 'error' && (
                <Box textAlign="center">
                    <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                        {errorMessage || 'Authentication failed'}
                    </Alert>
                    <Typography variant="body2" onClick={() => window.close()} sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        Close Window
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
