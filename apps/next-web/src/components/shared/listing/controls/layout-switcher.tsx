import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useListingConfig } from '../hooks';

export const LayoutSwitcher = () => {
    const { layout, setLayout } = useListingConfig();
    const t = useTranslations('common');

    const handleLayoutChange = (_event: React.MouseEvent<HTMLElement>, newLayout: string | null) => {
        if (newLayout !== null) {
            setLayout(newLayout);
        }
    };

    return (
        <ToggleButtonGroup
            value={layout}
            exclusive
            onChange={handleLayoutChange}
            aria-label="listing layout"
            size="small"
        >
            <ToggleButton value="table" aria-label={t('common.layout.table')}>
                <Tooltip title={t('common.layout.table')}>
                    <i className="tabler:table" style={{ fontSize: '1.25rem' }} />
                </Tooltip>
            </ToggleButton>

            <ToggleButton value="grid" aria-label={t('common.layout.grid')}>
                <Tooltip title={t('common.layout.grid')}>
                    <i className="tabler:layout-grid" style={{ fontSize: '1.25rem' }} />
                </Tooltip>
            </ToggleButton>

            <ToggleButton value="list" aria-label={t('common.layout.list')}>
                <Tooltip title={t('common.layout.list')}>
                    <i className="tabler:list" style={{ fontSize: '1.25rem' }} />
                </Tooltip>
            </ToggleButton>

            <ToggleButton value="masonry" aria-label={t('common.layout.masonry')}>
                <Tooltip title={t('common.layout.masonry')}>
                    <i className="tabler:layout-board" style={{ fontSize: '1.25rem' }} />
                </Tooltip>
            </ToggleButton>
        </ToggleButtonGroup>
    );
};
