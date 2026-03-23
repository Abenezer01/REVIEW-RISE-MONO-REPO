'use client'
import React, { useState } from 'react'
import { Box, Typography, Button, FormControl, Select, MenuItem, ToggleButtonGroup, ToggleButton, CircularProgress, IconButton, Chip } from '@mui/material'
import useTranslation from '@/hooks/useTranslation'

export interface SeoTopBarProps {
    urls: { id: string; url: string }[]
    selectedUrlId: string
    onUrlChange: (id: string) => void
    isScanning: boolean
    onRunScan: () => void
}

export default function SeoTopBar({ urls, selectedUrlId, onUrlChange, isScanning, onRunScan }: SeoTopBarProps) {
    const [schedule, setSchedule] = useState('weekly')
    const t = useTranslation('dashboard')

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4 }}>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {t('widgets.seoTopBar.title')}
                    <Chip label="BETA" size="small" color="primary" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }} />
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    {t('widgets.seoTopBar.subtitle')}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 240, bgcolor: 'background.paper' }}>
                    <Select
                        value={selectedUrlId}
                        onChange={(e) => onUrlChange(e.target.value)}
                        startAdornment={<i className="tabler-world" style={{ marginRight: 8, color: '#888' }} />}
                    >
                        {urls.map(u => (
                            <MenuItem key={u.id} value={u.id}>{u.url}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ px: 1.5, color: 'text.secondary', fontWeight: 600 }}>
                        {t('widgets.seoTopBar.autoScan')}
                    </Typography>
                    <ToggleButtonGroup
                        size="small"
                        value={schedule}
                        exclusive
                        onChange={(_, v) => v && setSchedule(v)}
                        sx={{ border: 'none', '& .MuiToggleButton-root': { border: 'none', py: 0.5, px: 2, fontSize: '0.75rem', fontWeight: 600 } }}
                    >
                        <ToggleButton value="off">{t('widgets.seoTopBar.schedule.off')}</ToggleButton>
                        <ToggleButton value="weekly">{t('widgets.seoTopBar.schedule.weekly')}</ToggleButton>
                        <ToggleButton value="monthly">{t('widgets.seoTopBar.schedule.monthly')}</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    disabled={isScanning}
                    onClick={onRunScan}
                    startIcon={isScanning ? <CircularProgress size={16} color="inherit" /> : <i className="tabler-scan" />}
                    sx={{ fontWeight: 700, minWidth: 140, height: 40 }}
                >
                    {isScanning ? t('widgets.seoTopBar.scanning') : t('widgets.seoTopBar.runScan')}
                </Button>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <i className="tabler-file-type-pdf" />
                    </IconButton>
                    <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <i className="tabler-file-type-csv" />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    )
}
