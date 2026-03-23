import React from 'react';
import { Card, Typography, Box, Button, useTheme } from '@mui/material';
import useTranslation from '@/hooks/useTranslation';

const MailIcon = () => <span>✉️</span>;
const ShareIcon = () => <span>🔗</span>;
const DownloadIcon = () => <span>📥</span>;

export default function ReputationActionsCard() {
    const theme = useTheme();
    const t = useTranslation('dashboard');

    return (
        <Card sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                {t('widgets.reputationActions.title')}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                {/* Request Reviews */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 2, opacity: 0.8, color: 'primary.main', display: 'flex' }}>
                            <MailIcon />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {t('widgets.reputationActions.requestReviews.title')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {t('widgets.reputationActions.requestReviews.desc')}
                            </Typography>
                        </Box>
                    </Box>
                    <Button variant="contained" color="warning" size="small" sx={{ fontWeight: 600, minWidth: 80 }}>
                        {t('widgets.reputationActions.requestReviews.button')}
                    </Button>
                </Box>

                {/* Share to Social */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: 2, opacity: 0.8, color: 'warning.main', display: 'flex' }}>
                            <ShareIcon />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {t('widgets.reputationActions.shareSocial.title')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {t('widgets.reputationActions.shareSocial.desc')}
                            </Typography>
                        </Box>
                    </Box>
                    <Button variant="contained" color="warning" size="small" sx={{ fontWeight: 600, minWidth: 80 }}>
                        {t('widgets.reputationActions.shareSocial.button')}
                    </Button>
                </Box>

                {/* Export Report */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: 2, opacity: 0.8, color: 'info.main', display: 'flex' }}>
                            <DownloadIcon />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {t('widgets.reputationActions.exportReport.title')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {t('widgets.reputationActions.exportReport.desc')}
                            </Typography>
                        </Box>
                    </Box>
                    <Button variant="contained" color="warning" size="small" sx={{ fontWeight: 600, minWidth: 80 }}>
                        {t('widgets.reputationActions.exportReport.button')}
                    </Button>
                </Box>

            </Box>
        </Card>
    );
}
