import { Button, Stack, Typography, Checkbox } from '@mui/material';

import { useListing } from '../hooks';
import { useTranslation } from '@/hooks/useTranslation';

interface BulkActionsProps {
    onDelete?: (ids: (string | number)[]) => void | Promise<void>;
    onExport?: (ids: (string | number)[]) => void | Promise<void>;
    customActions?: Array<{
        label: string;
        icon?: React.ReactNode;
        onClick: (ids: (string | number)[]) => void | Promise<void>;
        variant?: 'contained' | 'outlined' | 'text';
        color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    }>;
}

export const BulkActions = ({ onDelete, onExport, customActions = [] }: BulkActionsProps) => {
    const t = useTranslation('common');
    const { selectedItems, clearSelection } = useListing();

    if (selectedItems.size === 0) {
        return null;
    }

    const selectedIds = Array.from(selectedItems);

    return (
        <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
                p: 2,
                bgcolor: 'primary.lighter',
                borderRadius: 1,
                mb: 2
            }}
        >
            <Checkbox
                checked={true}
                indeterminate={false}
                onChange={clearSelection}
                sx={{ p: 0 }}
            />

            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {selectedIds.length} {t('common.items-selected')}
            </Typography>

            {customActions.map((action, index) => (
                <Button
                    key={index}
                    variant={action.variant || 'outlined'}
                    color={action.color || 'primary'}
                    size="small"
                    startIcon={action.icon}
                    onClick={() => action.onClick(selectedIds)}
                >
                    {action.label}
                </Button>
            ))}

            {onExport && (
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<i className="tabler:download" />}
                    onClick={() => onExport(selectedIds)}
                >
                    {t('common.export')}
                </Button>
            )}

            {onDelete && (
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<i className="tabler:trash" />}
                    onClick={() => onDelete(selectedIds)}
                >
                    {t('common.delete')}
                </Button>
            )}

            <Button
                variant="text"
                size="small"
                onClick={clearSelection}
            >
                {t('common.cancel')}
            </Button>
        </Stack>
    );
};
