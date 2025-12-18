import { Box, Button, Stack, Typography } from '@mui/material';

import { useTranslation } from '@/hooks/useTranslation';

export interface EmptyStateProps {
    title?: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
    illustration?: React.ReactNode;
}

export const EmptyState = ({
    title,
    description,
    action,
    illustration
}: EmptyStateProps) => {
    const t = useTranslation('common');

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
            {illustration && (
                <Box sx={{ mb: 3, opacity: 0.6 }}>
                    {illustration}
                </Box>
            )}

            {!illustration && (
                <Box sx={{ mb: 3, fontSize: 64, opacity: 0.3 }}>
                    <i className="tabler:inbox" />
                </Box>
            )}

            <Stack spacing={2} alignItems="center" maxWidth={400}>
                <Typography variant="h5" color="text.primary">
                    {title || t('common.no-items')}
                </Typography>

                {description && (
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                )}

                {action && (
                    <Button
                        variant="contained"
                        onClick={action.onClick}
                        startIcon={action.icon}
                        sx={{ mt: 2 }}
                    >
                        {action.label}
                    </Button>
                )}
            </Stack>
        </Box>
    );
};
