import type { ReactNode } from 'react';

import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

interface TopbarProps {
    onMenuClick: () => void;
    children?: ReactNode;
    width?: number;
}

const drawerWidth = 280;

const Topbar = ({ onMenuClick, children, width = drawerWidth }: TopbarProps) => {
    return (
        <AppBar
            position="fixed"
            sx={{
                width: { lg: `calc(100% - ${width}px)` },
                ml: { lg: `${width}px` },
                boxShadow: 'none',
                backdropFilter: 'blur(6px)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)', // TODO: Use token
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { lg: 'none' } }}
                >
                    {/* Replace with Icon component later */}
                    <span style={{ fontSize: '24px' }}>☰</span>
                </IconButton>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    {children}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;
