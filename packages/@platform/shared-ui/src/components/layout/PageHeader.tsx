import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface PageHeaderProps {
    title: string;
    subtitle?: ReactNode;
    action?: ReactNode;
}

const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => {
    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2
            }}>
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600, letterSpacing: '-0.01em', mb: 0.5 }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body1" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {action && <Box>{action}</Box>}
            </Box>
        </Box>
    );
};

export default PageHeader;
