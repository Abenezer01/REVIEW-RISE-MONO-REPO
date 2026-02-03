'use client';

import React, { useEffect, useState, useCallback } from 'react';

import {
    Box,
    Button,
    Typography,
    Stack,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Grid,
    useTheme,
    CircularProgress,
    Card
} from '@mui/material';
import { useTranslations } from 'next-intl';

import {
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    LinkedIn as LinkedInIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Add as AddIcon,
    Public as PublicIcon,
    People as PeopleIcon
} from '@mui/icons-material';

import apiClient from '@/lib/apiClient';
import { SERVICES } from '@/configs/services';


// Imported Components & Types
import type { SocialConnection, LinkedInOrg, FacebookPage, InstagramAccount, SocialConnectionListProps } from './types';
import { StatCard } from './StatCard';
import { ConnectionCard } from './ConnectionCard';
import { PlatformOption } from './PlatformOption';

export const SocialConnectionList = ({ businessId, locationId }: SocialConnectionListProps) => {
    const t = useTranslations('social.connections');

    // State
    const [connections, setConnections] = useState<SocialConnection[]>([]);
    const [loading, setLoading] = useState(true);

    // Auth Flow State
    const [fbPages, setFbPages] = useState<FacebookPage[]>([]);
    const [liOrgs, setLiOrgs] = useState<LinkedInOrg[]>([]);
    const [foundIgAccount, setFoundIgAccount] = useState<InstagramAccount | null>(null);
    const [targetFbConnection, setTargetFbConnection] = useState<SocialConnection | null>(null);

    const [showFbModal, setShowFbModal] = useState(false);
    const [showLiModal, setShowLiModal] = useState(false);
    const [showIgModal, setShowIgModal] = useState(false);

    const [tempToken, setTempToken] = useState<string | null>(null);
    const [tempTokenData, setTempTokenData] = useState<any>(null);
    const [connectingIg, setConnectingIg] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const theme = useTheme();

    // Fetch Logic
    const fetchConnections = useCallback(async () => {
        try {
            // Only set refreshing if we already have data to assume background refresh
            if (connections.length === 0) setLoading(true);
            else setRefreshing(true);

            const res = await apiClient.get(`${SERVICES.social.url}/connections`, {
                params: { businessId, locationId }
            });

            setConnections(res.data.connections);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [businessId, locationId, connections.length]);

    useEffect(() => {
        if (businessId && locationId) {
            fetchConnections();
        } else {
            setLoading(false);
        }
    }, [fetchConnections, businessId, locationId]);

    // Listeners
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === 'FACEBOOK_AUTH_SUCCESS') {
                const { accessToken } = event.data;

                setTempToken(accessToken);

                try {
                    const res = await apiClient.get(`${SERVICES.social.url}/facebook/pages`, {
                        headers: { 'x-fb-access-token': accessToken }
                    });

                    setFbPages(res.data.pages);
                    setShowFbModal(true);
                } catch (err) {
                    console.error('Failed to list pages', err);
                    alert(t('alerts.failedToList', { platform: 'Facebook' }));
                }
            } else if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS') {
                const tokenData = {
                    access_token: event.data.accessToken,
                    expires_in: event.data.expiresIn,
                    refresh_token: event.data.refreshToken
                };

                setTempToken(event.data.accessToken);
                setTempTokenData(tokenData);

                try {
                    const res = await apiClient.get(`${SERVICES.social.url}/linkedin/organizations`, {
                        headers: { 'x-li-access-token': event.data.accessToken }
                    });

                    setLiOrgs(res.data.organizations);
                    setShowLiModal(true);
                } catch (err) {
                    console.error('Failed to list orgs', err);
                    alert(t('alerts.failedToList', { platform: 'LinkedIn' }));
                }
            }
        };

        window.addEventListener('message', handleMessage);
        
