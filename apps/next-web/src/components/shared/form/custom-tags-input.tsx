import React, { useState } from 'react';

import { useField, useFormikContext } from 'formik';

import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

import CustomTextField from '@/@core/components/mui/TextField';

interface CustomTagsInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
  [key: string]: any;
}

const CustomTagsInput: React.FC<CustomTagsInputProps> = ({
  name,
  label,
  placeholder,
  ...props
}) => {
  const [field, meta, helpers] = useField(name);
  const { isSubmitting } = useFormikContext();
  const [inputValue, setInputValue] = useState('');

  // Ensure value is always an array
  const value = Array.isArray(field.value) ? field.value : [];

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
        const processedTags = newValue.reduce((acc: string[], tag: string) => {
          // Split by comma, trim whitespace, and remove empty strings
          const splitTags = tag.split(',').map(t => t.trim()).filter(Boolean);

          return [...acc, ...splitTags];
        }, []);

        // Remove duplicates
        const uniqueTags = Array.from(new Set(processedTags));

        helpers.setValue(uniqueTags);

        // Clear input value after selection (though reason='reset' usually handles it)
        setInputValue('');
      }}
      onBlur={() => helpers.setTouched(true)}
      disabled={props.disabled || isSubmitting}
      renderTags={(value: string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip

            // variant="filled" is the default and matches the gray background in the user's image
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
          {...props}
          label={label}
          placeholder={placeholder}
          error={meta.touched && Boolean(meta.error)}
          helperText={meta.touched && meta.error}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === ',') {
              e.preventDefault();
              e.stopPropagation();

              if (inputValue.trim()) {
                const newTags = [...value, inputValue.trim()];
                const uniqueTags = Array.from(new Set(newTags));

                helpers.setValue(uniqueTags);
                setInputValue('');
              }
            } else {
              // params.onKeyDown doesn't exist on AutocompleteRenderInputParams
              // The event handler is likely in params.InputProps or params.inputProps
              // We need to call the original handler to preserve Autocomplete functionality (arrows, etc.)

              if (params.inputProps?.onKeyDown) {
                (params.inputProps.onKeyDown as React.KeyboardEventHandler)(e);
              }
            }
          }}
        />
      )}
    />
  );
};

export default CustomTagsInput;
