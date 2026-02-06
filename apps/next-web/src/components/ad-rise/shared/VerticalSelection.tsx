'use client'

import HealingIcon from '@mui/icons-material/Healing'
import LanguageIcon from '@mui/icons-material/Language'
import PublicIcon from '@mui/icons-material/Public'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import StoreIcon from '@mui/icons-material/Store'
import { alpha, Box, Grid, Paper, Typography, useTheme } from '@mui/material'

import { useTranslation } from '@/hooks/useTranslation'

export const VERTICALS = [
    { value: 'Local Service', icon: <StoreIcon fontSize="large" /> },
    { value: 'E-commerce', icon: <ShoppingBagIcon fontSize="large" /> },
    { value: 'SaaS', icon: <LanguageIcon fontSize="large" /> },
    { value: 'Healthcare', icon: <HealingIcon fontSize="large" /> },
    { value: 'Other', icon: <PublicIcon fontSize="large" /> },
] as const

export type VerticalValue = typeof VERTICALS[number]['value']

interface VerticalSelectionProps {
    value: VerticalValue
    onChange: (value: VerticalValue) => void
    tPrefix?: string // Allows for meta.form.verticals or just form.verticals
}

export default function VerticalSelection({ value, onChange, tPrefix = 'meta.form.verticals' }: VerticalSelectionProps) {
    const theme = useTheme()
    const t = useTranslation('blueprint')

    const getTranslationKey = (v: string) => {
        const key = v === 'Local Service' ? 'localService' : v === 'E-commerce' ? 'ecommerce' : v.toLowerCase()
        return `${tPrefix}.${key}`
    }

    return (
        <Grid container spacing={2}>
            {VERTICALS.map((v) => (
                <Grid size={{ xs: 6, sm: 3 }} key={v.value}>
                    <Paper
                        elevation={0}
                        onClick={() => onChange(v.value)}
                        sx={{
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: `2px solid ${value === v.value ? theme.palette.primary.main : theme.palette.divider}`,
                            borderRadius: 2,
                            bgcolor: value === v.value ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        <Box sx={{ color: value === v.value ? 'primary.main' : 'text.secondary', mb: 1 }}>
                            {v.icon}
                        </Box>
                        <Typography variant="body2" fontWeight={value === v.value ? 600 : 500}>
                            {t(getTranslationKey(v.value))}
                        </Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    )
}
