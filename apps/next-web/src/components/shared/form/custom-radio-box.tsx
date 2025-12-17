import React from 'react';

import { FormHelperText, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { useField, useFormikContext } from 'formik';

import { useRequiredFields } from '@/context/required-fields-context';

const CustomRadioBox: React.FC<any> = ({ name, label, options, ...otherProps }) => {
  const [field, meta] = useField(name);
  const { isSubmitting } = useFormikContext();
  const hasError = !!(meta.touched && meta.error);
  const requiredFields = useRequiredFields();

  const isRequired = requiredFields.includes(name);


  return (
    <FormControl component="fieldset" fullWidth>
      {label && <FormLabel component="legend" required={isRequired}>{label}</FormLabel>}
      <RadioGroup name={name} value={field.value} onChange={field.onChange} onBlur={field.onBlur} {...otherProps}>
        {options.map((option: any) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
            disabled={otherProps?.disabled || isSubmitting}
          />
        ))}
      </RadioGroup>
      {hasError && (
        <FormHelperText error id={`radio-group-helper-text-${name}`}>
          {meta.error}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default CustomRadioBox;
