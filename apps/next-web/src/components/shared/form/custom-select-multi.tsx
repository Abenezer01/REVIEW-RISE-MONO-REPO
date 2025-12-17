import React from 'react';

import { useField, useFormikContext } from 'formik';
import { FormControl, InputLabel, MenuItem, Select, FormHelperText } from '@mui/material';

const CustomMultiSelect: React.FC<any> = (props) => {
  const [field, meta] = useField(props);
  const { isSubmitting } = useFormikContext();
  const hasError = !!(meta.touched && meta.error);

  return (
    <FormControl fullWidth error={hasError}>
      <InputLabel id={`${props.name}-label`}>{props.label}</InputLabel>
      <Select
        labelId={`${props.name}-label`}
        id={props.name}
        label={props.label}
        {...field}
        multiple // Enable multiple selection
        {...props}
        disabled={props.disabled || isSubmitting}
      >
        {props.options.map((option: any) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {meta.touched && meta.error && <FormHelperText>{meta.error}</FormHelperText>}
    </FormControl>
  );
};

export default CustomMultiSelect;
