import type { ReactNode } from 'react';
import { useState } from 'react'; // <-- Imported useState


import { LoadingButton } from '@mui/lab';
import { Box, Button, Grid } from '@mui/material'; // <-- Imported Dialog components
import type { FormikProps, FormikHelpers, FormikValues } from 'formik';
import { Formik } from 'formik';
import { toast } from 'react-hot-toast';

import type * as Yup from 'yup';

import type { ApiResponse, ApiPayload } from '@platform/contracts';

import { useRouter } from '@/i18n/routing';

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
  renderPage?: boolean;
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
  onActionSuccess,
  renderPage = true
}: FormPageWrapperProps<T>) => {
  const t = useTranslation('common');
  const router = useRouter();
  const requiredFields = getRequiredFields(validationSchema);

  // 🌟 NEW STATE for Confirmation Dialog 🌟
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // State to hold the values and helpers temporarily when submission is paused by the dialog
  const [formikSubmissionContext, setFormikSubmissionContext] = useState<{ values: T; helpers: FormikHelpers<T> } | null>(null);

  // Core API submission logic, extracted for reuse
  const executeSubmit = async (values: T, helpers: FormikHelpers<T>) => {
    const { setStatus, setSubmitting, setErrors } = helpers;
    const payload = getPayload(values);

    try {
      const res = await createActionFunc(payload);

      setStatus({ success: true });
      if (onActionSuccess) onActionSuccess(res, { ...payload, files: payload.files || [] });

      if (onCancel) {
        onCancel();
      } else {
        router.push(baseUrl as any);
      }

      toast.success(`${title} ${t(edit ? 'form.success-updated' : 'form.success-created')}`);
    } catch (err: any) {
      const apiError = (err.response && err.response.data) ? err.response.data : err as ApiResponse;

      setStatus({ success: false });

      setErrors(parseError(apiError) as any);
      setSubmitting(false);

      if (apiError.error && typeof apiError.error === 'string') {
        toast.error(apiError.error);
      } else if (apiError.error && apiError.error?.message) {
        toast.error(apiError.error.message);
      }
      else if (apiError.error) {
        toast.error(`${t(edit ? 'form.error-update' : 'form.error-create')} ${title}`);
      }
    }
  };


  const parseError = (error: ApiResponse): Record<string, string> => {
    if (error.error && typeof error.error === 'object' && (error.error as any).details) {
      const details = (error.error as any).details;
      const errors: Record<string, string> = {};

      Object.keys(details).forEach((key) => {
        // Take the first error message for each field
        if (Array.isArray(details[key]) && details[key].length > 0) {
          errors[key] = details[key][0];
        }
      });

      return errors;
    }


    return {};
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
    router.push(baseUrl as any);
  };

  const content = (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} enableReinitialize>
      {(formik: FormikProps<T>) => (
        <>
          {/* 🌟 Confirmation Dialog Rendering 🌟 */}
          {edit && (
            <ConfirmationDialog
              open={isConfirmDialogOpen}
              handleClose={handleDialogClose}
              onConfirm={handleConfirm}
              title={t('dialog.confirm-edit-title')}
              content={t('dialog.confirm-edit-message')}
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
                    {t(edit ? 'common.save' : 'common.submit')}
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
                    {t('common.cancel')}
                  </Button>
                </Grid>
              </Grid>
            </RequiredFieldsContext.Provider>
          </form>
        </>
      )}
    </Formik>
  );

  if (renderPage === false) {
    return content;
  }

  return (
    <Page titleId={title}
      title={translatedTitle}
    >
      {content}
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