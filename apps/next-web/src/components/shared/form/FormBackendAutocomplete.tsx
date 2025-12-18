'use client'

import React, { useEffect, useState } from 'react'

import { TextField } from '@mui/material'
import { useField, useFormikContext } from 'formik'

import BackendAutocomplete from './BackendAutocomplete'

interface FormBackendAutocompleteProps {
    name: string
    label: string
    endpoint: string
    placeholder?: string
    optionLabel?: string
    optionValue?: string
    initialObject?: any | null // Pass the full object here for Edit mode to pre-fill label
    disabled?: boolean
}

const FormBackendAutocomplete: React.FC<FormBackendAutocompleteProps> = ({
    name,
    label,
    endpoint,
    placeholder,
    optionLabel = 'name',
    optionValue = 'id',
    initialObject,
    disabled
}) => {
    const [field, meta, helpers] = useField(name)
    const { isSubmitting } = useFormikContext()
    const [selectedObject, setSelectedObject] = useState<any | null>(initialObject || null)

    // Sync selectedObject with field.value if field.value changes externally (e.g. form reset)
    // and if we have initialObject matching the ID.
    // However, usually we rely on local state updates when user interacts.

    // If initialObject is provided, we use it to initiate the internal selectedObject
    // This allows the Autocomplete to show the label (e.g. "Google") instead of just the ID.

    useEffect(() => {
        if (initialObject && field.value === initialObject[optionValue]) {
            setSelectedObject(initialObject)
        }
    }, [initialObject, field.value, optionValue])

    return (
        <BackendAutocomplete
            endpoint={endpoint}
            label={label}
            placeholder={placeholder}
            optionLabel={optionLabel}
            optionValue={optionValue}
            value={selectedObject}
            disabled={disabled || isSubmitting}
            onSelectionChange={(newValue) => {
                setSelectedObject(newValue)

                if (newValue) {
                    helpers.setValue(newValue[optionValue])
                } else {
                    helpers.setValue('')
                }
            }}
            renderInput={(params: any) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error ? meta.error : ''}
                    fullWidth
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    )
}

export default FormBackendAutocomplete
