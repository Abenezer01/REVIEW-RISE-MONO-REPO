import React from "react";

import { LoadingButton } from "@mui/lab";
import { Box, Button, Grid } from "@mui/material";
import type { FormikProps } from "formik";
import { Formik } from "formik";

import { useTranslation } from '@/hooks/useTranslation';
import CustomSideDrawer from "../drawer/side-drawer";

interface FilterListProps {
  open: boolean;
  toggle: () => void;
  handleFilter: (filters: any) => void;
  FilterComponentItems: React.ComponentType<{ formik: FormikProps<any> }>;
  initialValues: any;
}

const FilterList: React.FC<FilterListProps> = ({
  open,
  toggle,
  handleFilter,
  FilterComponentItems,
  initialValues = {},
}) => {
  const t = useTranslation('common');

  const handleClose = () => {
    toggle();
  };

  const handleApplyFilter = async (values: any, { setStatus }: any) => {
    handleFilter(values);
    setStatus({ success: true });
  };

  return (
    <CustomSideDrawer title="Filter" handleClose={handleClose} open={open}>
      {() => (
        <>
          {FilterComponentItems && (
            <Formik initialValues={initialValues} onSubmit={handleApplyFilter}>
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container>
                    <Grid size={12}>
                      <Box>
                        <FilterComponentItems formik={formik} />
                      </Box>
                    </Grid>
                    <Grid size={12} sx={{ mt: 5 }}>
                      <LoadingButton
                        loading={formik.isSubmitting}
                        loadingPosition="center"
                        disabled={formik.isSubmitting || !formik.isValid}
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        <span>{t('common.search')}</span>
                      </LoadingButton>
                      <Button
                        onClick={() => {
                          formik.resetForm();
                          toggle();
                        }}
                        sx={{ ml: 2 }}
                        type="reset"
                        variant="contained"
                        color="secondary"
                      >
                        {t('common.cancel')}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          )}
        </>
      )}
    </CustomSideDrawer>
  );
};

export default FilterList;
