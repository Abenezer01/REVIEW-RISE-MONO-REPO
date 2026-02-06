/* eslint-disable import/no-unresolved */
import React from 'react';

import { FormHelperText, MenuItem, Tooltip, IconButton, InputAdornment, ListItemText } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { useField, useFormikContext } from 'formik';

import CustomTextField from '@/@core/components/mui/TextField';
import { useRequiredFields } from '@/context/required-fields-context';

interface CustomSelectBoxProps {
  name: string;
  onValueChange?: (value: string | number) => void; // Allow string or number
  type?: string; // Optional type to handle different input types
  tooltip?: string;
  options: { label: string; value: any; description?: string }[];
  [key: string]: any; // To allow any additional props
}

const CustomSelectBox: React.FC<CustomSelectBoxProps> = ({ name, onValueChange, type = 'text', tooltip, ...props }) => {
  const [field, meta, helpers] = useField(name);
  const { isSubmitting } = useFormikContext();
  const requiredFields = useRequiredFields();

  const isRequired = requiredFields.includes(name);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = type === 'number' ? (event.target.value ? Number(event.target.value) : 0) : event.target.value;

    if (onValueChange) onValueChange(value);
    helpers.setValue(value);
  };

  const inputProps = {
    ...props.InputProps,
    endAdornment: (
      <>
        {props.InputProps?.endAdornment}
        {tooltip && (
          <InputAdornment position="end" sx={{ mr: 2 }}>
            <Tooltip title={tooltip} arrow>
              <IconButton size="small" edge="end">
                <InfoIcon fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )}
      </>
    )
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
        InputProps={inputProps}
      >
        {props.options.map((option: any) => (
          <MenuItem key={option.value} value={option.value} sx={{ py: 2 }}>
            <ListItemText
              primary={option.label}
              secondary={option.description}
              secondaryTypographyProps={{ variant: 'caption', sx: { display: 'block', mt: 0.5 } }}
            />
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
