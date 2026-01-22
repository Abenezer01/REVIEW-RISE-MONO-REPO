import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    useTheme,
    alpha,
    Alert
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon
} from '@mui/icons-material';

import type { SocialConnection } from './types';
import { PlatformAvatar } from './SocialIcons';

interface ConnectionCardProps {
    connection: SocialConnection;
    onRefresh: () => void;
    onDisconnect: () => void;
}

export const ConnectionCard = ({ connection, onRefresh, onDisconnect }: ConnectionCardProps) => {
    const theme = useTheme();

    // Mock Data generators - In real app, these should be props or fetched
    const followers = connection.followers || Math.floor(Math.random() * 50000) + 1000;
    const posts = connection.postsCount || Math.floor(Math.random() * 500) + 10;

    const daysConnected = connection.createdAt
        ? Math.floor((new Date().getTime() - new Date(connection.createdAt).getTime()) / (1000 * 3600 * 24))
        : 0;

    const hoursSynced = connection.lastSyncAt
        ? Math.floor((new Date().getTime() - new Date(connection.lastSyncAt).getTime()) / (1000 * 3600))
        : 2;

    const isError = connection.status !== 'active';

    return (
        <Card sx={{
            bgcolor: 'background.paper',
            border: `1px solid ${isError ? theme.palette.error.main : theme.palette.divider}`,
            position: 'relative',
            overflow: 'visible'
        }}>
            <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                    {/* Icon */}
                    <PlatformAvatar platform={connection.platform} />

                    {/* Main Info */}
                    <Box flex={1} width="100%">
                        <Stack direction="row" alignItems="center" spacing={2} mb={0.5}>
                            <Typography variant="h6" fontWeight={600}>{connection.pageName}</Typography>
                            <Chip
                                label={isError ? "Token Expired" : "Active"}
                                color={isError ? "error" : "success"}
                                size="small"
                                variant={isError ? "filled" : "tonal"}
                                icon={isError ? <ErrorIcon /> : <CheckCircleIcon />}
                                sx={{ borderRadius: 1 }}
                            />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {connection.platform === 'instagram' ? 'Instagram Business' : connection.platform === 'linkedin' ? 'LinkedIn Page' : 'Facebook Page'} • ID: {connection.pageId}
                        </Typography>

                        <Stack direction="row" spacing={3} mt={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <i className="tabler-calendar" style={{ fontSize: 16, opacity: 0.6 }} />
                                <Typography variant="caption" color="text.secondary">Connected {daysConnected} days ago</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <i className="tabler-clock" style={{ fontSize: 16, opacity: 0.6 }} />
                                <Typography variant="caption" color="text.secondary">Last synced {hoursSynced} hours ago</Typography>
                            </Box>
                        </Stack>

                        {isError && (
                            <Alert severity="error" icon={<WarningIcon />} sx={{ mt: 2, bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                                Access token expired. Reconnect to restore functionality.
                            </Alert>
                        )}
                    </Box>

                    {/* Stats */}
                    <Stack direction="row" spacing={4} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'space-between' }}>
                        <Box textAlign="center">
                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>FOLLOWERS</Typography>
                            <Typography variant="h6" fontWeight={700}>{followers.toLocaleString()}</Typography>
                        </Box>
                        <Box textAlign="center">
                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>POSTS</Typography>
                            <Typography variant="h6" fontWeight={700}>{posts.toLocaleString()}</Typography>
                        </Box>
                    </Stack>

                    {/* Actions */}
                    <Stack direction="row" spacing={1}>
                        {isError ? (
                            <Button variant="contained" color="warning" startIcon={<RefreshIcon />} onClick={onRefresh}>
                                Reconnect
                            </Button>
                        ) : (
                            <Button variant="outlined" color="secondary" startIcon={<RefreshIcon />} onClick={onRefresh}>
                                Refresh
                            </Button>
                        )}
                        <Button variant="outlined" color="error" onClick={onDisconnect}>
                            {isError ? "Remove" : "Disconnect"}
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};
