'use client'

import React, { useState, useEffect, useCallback } from 'react'

import { CircularProgress, Autocomplete, TextField } from '@mui/material'

import apiClient from '@/lib/apiClient'
import { useDebounce } from '@/hooks/useDebounce'
import useTranslation from '@/hooks/useTranslation'

interface BackendAutocompleteProps {
    endpoint: string
    onSelectionChange: (item: any | null) => void // Returns full item or null
    label?: string
    placeholder?: string
    minChars?: number
    debounceTime?: number
    optionLabel?: string // Key to display, e.g., 'name' or 'primaryLabel'
    optionValue?: string // Key for ID, e.g., 'id'
    queryParams?: Record<string, any> // Static params like status: 'active'
    value?: any | null // Controlled selected item (full object)
    initialValue?: any | null // Initial selected item (full object) for uncontrolled mode
    renderInput?: (params: any) => React.ReactNode // Override input rendering
    disabled?: boolean
}

const BackendAutocomplete: React.FC<BackendAutocompleteProps> = ({
    endpoint,
    onSelectionChange,
    label,
    placeholder,
    minChars = 3,
    debounceTime = 500,
    optionLabel = 'name',
    optionValue = 'id',
    queryParams = {},
    value: controlledValue,
    initialValue,
    renderInput,
    disabled = false
}) => {
    const t = useTranslation('common')

    // Default valus using translation if not provided props
    const effectiveLabel = label || t('common.search')
    const effectivePlaceholder = placeholder || t('form.search-placeholder')

    // State
    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [internalValue, setInternalValue] = useState<any | null>(initialValue || null)

    const value = controlledValue !== undefined ? controlledValue : internalValue

    // Stabilize queryParams to prevent infinite loop
    const queryParamsString = JSON.stringify(queryParams)
    const stableQueryParams = React.useMemo(() => JSON.parse(queryParamsString), [queryParamsString])

    // Api Call
    const fetchDataRaw = useCallback(async (search: string) => {
        if (search.length < minChars) {
            setOptions([])

            return
        }

        setLoading(true)

        try {
            const response = await apiClient.get(endpoint, {
                params: { search, limit: 10, ...stableQueryParams }
            })


            // Support both data.data (paginated) and direct data (list)
            const items = response.data?.data || response.data || []

            setOptions(items)
        } catch (error) {
            console.error(`Error fetching from ${endpoint}:`, error)
            setOptions([])
        } finally {
            setLoading(false)
        }
    }, [endpoint, minChars, stableQueryParams])

    const fetchData = useDebounce(fetchDataRaw, debounceTime)

    // Trigger fetch on input change
    useEffect(() => {
        // Only fetch if open AND input has enough chars
        if (inputValue.length >= minChars && open) {
            fetchData(inputValue)
        } else if (inputValue.length < minChars) {
            setOptions([])
        }
    }, [inputValue, open, fetchData, minChars])

    return (
        <Autocomplete
            open={open}
            onOpen={() => {
                if (inputValue.length >= minChars) setOpen(true)
            }}
            onClose={() => setOpen(false)}
            options={options}
            loading={loading}
            value={value}
            getOptionLabel={(option) => {
                if (typeof option === 'string') return option

                return option[optionLabel] || ''
            }}
            isOptionEqualToValue={(option, value) => option[optionValue] === value[optionValue]}
            filterOptions={(x) => x} // Disable client-side filtering
            onInputChange={(_, newInputValue, reason) => {
                setInputValue(newInputValue)

                if (newInputValue === '' && reason === 'clear') {
                    onSelectionChange(null)
                    setOptions([])
                }

                if (reason === 'input' && newInputValue.length >= minChars) {
                    if (!open) setOpen(true)
                }
            }}
            onChange={(_, newValue: any | null) => {
                if (controlledValue === undefined) {
                    setInternalValue(newValue)
                }

                onSelectionChange(newValue)
            }}
            noOptionsText={inputValue.length < minChars ? t('form.type-min-chars', { minChars }) : t('form.no-results')}
            renderInput={(params) => {
                if (renderInput) {
                    return renderInput({
                        ...params,
                        InputProps: {
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        }
                    })
                }


                return (
                    <TextField
                        {...params}
                        label={effectiveLabel}
                        placeholder={effectivePlaceholder}
                        sx={{ width: 250 }}
                        size='small'
                        inputProps={{
                            ...params.inputProps,
                            autoComplete: 'new-password', // disable autocomplete and autofill
                        }}
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
                )
            }}
            disabled={disabled}
        />
    )
}

export default BackendAutocomplete
