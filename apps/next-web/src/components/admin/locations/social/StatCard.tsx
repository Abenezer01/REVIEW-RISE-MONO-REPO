import type { ReactNode } from 'react';

import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Avatar,
    useTheme,
    alpha
} from '@mui/material';

interface StatCardProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: ReactNode;
    color: string;
}

export const StatCard = ({ title, value, subtext, icon, color }: StatCardProps) => {
    const theme = useTheme();

    
return (
        <Card sx={{ height: '100%', bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            {title}
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ mt: 1, mb: 0.5 }}>
                            {value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {subtext}
                        </Typography>
                    </Box>
                    <Avatar variant="rounded" sx={{ bgcolor: alpha(color, 0.1), color: color }}>
                        {icon}
                    </Avatar>
                </Stack>
            </CardContent>
        </Card>
    );
};
