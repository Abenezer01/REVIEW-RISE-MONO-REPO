'use client'

import React from 'react'

import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

interface StudioGenerateButtonProps extends Omit<ButtonProps, 'onClick'> {
    onClick: () => void | Promise<void>
    loading?: boolean
    label?: string
    loadingLabel?: string
    icon?: React.ReactNode
}

export default function StudioGenerateButton({
    onClick,
    loading = false,
    label = 'Generate',
    loadingLabel = 'Generating...',
    icon,
    sx,
    ...props
}: StudioGenerateButtonProps) {
    return (
        <Button
            variant="contained"
            size="large"
            onClick={onClick}
            disabled={loading || props.disabled}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (icon || <i className='tabler-sparkles' />)}
            sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                bgcolor: 'secondary.main',
                '&:hover': { bgcolor: 'secondary.dark' },
                ...sx
            }}
            {...props}
        >
            {loading ? loadingLabel : label}
        </Button>
    )
}
