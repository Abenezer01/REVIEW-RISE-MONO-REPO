'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    ListItemAvatar,
    Avatar
} from '@mui/material';
import {
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    LinkedIn as LinkedInIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Add as AddIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Link as LinkIcon
} from '@mui/icons-material';
import apiClient from '@/lib/apiClient';
import { SERVICES } from '@/configs/services';

interface SocialConnection {
    id: string;
    platform: string;
    pageName: string;
    pageId: string;
    status: string;
    lastSyncAt?: string;
    errorMessage?: string;
}

interface FacebookPage {
    id: string;
    name: string;
    access_token: string;
    category: string;
    tasks: string[];
}

interface LinkedInOrg {
    id: string;
    localizedName: string;
    vanityName: string;
    logoUrl?: string;
}

interface Props {
    businessId: string;
    locationId: string;
}

export const SocialConnectionList = ({ businessId, locationId }: Props) => {
    // const { t } = useTranslation(); 
    const t = (key: string) => key; // Mock translation for now

    const [connections, setConnections] = useState<SocialConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Auth Flow State
    const [fbPages, setFbPages] = useState<FacebookPage[]>([]);
    const [liOrgs, setLiOrgs] = useState<LinkedInOrg[]>([]);
    const [showFbModal, setShowFbModal] = useState(false);
    const [showLiModal, setShowLiModal] = useState(false);
    const [tempToken, setTempToken] = useState<string | null>(null); // To store User Token during selection
    const [tempTokenData, setTempTokenData] = useState<any>(null); // For LinkedIn complex token data response

    // Load connections
    const fetchConnections = useCallback(async () => {
        try {
            setLoading(true);
            setLoading(true);
            const res = await apiClient.get(`${SERVICES.social.url}/connections`, {
                params: { businessId, locationId }
            });
            setConnections(res.data.connections);
        } catch (err: any) {
            console.error(err);
            // Ignore error or show? 
        } finally {
            setLoading(false);
        }
    }, [businessId, locationId]);

    useEffect(() => {
        if (businessId && locationId) {
            fetchConnections();
        }
    }, [fetchConnections, businessId, locationId]);

    // Cleanup message listener
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            // Validate origin if possible, but for now allow * as implemented in controller

            if (event.data?.type === 'FACEBOOK_AUTH_SUCCESS') {
                const { accessToken, state } = event.data;
                // Verify state matches businessId/locationId context?
                // For now, proceed.
                setTempToken(accessToken);

                // Fetch Pages
                try {
                    const res = await apiClient.get(`${SERVICES.social.url}/facebook/pages`, {
                        headers: { 'x-fb-access-token': accessToken }
                    });
                    setFbPages(res.data.pages);
                    setShowFbModal(true);
                } catch (err) {
                    console.error('Failed to list pages', err);
                    alert('Failed to list Facebook pages');
                }
            } else if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS') {
                // { accessToken, expiresIn, refreshToken, state }
                const tokenData = {
                    access_token: event.data.accessToken,
                    expires_in: event.data.expiresIn,
                    refresh_token: event.data.refreshToken
                };
                setTempToken(event.data.accessToken);
                setTempTokenData(tokenData);

                // Fetch Orgs
                try {
                    const res = await apiClient.get(`${SERVICES.social.url}/linkedin/organizations`, {
                        headers: { 'x-li-access-token': event.data.accessToken }
                    });
                    setLiOrgs(res.data.organizations);
                    setShowLiModal(true);
                } catch (err) {
                    console.error('Failed to list orgs', err);
                    alert('Failed to list LinkedIn organizations');
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [businessId, locationId]);

    const startFacebookConnect = async () => {
        try {
            const res = await apiClient.get(`${SERVICES.social.url}/facebook/auth-url`, {
                params: { businessId, locationId }
            });
            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;
            window.open(res.data.url, 'FacebookAuth', `width=${width},height=${height},left=${left},top=${top}`);
        } catch (err) {
            console.error(err);
        }
    };

    const startLinkedInConnect = async () => {
        try {
            const res = await apiClient.get(`${SERVICES.social.url}/linkedin/auth-url`, {
                params: { businessId, locationId }
            });
            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;
            window.open(res.data.url, 'LinkedInAuth', `width=${width},height=${height},left=${left},top=${top}`);
        } catch (err) {
            console.error(err);
        }
    };

    const confirmFacebookPage = async (page: FacebookPage) => {
        try {
            await apiClient.post(`${SERVICES.social.url}/facebook/connect`, {
                businessId,
                locationId,
                page,
                userAccessToken: tempToken
            });
            setShowFbModal(false);
            setTempToken(null);
            fetchConnections();

            // Check for Instagram?
            // Optionally ask user if they want to connect associated IG account
            // We can check if `instagram_business_account` exists on the page
            // But simple flow for now.
        } catch (err) {
            console.error(err);
            alert('Failed to connect page');
        }
    };

    const confirmLinkedInOrg = async (org: LinkedInOrg) => {
        try {
            await apiClient.post(`${SERVICES.social.url}/linkedin/connect`, {
                businessId,
                locationId,
                organization: org,
                tokenData: tempTokenData
            });
            setShowLiModal(false);
            setTempToken(null);
            setTempTokenData(null);
            fetchConnections();
        } catch (err) {
            console.error(err);
            alert('Failed to connect organization');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to disconnect?')) return;
        try {
            await apiClient.delete(`${SERVICES.social.url}/connections/${id}`);
            fetchConnections();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Stack spacing={3}>
            <Card>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6">Connected Accounts</Typography>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                startIcon={<FacebookIcon />}
                                onClick={startFacebookConnect}
                                sx={{ bgcolor: '#1877F2', '&:hover': { bgcolor: '#166fe5' } }}
                            >
                                Connect Facebook
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<LinkedInIcon />}
                                onClick={startLinkedInConnect}
                                sx={{ bgcolor: '#0077b5', '&:hover': { bgcolor: '#00669c' } }}
                            >
                                Connect LinkedIn
                            </Button>
                        </Stack>
                    </Stack>

                    {loading ? (
                        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                    ) : connections.length === 0 ? (
                        <Alert severity="info">No social accounts connected. Connect an account to sync reviews and posts.</Alert>
                    ) : (
                        <List>
                            {connections.map((conn) => (
                                <ListItem
                                    key={conn.id}
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(conn.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar>
                                            {conn.platform === 'facebook' ? <FacebookIcon /> :
                                                conn.platform === 'linkedin' ? <LinkedInIcon /> :
                                                    conn.platform === 'instagram' ? <InstagramIcon /> : <LinkIcon />}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={conn.pageName}
                                        secondary={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                                    {conn.platform}
                                                </Typography>
                                                {conn.status === 'active' ? (
                                                    <Chip label="Active" size="small" color="success" icon={<CheckCircleIcon />} sx={{ height: 20 }} />
                                                ) : (
                                                    <Chip label="Error" size="small" color="error" icon={<ErrorIcon />} sx={{ height: 20 }} />
                                                )}
                                            </Stack>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>

            {/* Facebook Page Select Dialog */}
            <Dialog open={showFbModal} onClose={() => setShowFbModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Select Facebook Page</DialogTitle>
                <DialogContent>
                    {fbPages.length === 0 ? (
                        <Typography>No pages found for this user.</Typography>
                    ) : (
                        <List>
                            {fbPages.map(page => (
                                <ListItemButton key={page.id} onClick={() => confirmFacebookPage(page)}>
                                    <ListItemText
                                        primary={page.name}
                                        secondary={`Category: ${page.category}`}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowFbModal(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* LinkedIn Org Select Dialog */}
            <Dialog open={showLiModal} onClose={() => setShowLiModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Select LinkedIn Page</DialogTitle>
                <DialogContent>
                    {liOrgs.length === 0 ? (
                        <Typography>No organizations found for this user.</Typography>
                    ) : (
                        <List>
                            {liOrgs.map(org => (
                                <ListItemButton key={org.id} onClick={() => confirmLinkedInOrg(org)}>
                                    <ListItemAvatar>
                                        {org.logoUrl ? <Avatar src={org.logoUrl} /> : <Avatar>{org.localizedName[0]}</Avatar>}
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={org.localizedName}
                                        secondary={org.vanityName}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowLiModal(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};
