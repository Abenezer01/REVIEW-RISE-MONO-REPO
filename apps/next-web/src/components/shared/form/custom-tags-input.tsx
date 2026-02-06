/* eslint-disable import/no-unresolved */
import React, { useState } from 'react';

import { useField, useFormikContext } from 'formik';

import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { Tooltip, IconButton, InputAdornment } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

import CustomTextField from '@/@core/components/mui/TextField';

interface CustomTagsInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
  tooltip?: string;
  [key: string]: any;
}

const CustomTagsInput: React.FC<CustomTagsInputProps> = ({
  name,
  label,
  placeholder,
  tooltip,
  ...props
}) => {
  const textFieldProps = { ...props };
  const externalOnChange = textFieldProps.onChange;
  
  // Remove these to prevent them from leaking to the internal CustomTextField
  // and causing circular reference errors if they are event-based
  delete (textFieldProps as any).onChange;
  delete (textFieldProps as any).value;

  const [field, meta, helpers] = useField(name);
  const { isSubmitting } = useFormikContext();
  const [inputValue, setInputValue] = useState('');

  // Ensure value is always an array
  const value = Array.isArray(field.value) ? field.value : [];

  const handleTagsChange = (uniqueTags: string[]) => {
    helpers.setValue(uniqueTags);

    if (typeof externalOnChange === 'function') {
      externalOnChange(uniqueTags);
    }

    setInputValue('');
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      autoSelect
      options={[]}
      value={value}
      inputValue={inputValue}
      onInputChange={(event, newInputValue, reason) => {
        if (reason === 'reset') {
          setInputValue('');
        } else {
          setInputValue(newInputValue);
        }
      }}
      onChange={(event, newValue) => {
        // Handle comma-separated values (pasted or typed)
        const processedTags = (newValue as string[]).reduce((acc: string[], tag: string) => {
          // Split by comma, trim whitespace, and remove empty strings
          const splitTags = tag.split(',').map(t => t.trim()).filter(Boolean);

          return [...acc, ...splitTags];
        }, []);

        // Remove duplicates
        const uniqueTags = Array.from(new Set(processedTags));

        handleTagsChange(uniqueTags);
      }}
      onBlur={() => helpers.setTouched(true)}
      disabled={props.disabled || isSubmitting}
      renderTags={(value: string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip
            label={option}
            size="small"
            {...getTagProps({ index })}
            key={index}
          />
        ))
      }
      renderInput={(params) => (
        <CustomTextField
          {...params}
          {...textFieldProps}
          label={label}
          placeholder={placeholder}
          error={meta.touched && Boolean(meta.error)}
          helperText={meta.touched && meta.error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
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
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === ',') {
              e.preventDefault();
              e.stopPropagation();

              if (inputValue.trim()) {
                const newTags = [...value, inputValue.trim()];
                const uniqueTags = Array.from(new Set(newTags));

                handleTagsChange(uniqueTags);
              }
            }
          }}
        />
      )}
    />
  );
};

export default CustomTagsInput;
