'use client'

import React, { useState, useEffect, useMemo } from 'react'

import { useField, useFormikContext } from 'formik'
import debounce from 'lodash/debounce'
import { CircularProgress } from '@mui/material'

import type { BusinessDto, PaginatedResponse } from '@platform/contracts'

import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'
import apiClient from '@/lib/apiClient'

interface BusinessAutocompleteProps {
    name: string
    label: string
    placeholder?: string
    disabled?: boolean
    initialBusiness?: BusinessDto | null
}

const BusinessAutocomplete: React.FC<BusinessAutocompleteProps> = ({ name, label, placeholder, disabled, initialBusiness }) => {
    const [field, meta, helpers] = useField(name)
    const { isSubmitting } = useFormikContext()
    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<BusinessDto[]>([])
    const [loading, setLoading] = useState(false)
    const [inputValue, setInputValue] = useState('')

    const fetchBusinesses = useMemo(
        () =>
            debounce(async (search: string) => {
                setLoading(true)

                try {
                    const response = await apiClient.get<PaginatedResponse<BusinessDto>>('/admin/businesses', {
                        params: { search, limit: 20 }
                    })

                    setOptions(response.data.data || [])
                } catch (error) {
                    console.error('Error fetching businesses:', error)
                    setOptions([])
                } finally {
                    setLoading(false)
                }
            }, 500),
        []
    )

    useEffect(() => {
        if (!open) {
            setOptions([])

            return
        }

        fetchBusinesses(inputValue)
    }, [open, inputValue, fetchBusinesses])

    // Find the current selected business DTO based on the field value (ID)
    const selectedBusiness = options.find((opt) => opt.id === field.value) ||
        (initialBusiness && initialBusiness.id === field.value ? initialBusiness : null) ||
        null;

    return (
        <CustomAutocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            options={options}
            loading={loading}
            getOptionLabel={(option: BusinessDto) => option.name || ''}
            isOptionEqualToValue={(option: BusinessDto, value: BusinessDto) => option.id === value.id}
            filterOptions={(x) => x} // Disable built-in filtering, we do it server-side
            onInputChange={(_, newInputValue) => {
                setInputValue(newInputValue)
            }}
            onChange={(_, newValue: BusinessDto | null) => {
                helpers.setValue(newValue ? newValue.id : '')
                helpers.setTouched(true)
            }}
            value={selectedBusiness}
            disabled={disabled || isSubmitting}
            renderInput={(params) => (
                <CustomTextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error ? meta.error : ''}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    )
}

export default BusinessAutocomplete
