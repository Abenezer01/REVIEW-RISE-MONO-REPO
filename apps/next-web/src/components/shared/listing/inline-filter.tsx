import React from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, CardContent, Collapse, Grid, IconButton, Typography } from '@mui/material';
import type { FormikProps } from 'formik';
import { Formik } from 'formik';

import useTranslation from '@/hooks/useTranslation';

interface InlineFilterProps {
  open: boolean;
  toggle: () => void;
  handleFilter: (filters: any) => void;
  FilterComponentItems: React.ComponentType<{ formik: FormikProps<any> }>;
  initialValues: any;
}

const InlineFilter: React.FC<InlineFilterProps> = ({
  open,
  toggle,
  handleFilter,
  FilterComponentItems,
  initialValues = {},
}) => {
  const t = useTranslation('common');

  const handleApplyFilter = async (values: any, { setStatus }: any) => {
    handleFilter(values);
    setStatus({ success: true });
  };

  return (
    <Collapse in={open}>
      <Card sx={{ mb: 4, mt: 2 }}>
        <CardContent>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{t('common.filter')}</Typography>
            <IconButton size="small" onClick={toggle}>
              <i className="tabler-x" />
            </IconButton>
          </Box>
          {FilterComponentItems && (
            <Formik initialValues={initialValues} onSubmit={handleApplyFilter}>
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={4}>
                    <Grid size={12}>
                      <FilterComponentItems formik={formik} />
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        onClick={() => {
                          formik.resetForm();
                          handleFilter({}); // Optional: clear filters on reset
                        }}
                        type="reset"
                        variant="outlined"
                        color="secondary"
                      >
                        {t('common.reset')}
                      </Button>
                      <LoadingButton
                        loading={formik.isSubmitting}
                        disabled={formik.isSubmitting}
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        {t('common.apply')}
                      </LoadingButton>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          )}
        </CardContent>
      </Card>
    </Collapse>
  );
};

export default InlineFilter;
