import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StarIcon from '@mui/icons-material/Star';
import StoreIcon from '@mui/icons-material/Store';
import { useTranslations } from 'next-intl';

import { Avatar, Box, Button, Card, Grid, LinearProgress, Typography } from '@mui/material';

interface ConnectionSuccessViewProps {
    onGoToDashboard: () => void;
    onViewLogs: () => void;
}

const ConnectionSuccessView = ({ onGoToDashboard, onViewLogs }: ConnectionSuccessViewProps) => {
    const t = useTranslations('locations.ConnectionSuccess');

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 64, height: 64 }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
                </Avatar>
            </Box>

            <Typography variant="h4" fontWeight="bold" gutterBottom>{t('title')}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 480, mx: 'auto' }}>
                {t('description')}
            </Typography>

            {/* Metrics */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid size={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                         <Avatar variant="rounded" sx={{ bgcolor: 'info.main', mb: 1 }}>
                             <StoreIcon />
                         </Avatar>
                         <Typography variant="h5" fontWeight="bold">{t('mockCount')}</Typography>
                         <Typography variant="caption" color="text.secondary">{t('locationsConnected')}</Typography>
                    </Box>
                </Grid>
                <Grid size={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                         <Avatar variant="rounded" sx={{ bgcolor: 'success.main', mb: 1 }}>
                             <StarIcon />
                         </Avatar>
                         <Typography variant="h5" fontWeight="bold">{t('mockReviews')}</Typography>
                         <Typography variant="caption" color="text.secondary">{t('reviewsFound')}</Typography>
                    </Box>
                </Grid>
                <Grid size={4}>
                     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                         <Avatar variant="rounded" sx={{ bgcolor: 'secondary.main', mb: 1 }}> {/* Purple is tough, secondary is orange. Custom color? */}
                             <ScheduleIcon />
                         </Avatar>
                         <Typography variant="h5" fontWeight="bold">{t('daily')}</Typography>
                         <Typography variant="caption" color="text.secondary">{t('autoSyncEnabled')}</Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Sync Progress */}
            <Card variant="outlined" sx={{ bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', mb: 5, p: 3, textAlign: 'left' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{t('syncInProgress')}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="secondary">{t('syncing')}</Typography>
                    </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>{t('importingFromGoogle')}</Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LinearProgress variant="determinate" value={68} sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: '#A379F7' } }} />
                    <Typography variant="body2" fontWeight="bold" sx={{ ml: 2 }}>{t('mockProgress')}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">{t('reviewsSynced')}</Typography>
                    <Typography variant="caption" fontWeight="bold">{t('mockSynced')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">{t('estimatedTimeRemaining')}</Typography>
                    <Typography variant="caption" fontWeight="bold">{t('minutesRemaining', { minutes: 2 })}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">{t('nextScheduledSync')}</Typography>
                    <Typography variant="caption" fontWeight="bold">{t('tomorrowAt', { time: '2:00 AM' })}</Typography>
                </Box>
            </Card>

            {/* Recently Synced Reviews (Mock) */}
             <Box sx={{ textAlign: 'left', mb: 5 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>{t('recentlySyncedReviews')}</Typography>
                <Box sx={{ mb: 2 }}>
                     <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                         <Avatar sx={{ bgcolor: 'warning.main' }}>{t('mockAvatar')}</Avatar>
                         <Box>
                             <Typography variant="subtitle2">{t('mockName')}</Typography>
                             <Typography variant="caption" color="text.secondary">{t('daysAgo', { days: 2 })}</Typography>
                         </Box>
                         <Box sx={{ ml: 'auto', color: 'warning.main' }}>{t('mockStars')}</Box>
                     </Box>
                     <Typography variant="body2" color="text.secondary" sx={{ ml: 7 }}>
                         {t('mockComment')}
                     </Typography>
                </Box>
             </Box>

            <Box sx={{ textAlign: 'left', mb: 5 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>{t('whatIsNext')}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <Box sx={{ p: 0.5, bgcolor: 'warning.dark', borderRadius: 1 }}><CheckCircleIcon fontSize="small" color="inherit" /></Box>
                    <Typography variant="body2">{t('autoSyncDesc', { time: '2:00 AM' })}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                     <Box sx={{ p: 0.5, bgcolor: 'warning.dark', borderRadius: 1 }}><NotificationsIcon fontSize="small"  color="inherit" /></Box>
                    <Typography variant="body2">{t('notificationsDesc')}</Typography>
                </Box>
                 {/* ... more items */}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="outlined" color="inherit" onClick={onViewLogs}>{t('viewSyncLogs')}</Button>
                <Button variant="contained" color="warning" onClick={onGoToDashboard} size="large">{t('goToDashboard')}</Button>
            </Box>

        </Box>
    );
};

export default ConnectionSuccessView;
