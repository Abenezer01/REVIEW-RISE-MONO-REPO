/* eslint-disable import/no-unresolved */
import React from 'react';

import { FormHelperText, Tooltip, IconButton, InputAdornment } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { useField, useFormikContext } from 'formik';

import { useRequiredFields } from '@/context/required-fields-context';
import CustomTextField from '@/@core/components/mui/TextField';

interface CustomTextBoxProps {
  name: string;
  onValueChange?: (value: string | number) => void;
  type?: string;
  allowSpecialChars?: boolean;
  maxLength?: number;
  multilineMaxLength?: number;
  multiline?: boolean;
  tooltip?: string;
  [key: string]: any;
  formatAsName?: boolean;
}

const CustomTextBox: React.FC<CustomTextBoxProps> = ({
  name,
  onValueChange,
  type = 'text',
  allowSpecialChars = true,
  maxLength = 50,
  multilineMaxLength = 150,
  multiline = false,
  tooltip,
  formatAsName = false,
  ...props
}) => {
  const [field, meta, helpers] = useField(name);
  const { isSubmitting } = useFormikContext();

  const effectiveMaxLength = multiline ? multilineMaxLength : maxLength;
  const requiredFields = useRequiredFields();

  const isRequired = requiredFields.includes(name);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value; // Start value as string (or potentially empty)

    if (typeof value === 'string') {

      // 1. 🛑 DENY ALL LEADING SPACES (Robust Fix for "by any means")
      // This removes any leading spaces, whether typed or pasted.
      value = value.trimStart();

      // 2. Block special chars if not allowed (Kept your existing logic)
      if (!allowSpecialChars) {
        if (type === 'email') {
          value = value.replace(/[^a-zA-Z0-9@._\-+]/g, '');
        }
        else if (type === 'number') {
          value = value.replace(/[^0-9.]/g, '');
        }
        else {
          // allow alphanumeric + space
          value = value.replace(/[^A-Za-z0-9 ]/g, '');
        }
      }

      // 3. 🌟 CONDITIONAL NAME FORMATTING (Title Case)
      if (formatAsName && value.length > 0) {
        // Your existing single-word Title Case logic
        value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      }

      // 4. Enforce max length
      if (value.length > effectiveMaxLength) {
        value = value.substring(0, effectiveMaxLength);
      }
    }

    // 5. Convert to number (needs to happen last if type is 'number')
    let finalValue: string | number;

    if (type === 'number') {
      // Convert to number, or 0 if empty
      finalValue = value ? Number(value) : 0;
    } else {
      finalValue = value;
    }

    if (onValueChange) onValueChange(finalValue);
    helpers.setValue(finalValue);
  };

  const inputProps = {
    ...props.InputProps,
    endAdornment: (
      <>
        {props.InputProps?.endAdornment}
        {tooltip && (
          <InputAdornment position="end">
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
        fullWidth
        {...field}
        {...props}
        type={type}
        disabled={props?.disabled || isSubmitting}
        onChange={handleChange}
        value={field.value || ''}
        required={isRequired}
        InputProps={inputProps}
        inputProps={{
          maxLength: effectiveMaxLength,
          ...props.inputProps
        }}
        multiline={multiline}
      />

      {(meta.touched || !isSubmitting) && meta.error && (
        <FormHelperText error id={`helper-text-${name}`}>
          {meta.error}
        </FormHelperText>
      )}
    </>
  );
};

export default CustomTextBox;
