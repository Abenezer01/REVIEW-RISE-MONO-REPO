
import { Alert, Box, Typography, Button, Collapse } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export const DisclaimerPanel = () => {
    const [open, setOpen] = useState(true);
    const t = useTranslations('ad-rise');

    if (!open) return (
        <Button
            size="small"
            startIcon={<InfoIcon sx={{ fontSize: 16 }} />}
            onClick={() => setOpen(true)}
            sx={{ mb: 2, textTransform: 'none', color: 'text.secondary' }}
        >
            {t('blueprint.common.disclaimer.show')}
        </Button>
    );

    return (
        <Collapse in={open}>
            <Alert
                severity="info"
                onClose={() => setOpen(false)}
                sx={{ mb: 3, '& .MuiAlert-message': { width: '100%' } }}
            >
                <Typography variant="subtitle2" fontWeight="bold">
                    {t('blueprint.common.disclaimer.title')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    {t('blueprint.common.disclaimer.message')}
                </Typography>
            </Alert>
        </Collapse>
    );
};
