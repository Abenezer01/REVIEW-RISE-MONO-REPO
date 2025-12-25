'use client'
import type { ReactNode } from 'react';
import { useState } from 'react';

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

const drawerWidth = 280;

interface AppShellProps {
    children: ReactNode;
    sidebarContent: ReactNode;
    topbarContent?: ReactNode;
    width?: number;
}

const AppShell = ({ children, sidebarContent, topbarContent, width = drawerWidth }: AppShellProps) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <Topbar onMenuClick={handleDrawerToggle} width={width}>
                {topbarContent}
            </Topbar>

            <Sidebar
                open={mobileOpen}
                onClose={handleDrawerToggle}
                width={width}
            >
                {sidebarContent}
            </Sidebar>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { lg: `calc(100% - ${width}px)` },
                    minHeight: '100vh',
                    backgroundColor: 'customColors.bodyBg' // Using our token
                }}
            >
                <Toolbar /> {/* Spacer for AppBar */}
                {children}
            </Box>
        </Box>
    );
};

export default AppShell;
