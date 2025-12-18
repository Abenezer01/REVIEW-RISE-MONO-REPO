import { useState } from 'react';

import { Box, Button, Stack, Typography, Alert, Collapse } from '@mui/material';

import { useTranslation } from '@/hooks/useTranslation';

export interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    showDetails?: boolean;
    details?: string;
}

export const ErrorState = ({
    title,
    message,
    onRetry,
    showDetails = false,
    details
}: ErrorStateProps) => {
    const t = useTranslation('common');
    const [detailsOpen, setDetailsOpen] = useState(false);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400,
                textAlign: 'center',
                py: 8,
                px: 3
            }}
        >
            <Box sx={{ mb: 3, fontSize: 64, color: 'error.main', opacity: 0.8 }}>
                <i className="tabler:alert-circle" />
            </Box>

            <Stack spacing={2} alignItems="center" maxWidth={500}>
                <Typography variant="h5" color="error.main">
                    {title || t('common.error')}
                </Typography>

                <Typography variant="body1" color="text.secondary">
                    {message}
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    {onRetry && (
                        <Button
                            variant="contained"
                            onClick={onRetry}
                            startIcon={<i className="tabler:refresh" />}
                        >
                            {t('common.retry')}
                        </Button>
                    )}

                    {showDetails && details && (
                        <Button
                            variant="outlined"
                            onClick={() => setDetailsOpen(!detailsOpen)}
                            startIcon={<i className="tabler:info-circle" />}
                        >
                            {detailsOpen ? 'Hide Details' : 'Show Details'}
                        </Button>
                    )}
                </Stack>

                {showDetails && details && (
                    <Collapse in={detailsOpen} sx={{ width: '100%', mt: 2 }}>
                        <Alert severity="error" sx={{ textAlign: 'left' }}>
                            <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                                {details}
                            </Typography>
                        </Alert>
                    </Collapse>
                )}
            </Stack>
        </Box>
    );
};
