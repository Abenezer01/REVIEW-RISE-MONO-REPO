 'use client'
import React from 'react';

import { FormHelperText } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import type { TextFieldProps } from '@mui/material/TextField';


import BaseTextField from './BaseTextField';

interface TextInputProps extends Omit<TextFieldProps, 'name'> {
    name: string;
    onValueChange?: (value: string | number) => void;
    type?: string;
    allowSpecialChars?: boolean;
    maxLength?: number;
    multilineMaxLength?: number;
    formatAsName?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
    name,
    onValueChange,
    type = 'text',
    allowSpecialChars = false,
    maxLength = 50,
    multilineMaxLength = 150,
    multiline = false,
    formatAsName = false,
    ...props
}) => {
    const [field, meta, helpers] = useField(name);
    const { isSubmitting } = useFormikContext();

    const effectiveMaxLength = multiline ? multilineMaxLength : maxLength;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;

        if (typeof value === 'string') {
            value = value.trimStart();

            if (!allowSpecialChars) {
                if (type === 'email') {
                    value = value.replace(/[^a-zA-Z0-9@._\-+]/g, '');
                }
                else if (type === 'number') {
                    value = value.replace(/[^0-9.]/g, '');
                }
                else {
                    value = value.replace(/[^A-Za-z0-9 ]/g, '');
                }
            }

            if (formatAsName && value.length > 0) {
                value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            }

            if (value.length > effectiveMaxLength) {
                value = value.substring(0, effectiveMaxLength);
            }
        }

        let finalValue: string | number;

        if (type === 'number') {
            finalValue = value ? Number(value) : 0;
        } else {
            finalValue = value;
        }

        if (onValueChange) onValueChange(finalValue);
        helpers.setValue(finalValue);
    };

    return (
        <>
            <BaseTextField
                fullWidth
                {...field}
                {...props}
                type={type}
                disabled={props?.disabled || isSubmitting}
                onChange={handleChange}
                value={field.value || ''}
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

export default TextInput;
