import React from 'react';

import { FormHelperText, InputLabel, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useField, useFormikContext } from 'formik';

interface OptionType {
  label: string;
  value: string;
}

interface CustomAutocompleteProps {
  label: string;
  placeholder?: string;
  options: OptionType[];
  labelField?: string;
  disabled?: boolean;
  name: string;
  [key: string]: any;
}

const CustomAutocomplete: React.FC<CustomAutocompleteProps> = ({
  label,
  placeholder,
  options = [],
  labelField = 'label',
  disabled = false,
  name,
  ...props
}) => {
  const [field, meta, helpers] = useField(name);
  const { isSubmitting } = useFormikContext();

  // Handle change in Autocomplete
  const handleChange = (event: React.SyntheticEvent, value: any) => {
    helpers.setValue(value);
  };


  const renderInput = React.useMemo(
    () => {
      const RenderInputComponent = (params: any) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={meta.touched && Boolean(meta.error)}
          helperText={meta.touched && meta.error ? meta.error : ''}
        />
      );

      RenderInputComponent.displayName = 'RenderInputComponent';

      return RenderInputComponent;
    },
    [label, placeholder, meta.touched, meta.error]
  );


  return (
    <div>
      <InputLabel shrink>{label}</InputLabel>
      <Autocomplete
        fullWidth
        value={field.value || null}
        onChange={handleChange}
        disableClearable
        options={options}
        getOptionLabel={(option: any) => option[labelField] || ''}
        disabled={disabled || isSubmitting}
        renderInput={renderInput}
        {...props}
      />
      {meta.touched && meta.error && <FormHelperText error>{meta.error}</FormHelperText>}
    </div>
  );
};

export default CustomAutocomplete;
