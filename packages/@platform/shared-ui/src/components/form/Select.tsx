import React from 'react';

import { FormHelperText, MenuItem } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import type { TextFieldProps } from '@mui/material/TextField';

import BaseTextField from './BaseTextField';

interface SelectProps extends Omit<TextFieldProps, 'name'> {
    name: string;
    options: Array<{ value: string | number; label: string }>;
    onValueChange?: (value: string | number | unknown) => void;
    type?: string;
    multiple?: boolean;
}

const Select: React.FC<SelectProps> = ({ name, options, onValueChange, type = 'text', multiple = false, ...props }) => {
    const [field, meta, helpers] = useField(name);
    const { isSubmitting } = useFormikContext();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;

        if (onValueChange) onValueChange(value);
        helpers.setValue(value);
    };

    return (
        <>
            <BaseTextField
                select
                fullWidth
                {...field}
                {...props}
                type={type}
                disabled={props?.disabled || isSubmitting}
                onChange={handleChange}
                value={field.value || (multiple ? [] : '')}
                slotProps={{
                    select: {
                        multiple: multiple
                    }
                }}
                SelectProps={{
                    multiple: multiple
                }}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </BaseTextField>
            {meta.touched && meta.error && (
                <FormHelperText error id={`helper-text-${name}`}>
                    {meta.error}
                </FormHelperText>
            )}
        </>
    );
};

export default Select;
