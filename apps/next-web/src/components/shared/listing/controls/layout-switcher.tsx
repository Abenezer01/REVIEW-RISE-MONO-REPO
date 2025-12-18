import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';

import { useListingConfig } from '../hooks';

export const LayoutSwitcher = () => {
    const { layout, setLayout } = useListingConfig();

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
            <ToggleButton value="table" aria-label="table view">
                <Tooltip title="Table View">
                    <i className="tabler:table" style={{ fontSize: '1.25rem' }} />
                </Tooltip>
            </ToggleButton>

            <ToggleButton value="grid" aria-label="grid view">
                <Tooltip title="Grid View">
                    <i className="tabler:layout-grid" style={{ fontSize: '1.25rem' }} />
                </Tooltip>
            </ToggleButton>

            <ToggleButton value="list" aria-label="list view">
                <Tooltip title="List View">
                    <i className="tabler:list" style={{ fontSize: '1.25rem' }} />
                </Tooltip>
            </ToggleButton>

            <ToggleButton value="masonry" aria-label="masonry view">
                <Tooltip title="Masonry View">
                    <i className="tabler:layout-board" style={{ fontSize: '1.25rem' }} />
                </Tooltip>
            </ToggleButton>
        </ToggleButtonGroup>
    );
};
