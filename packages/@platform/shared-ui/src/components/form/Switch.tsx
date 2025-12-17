import React from 'react';

import { useField, useFormikContext } from 'formik';
import type { SwitchProps as MuiSwitchProps } from '@mui/material/Switch';
import SwitchMUI from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';


interface SwitchProps extends Omit<MuiSwitchProps, 'name'> {
    name: string;
    label?: string;
}

const Switch: React.FC<SwitchProps> = ({ name, label, ...props }) => {
    const [field, meta] = useField({ name, type: 'checkbox' });
    const { isSubmitting } = useFormikContext();
    const hasError = !!(meta.touched && meta.error);

    return (
        <>
            <FormControlLabel
                control={
                    <SwitchMUI
                        {...field}
                        {...props}
                        checked={field.value}
                        disabled={props.disabled || isSubmitting}
                    />
                }
                label={label || ''}
            />
            {hasError && (
                <FormHelperText error id={`helper-text-${name}`}>
                    {meta.error}
                </FormHelperText>
            )}
        </>
    );
};

export default Switch;
