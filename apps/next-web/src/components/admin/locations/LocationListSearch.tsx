'use client'

import React from 'react'

import BackendAutocomplete from '@/components/shared/form/BackendAutocomplete'

interface LocationListSearchProps {
    onSearch: (term: string) => void
}

const LocationListSearch: React.FC<LocationListSearchProps> = ({ onSearch }) => {
    return (
        <BackendAutocomplete
            endpoint='/admin/locations'
            label=''
            placeholder='Search Location'
            optionLabel='name'
            optionValue='id'
            onSelectionChange={(location) => {
                if (location) {
                    onSearch(location.name)
                } else {
                    onSearch('')
                }
            }}
        />
    )
}

export default LocationListSearch
