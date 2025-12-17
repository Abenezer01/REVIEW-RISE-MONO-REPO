import React from 'react';

import { FormHelperText, InputAdornment } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import type { TextFieldProps } from '@mui/material/TextField';

import BaseTextField from './BaseTextField';

interface DatePickerProps extends Omit<TextFieldProps, 'name'> {
    name: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ name, ...props }) => {
    const [field, meta] = useField(name);
    const { isSubmitting } = useFormikContext();

    return (
        <>
            <BaseTextField
                type="date"
                fullWidth
                {...field}
                {...props}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                {/* Icon placeholder - replace with actual icon later if needed */}
                                <span style={{ fontSize: '24px' }}>📅</span>
                            </InputAdornment>
                        )
                    }
                }}
                disabled={props?.disabled || isSubmitting}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            {(meta.touched || !isSubmitting) && meta.error && (
                <FormHelperText error id={`helper-text-${name}`}>
                    {meta.error}
                </FormHelperText>
            )}
        </>
    );
};

export default DatePicker;
