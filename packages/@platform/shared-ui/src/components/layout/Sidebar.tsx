 'use client'
import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const drawerWidth = 280;

interface SidebarProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    width?: number;
}

const Sidebar = ({ open, onClose, children, width = drawerWidth }: SidebarProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    return (
        <Box component="nav" sx={{ width: { lg: width }, flexShrink: { lg: 0 } }}>
            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={open}
                    onClose={onClose}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', lg: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width },
                    }}
                >
                    {children}
                </Drawer>
            )}

            {/* Desktop Drawer */}
            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', lg: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width },
                    }}
                    open
                >
                    {children}
                </Drawer>
            )}
        </Box>
    );
};

export default Sidebar;
