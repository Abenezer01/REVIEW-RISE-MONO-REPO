import React from 'react';

import { Box, Slider } from '@mui/material';
import type { FieldProps } from 'formik';
import { Field, ErrorMessage } from 'formik';

interface CustomRangeSliderProps {
  name: string;
  min: number;
  max: number;
  defaultValue: [number, number]; // Define defaultValue prop
}

const CustomRangeSlider: React.FC<CustomRangeSliderProps> = ({ name, min, max, defaultValue }) => {
  return (
    <Box sx={{ width: 300 }}>
      <Field name={name}>
        {({ field, form }: FieldProps<number>) => (
          <Slider
            {...field}
            min={min}
            max={max}
            onChange={(_, newValue) => {
              form.setFieldValue(name, newValue);
              form.setFieldTouched(name, true);
            }}
            valueLabelDisplay="auto"
            value={field.value || defaultValue} // Use defaultValue if field.value is falsy
          />
        )}
      </Field>
      <ErrorMessage name={name}>{(msg) => <div style={{ color: 'red' }}>{msg}</div>}</ErrorMessage>
    </Box>
  );
};

export default CustomRangeSlider;
