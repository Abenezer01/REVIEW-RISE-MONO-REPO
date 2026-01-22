import type { ReactNode } from 'react';

import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Stack,
    Avatar,
    useTheme,
    alpha
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

interface PlatformOptionProps {
    name: string;
    description: string;
    icon: ReactNode;
    features: string[];
    action: () => void;
    color: string;
}

export const PlatformOption = ({ name, description, icon, features, action, color }: PlatformOptionProps) => {
    const theme = useTheme();

    
return (
        <Card sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Avatar variant="rounded" sx={{ bgcolor: alpha(color, 0.1), color: color }}>
                        {icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>{name}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {description}
                </Typography>

                <Stack spacing={1} mb={3}>
                    {features.map((feature: string, idx: number) => (
                        <Box key={idx} display="flex" alignItems="center" gap={1}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                            <Typography variant="caption">{feature}</Typography>
                        </Box>
                    ))}
                </Stack>

                <Button variant="contained" fullWidth onClick={action} sx={{ bgcolor: color, '&:hover': { bgcolor: alpha(color, 0.9) } }}>
                    Connect {name.split(' ')[0]}
                </Button>
            </CardContent>
        </Card>
    );
};
