import type { ReactNode } from 'react';

import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';

interface PageSectionProps extends Omit<BoxProps, 'maxWidth'> {
    children: ReactNode;
    maxWidth?: boolean | number;
}

const PageSection = ({ children, maxWidth: _maxWidth, sx, ...props }: PageSectionProps) => {
    return (
        <Box
            component="section"
            sx={{
                p: 3,
                mb: 3,
                borderRadius: 1,
                backgroundColor: 'background.paper',
                boxShadow: 1, // Using our custom shadow 1
                ...sx,
            }}
            {...props}
        >
            {children}
        </Box>
    );
};

export default PageSection;
