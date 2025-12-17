import React from 'react';

import { FormHelperText, InputAdornment } from '@mui/material';
import { useField, useFormikContext } from 'formik';

import CustomTextField from '@/@core/components/mui/TextField';

const CustomDateSelector: React.FC<any> = (props) => {
  const [field, meta] = useField(props);
  const { isSubmitting } = useFormikContext();

  return (
    <>
      <CustomTextField
        type="date"
        fullWidth
        {...field}
        {...props}
        endAdornment={
          <InputAdornment position="end">
            <i className="tabler:calendar text-2xl" />
          </InputAdornment>
        }
        disabled={props?.disabled || isSubmitting}
      />
      {meta.touched && meta.error && (
        <FormHelperText error id="standard-weight-helper-text-user-title">
          {meta.error}
        </FormHelperText>
      )}
    </>
  );
};

export default CustomDateSelector;