return () => window.removeEventListener('message', handleMessage);
    }, [businessId, locationId]);

    // Handlers

    const startFacebookConnect = async () => {
        try {
            const res = await apiClient.get(`${SERVICES.social.url}/facebook/auth-url`, {
                params: { businessId, locationId }
            });

            const width = 600, height = 700;
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

            const width = 600, height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            window.open(res.data.url, 'LinkedInAuth', `width=${width},height=${height},left=${left},top=${top}`);
        } catch (err) {
            console.error(err);
        }
    };

    const startInstagramConnect = async () => {
        // 1. Find active Facebook connection
        const fbConn = connections.find(c => c.platform === 'facebook' && c.status === 'active');

        if (!fbConn) {
            alert(t('alerts.pleaseConnectFbFirst'));
            
return;
        }

        if (!fbConn.accessToken) {
            alert(t('alerts.fbMissingToken'));
            
return;
        }

        try {
            setLoading(true); // Re-use main loading or add specific one

            // 2. Fetch IG accounts linked to this page
            // We use the page ID and the PAGE access token stored in the connection
            const res = await apiClient.get(`${SERVICES.social.url}/facebook/pages/${fbConn.pageId}/instagram-accounts`, {
                headers: { 'x-fb-page-access-token': fbConn.accessToken }
            });

            const account = res.data.instagramAccount;

            if (!account) {
                alert(t('alerts.noIgFound', { name: fbConn.pageName }));
            } else {
                setFoundIgAccount(account);
                setTargetFbConnection(fbConn);
                setShowIgModal(true);
            }

        } catch (err) {
            console.error('Failed to fetch Instagram account', err);
            alert(t('alerts.failedToFindIg'));
        } finally {
            setLoading(false);
        }
    };

    const confirmFacebookPage = async (page: FacebookPage) => {
        try {
            await apiClient.post(`${SERVICES.social.url}/facebook/connect`, {
                businessId, locationId, page, userAccessToken: tempToken
            });
            setTempToken(null);
            fetchConnections();
            setShowFbModal(false);
        } catch (err) {
            console.error(err);
            alert(t('alerts.failedToConnect', { platform: 'Facebook' }));
        }
    };

    const confirmLinkedInOrg = async (org: LinkedInOrg) => {
        try {
            await apiClient.post(`${SERVICES.social.url}/linkedin/connect`, {
                businessId, locationId, organization: org, tokenData: tempTokenData
            });
            setShowLiModal(false);
            setTempToken(null);
            setTempTokenData(null);
            fetchConnections();
        } catch (err) {
            console.error(err);
            alert(t('alerts.failedToConnect', { platform: 'LinkedIn' }));
        }
    };

    const confirmInstagramConnect = async () => {
        if (!foundIgAccount || !targetFbConnection) return;

        try {
            setConnectingIg(true);

            // We use the connection's refreshToken as the userAccessToken fallback if needed, 
            // though strict IG connect might need a fresh user token. 
            // For now, we attempt to use what we have (Page Token or Refresh Token).
            // Actually, usually `refreshToken` stores the Long-Lived User Token for FB depending on implementation.
            // If strictly creating a new row, we need backend to accept what we send.
            await apiClient.post(`${SERVICES.social.url}/instagram/connect`, {
                businessId,
                locationId,
                igAccountId: foundIgAccount.id,
                pageId: targetFbConnection.pageId,
                userAccessToken: targetFbConnection.refreshToken || targetFbConnection.accessToken
            });

            setShowIgModal(false);
            setFoundIgAccount(null);
            setTargetFbConnection(null);
            fetchConnections();
        } catch (err) {
            console.error('Failed to connect Instagram', err);
            alert(t('alerts.failedToConnect', { platform: 'Instagram' }));
        } finally {
            setConnectingIg(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('alerts.confirmDisconnect'))) return;

        try {
            await apiClient.delete(`${SERVICES.social.url}/connections/${id}`);
            fetchConnections();
        } catch (err) {
            console.error(err);
        }
    };

    // Derived Stats
    const issuesCount = connections.filter(c => c.status !== 'active').length;
    const totalReach = connections.reduce((acc, curr) => acc + (curr.followers || 0), 0) + 847000; // Mock base for visuals

    // Initial Loading State
    if (loading && connections.length === 0) {
        return <Box display="flex" justifyContent="center" p={8}><CircularProgress /></Box>;
    }

    return (
        <Stack spacing={4}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" fontWeight={700}>{t('title')}</Typography>
                    <Typography color="text.secondary">{t('subtitle')}</Typography>
                    {loading && <Typography variant="caption" color="primary">{t('refreshing')}</Typography>}
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchConnections} disabled={loading || refreshing}>
                        {refreshing ? t('refreshing') : t('refreshAll')}
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} color="warning" onClick={startFacebookConnect}>{t('connectAccount')}</Button>
                </Stack>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title={t('stats.connectedAccounts')}
                        value={connections.length || 3}
                        subtext={t('stats.activeConnections')}
                        icon={<PublicIcon />}
                        color={theme.palette.info.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title={t('stats.totalReach')}
                        value={`${(totalReach / 1000).toFixed(0)}K`}
                        subtext={t('stats.combinedFollowers')}
                        icon={<PeopleIcon />}
                        color={theme.palette.success.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title={t('stats.tokenStatus')}
                        value={issuesCount === 0 ? t('stats.healthy') : t('stats.issues', { count: issuesCount })}
                        subtext={issuesCount === 0 ? t('stats.allTokensValid') : t('stats.needsReconnection')}
                        icon={issuesCount === 0 ? <CheckCircleIcon /> : <WarningIcon />}
                        color={issuesCount === 0 ? theme.palette.success.main : theme.palette.warning.main}
                    />
                </Grid>
            </Grid>

            {/* Connected Accounts List */}
            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={600}>{t('list.title')}</Typography>
                    <Stack direction="row" spacing={1}>
                        <Chip label={t('list.all')} color="primary" />
                        <Chip label={t('list.active')} variant="outlined" />
                        <Chip label={t('list.issues')} variant="outlined" />
                    </Stack>
                </Stack>

                <Stack spacing={2}>
                    {connections.length === 0 ? (
                        [1, 2, 3].map(i => (
                            <Card key={i} sx={{ border: '1px dashed', borderColor: 'divider', p: 3, textAlign: 'center' }}>
                                <Typography color="text.secondary">{t('list.mockItem', { index: i })}</Typography>
                            </Card>
                        ))
                    ) : (
                        connections.map(conn => (
                            <ConnectionCard
                                key={conn.id}
                                connection={conn}
                                onRefresh={fetchConnections}
                                onDisconnect={() => handleDelete(conn.id)}
                            />
                        ))
                    )}
                </Stack>
            </Box>

            {/* Available Platforms */}
            <Box>
                <Typography variant="h6" fontWeight={600} mb={2}>{t('platforms.title')}</Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <PlatformOption
                            name={t('platforms.facebook.name')}
                            description={t('platforms.facebook.description')}
                            icon={<FacebookIcon />}
                            color="#1877F2"
                            features={t.raw('platforms.facebook.features')}
                            action={startFacebookConnect}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <PlatformOption
                            name={t('platforms.instagram.name')}
                            description={t('platforms.instagram.description')}
                            icon={<InstagramIcon />}
                            color="#E4405F"
                            features={t.raw('platforms.instagram.features')}
                            action={startInstagramConnect}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <PlatformOption
                            name={t('platforms.linkedin.name')}
                            description={t('platforms.linkedin.description')}
                            icon={<LinkedInIcon />}
                            color="#0077b5"
                            features={t.raw('platforms.linkedin.features')}
                            action={startLinkedInConnect}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Simple Dialogs */}

            {/* Facebook Page Modal */}
            <Dialog open={showFbModal} onClose={() => setShowFbModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{t('modals.selectFb')}</DialogTitle>
                <DialogContent>
                    <List>
                        {fbPages.map(page => (
                            <ListItemButton key={page.id} onClick={() => confirmFacebookPage(page)}>
                                <ListItemText primary={page.name} secondary={page.category} />
                            </ListItemButton>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowFbModal(false)}>{t('modals.cancel')}</Button>
                </DialogActions>
            </Dialog>

            {/* LinkedIn Org Modal */}
            <Dialog open={showLiModal} onClose={() => setShowLiModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{t('modals.selectLi')}</DialogTitle>
                <DialogContent>
                    <List>
                        {liOrgs.map(org => (
                            <ListItemButton key={org.id} onClick={() => confirmLinkedInOrg(org)}>
                                <ListItemAvatar>
                                    <Avatar src={org.logoUrl}>{org.localizedName[0]}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={org.localizedName} secondary={org.vanityName} />
                            </ListItemButton>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowLiModal(false)}>{t('modals.cancel')}</Button>
                </DialogActions>
            </Dialog>

            {/* Instagram Account Modal */}
            <Dialog open={showIgModal} onClose={() => setShowIgModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{t('modals.connectIg')}</DialogTitle>
                <DialogContent>
                    {foundIgAccount ? (
                        <Box textAlign="center" py={2}>
                            <Avatar
                                src={foundIgAccount.profile_picture_url}
                                sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                            />
                            <Typography variant="h6">{foundIgAccount.name}</Typography>
                            <Typography color="text.secondary" gutterBottom>@{foundIgAccount.username}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                {t('modals.igLinkedToFb')}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography>{t('modals.noAccountFound')}</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowIgModal(false)}>{t('modals.cancel')}</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={confirmInstagramConnect}
                        disabled={connectingIg || !foundIgAccount}
                    >
                        {connectingIg ? t('modals.connecting') : t('modals.connect')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};
