import React from 'react';

import type { BoxProps } from '@mui/material';
import { Box, Drawer, IconButton, styled, Typography } from '@mui/material';


import { useTranslation } from '@/hooks/useTranslation';

interface CustomSideDrawerProps {
  open: boolean;
  handleClose: () => void;
  title?: string;
  translatedTitle?: string;
  children: () => any;
  width?: number; // Optional width prop
}

const Header = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}));

const CustomSideDrawer: React.FC<CustomSideDrawerProps> = ({ open, handleClose, title, translatedTitle, children, width }) => {
  const transl = useTranslation();

  return (
    <div className="customizer">
      <Drawer
        open={open}
        anchor="right"
        variant="temporary"
        onClose={handleClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: width ? `min(${width}px, 100%)` : { xs: '100%', sm: 400 }
          }
        }}
      >
        <Header>
          <Typography variant="h5">{translatedTitle || transl(title || '')}</Typography>
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              p: '0.438rem',
              borderRadius: 1,
              color: 'text.primary',
              backgroundColor: 'action.selected',

            }}
          >
            <i className="tabler:x" style={{ fontSize: '1.125rem' }} />
          </IconButton>
        </Header>
        <Box sx={{ p: (theme) => theme.spacing(0, 6, 6) }}>

          <Box>{children()}</Box>
        </Box>
      </Drawer>
    </div>
  );
};

export default CustomSideDrawer;
