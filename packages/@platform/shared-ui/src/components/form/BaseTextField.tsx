import { forwardRef } from 'react'

import { styled } from '@mui/material/styles'
import type { TextFieldProps } from '@mui/material/TextField';
import TextField from '@mui/material/TextField'
import type { InputLabelProps } from '@mui/material/InputLabel'

const TextFieldStyled = styled(TextField)<TextFieldProps>(({ theme }) => ({
    '& .MuiInputLabel-root': {
        transform: 'none',
        width: 'fit-content',
        maxWidth: '100%',
        lineHeight: 1.153,
        position: 'relative',
        fontSize: theme.typography.body2.fontSize,
        marginBottom: theme.spacing(1),
        color: 'var(--mui-palette-text-primary)',
        '&:not(.Mui-error).MuiFormLabel-colorPrimary.Mui-focused': {
            color: 'var(--mui-palette-primary-main) !important'
        },
        '&.Mui-disabled': {
            color: 'var(--mui-palette-text-disabled)'
        },
        '&.Mui-error': {
            color: 'var(--mui-palette-error-main)'
        }
    },
    '& .MuiInputBase-root': {
        backgroundColor: 'transparent !important',
        border: `1px solid var(--mui-palette-customColors-inputBorder)`,
        '&:not(.Mui-focused):not(.Mui-disabled):not(.Mui-error):hover': {
            borderColor: 'var(--mui-palette-action-active)'
        },
        '&:before, &:after': {
            display: 'none'
        },
        '&.MuiInputBase-sizeSmall': {
            borderRadius: 'var(--mui-shape-borderRadius)'
        },
        '&.Mui-error': {
            borderColor: 'var(--mui-palette-error-main)'
        },
        '&.Mui-focused': {
            borderWidth: 2,
            '& .MuiInputBase-input:not(.MuiInputBase-readOnly):not([readonly])::placeholder': {
                transform: 'translateX(4px)'
            },
            '& :not(textarea).MuiFilledInput-input': {
                padding: '6.25px 13px'
            },
            '&:not(.Mui-error).MuiInputBase-colorPrimary': {
                borderColor: 'var(--mui-palette-primary-main)',
                boxShadow: 'var(--mui-customShadows-primary-sm)'
            },
            '&.Mui-error': {
                borderColor: 'var(--mui-palette-error-main)'
            }
        },
        '&.Mui-disabled': {
            backgroundColor: 'var(--mui-palette-action-hover) !important'
        }
    },

    // Adornments
    '& .MuiInputAdornment-root': {
        marginBlockStart: '0px !important',
        '&.MuiInputAdornment-positionStart + .MuiInputBase-input:not(textarea)': {
            paddingInlineStart: '0px !important'
        }
    },
    '& .MuiInputBase-inputAdornedEnd.MuiInputBase-input': {
        paddingInlineEnd: '0px !important'
    },

    '& :not(.MuiInputBase-sizeSmall).MuiInputBase-root': {
        borderRadius: '8px',
        fontSize: '17px',
        lineHeight: '1.41',
        '& .MuiInputBase-input': {
            padding: '10.8px 16px'
        }
    },

    // For Select
    '& .MuiSelect-select': {
        minHeight: 'unset !important',
        lineHeight: '1.4375em',
        '&.MuiInputBase-input': {
            paddingInlineEnd: '32px !important'
        }
    }
}))

const BaseTextField = forwardRef((props: TextFieldProps, ref) => {
    const { size = 'small', slotProps, ...rest } = props

    return (
        <TextFieldStyled
            size={size}
            inputRef={ref}
            {...rest}
            variant='filled'
            slotProps={{
                ...slotProps,
                inputLabel: { ...slotProps?.inputLabel, shrink: true } as InputLabelProps
            }}
        />
    )
})

export default BaseTextField
