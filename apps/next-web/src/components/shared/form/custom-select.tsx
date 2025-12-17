import React from 'react';

import { FormHelperText, MenuItem } from '@mui/material';
import { useField, useFormikContext } from 'formik';

import CustomTextField from '@/@core/components/mui/TextField';
import { useRequiredFields } from '@/context/required-fields-context';

interface CustomSelectBoxProps {
  name: string;
  onValueChange?: (value: string | number) => void; // Allow string or number
  type?: string; // Optional type to handle different input types
  [key: string]: any; // To allow any additional props
}

const CustomSelectBox: React.FC<CustomSelectBoxProps> = ({ name, onValueChange, type = 'text', ...props }) => {
  const [field, meta, helpers] = useField(name);
  const { isSubmitting } = useFormikContext();
  const requiredFields = useRequiredFields();

  const isRequired = requiredFields.includes(name);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = type === 'number' ? (event.target.value ? Number(event.target.value) : 0) : event.target.value;

    if (onValueChange) onValueChange(value);
    helpers.setValue(value);
  };

  return (
    <>
      <CustomTextField
        select
        fullWidth
        {...field}
        {...props}
        type={type}
        disabled={props?.disabled || isSubmitting}
        onChange={handleChange}
        required={isRequired}
        value={field.value || ''}
      >
        {props.options.map((option: any) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </CustomTextField>
      {meta.touched && meta.error && (
        <FormHelperText error id={`helper-text-${name}`}>
          {meta.error}
        </FormHelperText>
      )}
    </>
  );
};

export default CustomSelectBox;
