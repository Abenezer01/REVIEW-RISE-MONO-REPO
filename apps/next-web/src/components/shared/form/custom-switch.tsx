import React from 'react';

import { useField, useFormikContext } from 'formik';
import { Switch, FormControlLabel, FormHelperText } from '@mui/material';

const CustomSwitch: React.FC<any> = (props) => {
  const [field, meta] = useField(props);
  const { isSubmitting } = useFormikContext();
  const hasError = !!(meta.touched && meta.error);

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            {...field}
            {...props}
            checked={field.value}
            onChange={() => {
              field.onChange({
                target: { name: field.name, value: !field.value }
              });
            }}
            disabled={props?.disabled || isSubmitting}
          />
        }
        label={props.label}
      />
      {hasError && (
        <FormHelperText error id="standard-weight-helper-text-user-title">
          {meta.error}
        </FormHelperText>
      )}
    </>
  );
};

export default CustomSwitch;
