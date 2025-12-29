import React from 'react';

import { Box, Drawer, IconButton, Typography } from '@mui/material';

import useTranslation from '@/hooks/useTranslation';

interface FilterListProps {
  open: boolean;
  toggle: () => void;
  handleFilter: (values: any) => void;
  FilterComponentItems?: React.ComponentType<any>;
  initialValues?: any;
}

const FilterList = ({ open, toggle }: FilterListProps) => {
  const t = useTranslation('common');

  // Simple stub implementation
  // In a real implementation, this would likely use Formik or similar to manage state
  // and render FilterComponentItems inside a form.

  // Create a wrapper to capture the form ref or state if needed

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggle}
      PaperProps={{ sx: { width: { xs: 300, sm: 400 } } }}
    >
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{t('common.filter')}</Typography>
        <IconButton onClick={toggle}>
          <i className="tabler-x" />
        </IconButton>
      </Box>

    </Drawer>
  );
};

export default FilterList;
