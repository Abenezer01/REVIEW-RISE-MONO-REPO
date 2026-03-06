/* eslint-disable react/jsx-no-literals */
'use client'

import React, { useState } from 'react'
import {
    Card,
    CardContent,
    Grid,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Button,
    Typography,
    useTheme,
    alpha
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'

export default function GlobalDashboardFilters() {
    const theme = useTheme()
    const [dateRange, setDateRange] = useState('30d')
    const [account, setAccount] = useState('all')
    const [location, setLocation] = useState('all')

    const handleDateChange = (event: SelectChangeEvent<string>) => {
        setDateRange(event.target.value)
    }

    const handleAccountChange = (event: SelectChangeEvent<string>) => {
        setAccount(event.target.value)
    }

    const handleLocationChange = (event: SelectChangeEvent<string>) => {
        setLocation(event.target.value)
    }

    return (
        <Card
            sx={{
                mb: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[4]
            }}
        >
            <CardContent sx={{ pb: '16px !important' }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className="tabler-dashboard" style={{ fontSize: '1.5rem', color: theme.palette.primary.main }} />
                            {'Command Center'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {'Global Platform Overview'}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 9 }}>
                        <Grid container spacing={2} justifyContent="flex-end">
                            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="account-select-label">{'Account'}</InputLabel>
                                    <Select
                                        labelId="account-select-label"
                                        value={account}
                                        label="Account"
                                        onChange={handleAccountChange}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        <MenuItem value="all">{'All Accounts'}</MenuItem>
                                        <MenuItem value="acct_1">{'Acme Corp'}</MenuItem>
                                        <MenuItem value="acct_2">{'TechFlow Inc'}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="location-select-label">{'Location'}</InputLabel>
                                    <Select
                                        labelId="location-select-label"
                                        value={location}
                                        label="Location"
                                        onChange={handleLocationChange}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        <MenuItem value="all">{'All Locations'}</MenuItem>
                                        <MenuItem value="loc_1">{'New York HQ'}</MenuItem>
                                        <MenuItem value="loc_2">{'London Branch'}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="date-range-select-label">{'Date Range'}</InputLabel>
                                    <Select
                                        labelId="date-range-select-label"
                                        value={dateRange}
                                        label="Date Range"
                                        onChange={handleDateChange}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        <MenuItem value="7d">{'Last 7 Days'}</MenuItem>
                                        <MenuItem value="30d">{'Last 30 Days'}</MenuItem>
                                        <MenuItem value="90d">{'Last 90 Days'}</MenuItem>
                                        <MenuItem value="ytd">{'Year to Date'}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size="auto" sx={{ display: 'flex', mt: { xs: 2, sm: 0 } }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<i className="tabler-wand" />}
                                    sx={{
                                        borderRadius: 2,
                                        boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    {'Quick Action'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}
