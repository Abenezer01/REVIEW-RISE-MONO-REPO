import type { ReactNode } from 'react';
import { useState } from 'react'; // <-- Imported useState

import { useRouter } from 'next/router';

import { LoadingButton } from '@mui/lab';
import { Box, Button, Grid } from '@mui/material'; // <-- Imported Dialog components
import type { FormikProps, FormikHelpers, FormikValues } from 'formik';
import { Formik } from 'formik';
import { toast } from 'react-hot-toast';

import type * as Yup from 'yup';

import type { ApiResponse, ApiPayload } from '@platform/contracts';

import RequiredFieldsContext from '@/context/required-fields-context';



import { useTranslation } from '@/hooks/useTranslation';




import ConfirmationDialog from '../dialog/confirmation-dialog';
import Page from '@/components/layout/page';

// --- Confirmation Dialog Component (Local Mock) ---


// ----------------------------------------------------


interface FormPageWrapperProps<T extends FormikValues> {
  children: (formik: FormikProps<T>) => ReactNode;
  validationSchema: any;
  initialValues: T;
  edit?: boolean;
  title?: string;
  translatedTitle?: string;
  showTitle?: boolean;
  onCancel?: () => void;
  getPayload: (values: T) => ApiPayload<T>;
  createActionFunc: (payload: ApiPayload<T>) => Promise<ApiResponse<T>>;
  fullLayout?: boolean;
  baseUrl?: string;
  headerActions?: any[];
  onActionSuccess?: (response: ApiResponse<T>, payload: { data: T; files: any[] }) => void;
}

const FormPageWrapper = <T extends FormikValues>({
  validationSchema,
  initialValues,
  children,
  edit = false,
  title = '',
  translatedTitle = '',
  onCancel,
  getPayload,
  createActionFunc,
  baseUrl = '',
  onActionSuccess
}: FormPageWrapperProps<T>) => {
  const intl = useTranslation();
  const router = useRouter();
  const requiredFields = getRequiredFields(validationSchema);

  // 🌟 NEW STATE for Confirmation Dialog 🌟
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // State to hold the values and helpers temporarily when submission is paused by the dialog
  const [formikSubmissionContext, setFormikSubmissionContext] = useState<{ values: T; helpers: FormikHelpers<T> } | null>(null);

  // Core API submission logic, extracted for reuse
  const executeSubmit = async (values: T, helpers: FormikHelpers<T>) => {
    const { setStatus, setSubmitting } = helpers;
    const payload = getPayload(values);

    try {
      const res = await createActionFunc(payload);

      setStatus({ success: true });
      if (onActionSuccess) onActionSuccess(res, { ...payload, files: payload.files || [] });

      if (onCancel) {
        onCancel();
      } else {
        router.push(baseUrl);
      }

      toast.success(`${intl(title)} ${intl(edit ? 'common.form.success-updated' : 'common.form.success-created')}`);
    } catch (err: any) {
      const apiError = err as ApiResponse;

      setStatus({ success: false });

      // setErrors(parseError(apiError) as FormikErrors<T>);
      setSubmitting(false);

      if (apiError.error && typeof apiError.error === 'string') {
        toast.error(apiError.error);
      } else if (apiError.error) {
        toast.error(`${intl(edit ? 'error-update' : 'error-create')} ${intl(title)}`);
      }
    }
  };


  const onSubmit = async (values: T, helpers: FormikHelpers<T>) => {
    if (edit) {
      // 1. In edit mode, save context and open dialog
      setFormikSubmissionContext({ values, helpers });
      setIsConfirmDialogOpen(true);

      // 2. Prevent the LoadingButton from spinning while the dialog is open
      helpers.setSubmitting(false);
    } else {
      // 3. For creation, submit immediately
      await executeSubmit(values, helpers);
    }
  };

  const handleConfirm = async () => {
    if (formikSubmissionContext) {
      const { values, helpers } = formikSubmissionContext;

      setIsConfirmDialogOpen(false); // Close the dialog
      helpers.setSubmitting(true); // Re-enable loading state
      await executeSubmit(values, helpers);
      setFormikSubmissionContext(null); // Clear context after submission attempt
    }
  };

  const handleDialogClose = () => {
    setIsConfirmDialogOpen(false);
    setFormikSubmissionContext(null);
  };


  const handleCancel = () => {
    router.push(baseUrl);
  };

  return (
    <Page titleId={title}
      title={translatedTitle}
    >
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {(formik: FormikProps<T>) => (
          <>
            {/* 🌟 Confirmation Dialog Rendering 🌟 */}
            {edit && (
              <ConfirmationDialog
                open={isConfirmDialogOpen}
                handleClose={handleDialogClose}
                onConfirm={handleConfirm}
                title={intl('common.dialog.confirm-edit-title')}
                content={intl('common.dialog.confirm-edit-message')}
                onCancel={handleDialogClose} />
            )}

            <form onSubmit={formik.handleSubmit}>
              <RequiredFieldsContext.Provider value={requiredFields}>
                <Grid container>
                  <Grid size={12}>
                    <Box>{children(formik)}</Box>
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
                      {intl(edit ? 'save' : 'submit')}
                    </LoadingButton>
                    <Button
                      onClick={() => {
                        formik.resetForm();
                        onCancel ? onCancel() : handleCancel();
                      }}
                      sx={{ ml: 2 }}
                      variant="contained"
                      color="secondary"
                    >
                      {intl("cancel")}
                    </Button>
                  </Grid>
                </Grid>
              </RequiredFieldsContext.Provider>
            </form>
          </>
        )}
      </Formik>
    </Page>
  );
};

export default FormPageWrapper;

export const getRequiredFields = (schema: Yup.ObjectSchema<any>): string[] => {
  const schemaDescription = schema.describe();

  return Object.keys(schemaDescription.fields).filter((field) => {
    const fieldDesc = schemaDescription.fields[field] as any;
    const hasRequiredTest = fieldDesc.tests?.some((t: any) => t.name === 'required');
    const isNonNullable = fieldDesc.nullable === false; // numbers, booleans


    return hasRequiredTest || isNonNullable;
  });
};