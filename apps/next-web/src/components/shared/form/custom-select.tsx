/* eslint-disable import/no-unresolved */
import React from 'react';

import { FormHelperText, MenuItem, Tooltip, IconButton, InputAdornment, ListItemText, Box, Chip, Checkbox } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { useField, useFormikContext } from 'formik';

import CustomTextField from '@/@core/components/mui/TextField';
import { useRequiredFields } from '@/context/required-fields-context';

interface CustomSelectBoxProps {
  name: string;
  onValueChange?: (value: any) => void;
  multiple?: boolean;
  type?: string;
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
    let value: any = event.target.value;

    if (type === 'number' && !props.multiple) {
      value = value ? Number(value) : 0;
    }

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
        value={field.value || (props.multiple ? [] : '')}
        InputProps={inputProps}
        SelectProps={{
          multiple: props.multiple,
          displayEmpty: true,
          renderValue: (selected: any) => {
            if (props.multiple) {
              if (!selected || (Array.isArray(selected) && selected.length === 0)) {
                return <span style={{ color: 'rgba(0, 0, 0, 0.38)' }}>{props.placeholder}</span>;
              }

              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as any[]).map((value) => {
                    const option = props.options.find(opt => opt.value === value);

                    
return (
                      <Chip
                        key={value}
                        label={option ? option.label : value}
                        size="small"
                        onMouseDown={(e) => e.stopPropagation()}
                        onDelete={() => {
                          const newValue = (field.value as any[]).filter(v => v !== value);

                          helpers.setValue(newValue);
                          if (onValueChange) onValueChange(newValue);
                        }}
                      />
                    );
                  })}
                </Box>
              );
            }

            if (selected === '' || selected === undefined) {
              return <span style={{ color: 'rgba(0, 0, 0, 0.38)' }}>{props.placeholder}</span>;
            }

            const option = props.options.find(opt => opt.value === selected);

            
return option ? option.label : selected;
          },
          ...props.SelectProps
        }}
      >
        {props.placeholder && (
          <MenuItem value="" disabled sx={{ display: 'none' }}>
            {props.placeholder}
          </MenuItem>
        )}
        {props.options.map((option: any) => (
          <MenuItem key={option.value} value={option.value} sx={{ py: 2 }}>
            {props.multiple && (
              <Checkbox checked={Array.isArray(field.value) && field.value.indexOf(option.value) > -1} />
            )}
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
