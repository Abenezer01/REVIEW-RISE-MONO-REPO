'use client';

import React, { useState, useEffect } from 'react';

import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Stepper,
    Step,
    StepLabel,
    Typography,
    Box,
    Stack,
    List,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Radio,
    Alert,
    alpha,
    useTheme,
    Card
} from '@mui/material';
import {
    Facebook as FacebookIcon,
    Security as SecurityIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Chat as ChatIcon,
    Assessment as AssessmentIcon,
    Close as CloseIcon
} from '@mui/icons-material';

import { useTranslations } from 'next-intl';

import type { FacebookPage } from './types';

interface Props {
    open: boolean;
    onClose: () => void;
    onStartAuth: () => void;
    onConfirmPage: (page: FacebookPage) => void;
    pages: FacebookPage[];
    loading: boolean;
}

const steps = ['Authorize', 'Select Page', 'Complete'];

export const FacebookConnectModal = ({ open, onClose, onStartAuth, onConfirmPage, pages, loading }: Props) => {
    const t = useTranslations('social.connections.fbConnect');
    const theme = useTheme();
    const steps = t.raw('steps');
    const [activeStep, setActiveStep] = useState(0);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

    // Reset step when opened
    useEffect(() => {
        if (open && pages.length === 0) {
            setActiveStep(0);
        } else if (open && pages.length > 0) {
            setActiveStep(1); // Auto jump to selection if pages ready
        }
    }, [open, pages]);

    const handlePageToggle = (id: string) => {
        setSelectedPageId(id);
    };

    const handleConnect = () => {
        const page = pages.find(p => p.id === selectedPageId);

        if (page) {
            onConfirmPage(page);
            setActiveStep(2); // Optimistically move to complete
        }
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Stack spacing={3} mt={1}>
                        <Typography variant="body2" color="text.secondary">
                            {t('permissionsTitle')}
                        </Typography>

                        <Stack spacing={2}>
                            {[
                                <VisibilityIcon key="vis" />,
                                <EditIcon key="edit" />,
                                <ChatIcon key="chat" />,
                                <AssessmentIcon key="assess" />
                            ].map((icon, index) => (
                                <Stack key={index} direction="row" spacing={2} alignItems="center">
                                    <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                                        {icon}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600}>{t(`permissions.${index}.title`)}</Typography>
                                        <Typography variant="caption" color="text.secondary">{t(`permissions.${index}.desc`)}</Typography>
                                    </Box>
                                </Stack>
                            ))}
                        </Stack>

                        <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.info.main, 0.05), borderColor: alpha(theme.palette.info.main, 0.2), p: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <SecurityIcon color="info" />
                                <Box>
                                    <Typography variant="subtitle2" color="info.main" fontWeight={600}>{t('dataSecureTitle')}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('dataSecureDesc')}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Stack>
                );
            case 1:
                return (
                    <Box mt={2} maxHeight={400} overflow="auto">
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            {t('choosePageTitle')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {t('choosePageDesc')}
                        </Typography>

                        {pages.length === 0 ? (
                            <Alert severity="info" sx={{ mt: 2 }}>{t('noPagesFound')}</Alert>
                        ) : (
                            <List>
                                {pages.map((page) => (
                                    <ListItemButton
                                        key={page.id}
                                        selected={selectedPageId === page.id}
                                        onClick={() => handlePageToggle(page.id)}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: selectedPageId === page.id ? 'warning.main' : 'divider',
                                            borderRadius: 1,
                                            mb: 1.5,
                                            bgcolor: selectedPageId === page.id ? alpha(theme.palette.warning.main, 0.05) : 'transparent',
                                            '&:hover': {
                                                bgcolor: selectedPageId === page.id ? alpha(theme.palette.warning.main, 0.1) : 'action.hover'
                                            }
                                        }}
                                    >
                                        <Radio
                                            checked={selectedPageId === page.id}
                                            onChange={() => handlePageToggle(page.id)}
                                            value={page.id}
                                            name="facebook-page-radio"
                                            color="warning"
                                            sx={{ mr: 1 }}
                                        />
                                        <ListItemAvatar>
                                            <Avatar variant="rounded" sx={{ bgcolor: '#1877F2' }}>{page.name[0]}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography variant="subtitle1" fontWeight={600}>{page.name}</Typography>}
                                            secondary={
                                                <Typography variant="caption" color="text.secondary">
                                                    ID: {page.id} • {t('followers', { count: Math.floor(Math.random() * 500) })}
                                                </Typography>
                                            }
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        )}
                    </Box>
                );
            case 2:
                return (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'success.main', mb: 2 }}>
                            <FacebookIcon fontSize="large" />
                        </Avatar>
                        <Typography variant="h5" fontWeight={600}>{t('connectedTitle')}</Typography>
                        <Typography color="text.secondary">{t('connectedDesc')}</Typography>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2} pb={0}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar variant="rounded" sx={{ bgcolor: '#1877F2' }}>
                        <FacebookIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            {activeStep === 1 ? t('selectPageHeader') : t('connectPageHeader')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t('stepLabel', { current: activeStep + 1, total: 3 })}
                        </Typography>
                    </Box>
                </Box>
                <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1 }}>
                    <CloseIcon />
                </Button>
            </Box>

            <Box px={3} pt={2}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <DialogContent>
                {getStepContent(activeStep)}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
                {activeStep !== 2 && (
                    <Button variant="outlined" onClick={activeStep === 0 ? onClose : () => setActiveStep(prev => prev - 1)} sx={{ px: 4, height: 48 }}>
                        {activeStep === 0 ? t('cancel') : t('back')}
                    </Button>
                )}

                {activeStep === 0 && (
                    <Button
                        variant="contained"
                        onClick={onStartAuth}
                        sx={{ bgcolor: '#1877F2', '&:hover': { bgcolor: '#166fe5' }, px: 4, height: 48 }}
                    >
                        {t('continueWithFb')}
                    </Button>
                )}

                {activeStep === 1 && (
                    <Button
                        variant="contained"
                        onClick={handleConnect}
                        disabled={!selectedPageId || loading}
                        color="warning"
                        sx={{ px: 4, height: 48 }}
                    >
                        {loading ? t('connecting') : t('connectPage')}
                    </Button>
                )}

                {activeStep === 2 && (
                    <Button variant="contained" fullWidth onClick={onClose} color="success">
                        {t('done')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
