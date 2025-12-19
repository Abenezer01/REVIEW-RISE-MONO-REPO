/* eslint-disable import/no-unresolved */
import type { ComponentType} from 'react';
import { Fragment } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography, IconButton } from '@mui/material';

// Core Imports
import CustomAvatar from '@core/components/mui/Avatar'

export interface ConfirmationDialogProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'delete' | 'warning' | 'info';
}

const ConfirmationDialog: ComponentType<ConfirmationDialogProps> = ({ 
  open, 
  handleClose, 
  title, 
  content, 
  onConfirm, 
  onCancel,
  type = 'warning' 
}) => {
  
  const getIcon = () => {
    switch (type) {
      case 'delete':
        return 'tabler-trash';
      case 'warning':
        return 'tabler-alert-triangle';
      case 'info':
        return 'tabler-info-circle';
      default:
        return 'tabler-alert-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'delete':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'primary';
      default:
        return 'primary';
    }
  };

  return (
    <Fragment>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        aria-labelledby="alert-dialog-title" 
        aria-describedby="alert-dialog-description"
        maxWidth='xs'
        fullWidth
        sx={{ '& .MuiDialog-paper': { overflow: 'visible', textAlign: 'center' } }}
      >
        <IconButton
          aria-label='close'
          onClick={handleClose}
          sx={{
            top: 12,
            right: 12,
            position: 'absolute',
            color: 'text.secondary'
          }}
        >
          <i className='tabler-x' />
        </IconButton>

        <DialogTitle component="div" id="alert-dialog-title" sx={{ pt: 10, pb: 4, px: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <CustomAvatar skin='light' color={getColor()} variant='rounded' sx={{ width: 58, height: 58 }}>
              <i className={getIcon()} style={{ fontSize: '2rem' }} />
            </CustomAvatar>
          </Box>
          <Typography variant='h4' sx={{ mb: 1 }}>
            {title}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 6, pb: 6 }}>
           <Typography variant='body2' color='text.secondary'>
            {content}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', px: 6, pb: 8, pt: 2 }}>
          <Button 
            variant='tonal' 
            color='secondary' 
            onClick={onCancel}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button 
            variant='contained' 
            color={getColor()} 
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default ConfirmationDialog;
