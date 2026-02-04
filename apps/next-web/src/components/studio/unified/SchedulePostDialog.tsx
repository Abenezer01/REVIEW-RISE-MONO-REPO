'use client'

import React, { useState } from 'react'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material'
import { useTranslations } from 'next-intl'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

interface SchedulePostDialogProps {
    open: boolean
    onClose: () => void
    onSchedule: (date: Date) => void
    initialDate?: Date
}

export default function SchedulePostDialog({ open, onClose, onSchedule, initialDate }: SchedulePostDialogProps) {
    const t = useTranslations('studio.magic')
    const tc = useTranslations('common')
    const { notify } = useSystemMessages()

    // Default to tomorrow at 9 AM
    const getDefaultDate = (date?: Date) => {
        if (date) {
            // If date is passed (e.g. from calendar click), preserve that day.
            // If the passed date has zero time (midnight), maybe set it to 9AM for convenience? 
            // Or just trust the passed date. Since we usually pass YYYY-MM-DD strings via URL which become UTC midnight,
            // let's set it to 9 AM local time on that specific day to be helpful.
            
            const d = new Date(date)
            
            // Check if it's midnight (likely just a date selection)
            // Note: getHours() returns local hours. If input was YYYY-MM-DD (UTC midnight), in UTC+3 it is 3 AM.
            // We want to detect if it's "start of day" effectively.
            // Let's just ALWAYS default to 9 AM if it came from the date picker context (which implies 00:00 UTC usually)
            // For now, let's just force 9 AM on the target day to be safe and consistent.
            d.setHours(9, 0, 0, 0)
            
            // datetime-local input expects local time string, but toISOString() is UTC.
            const localIso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)

            
return localIso
        }

        const d = new Date()

        d.setDate(d.getDate() + 1)
        d.setHours(9, 0, 0, 0)
        const localIso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)

        
return localIso
    }

    const [scheduleDate, setScheduleDate] = useState(getDefaultDate(initialDate))

    React.useEffect(() => {
        if (open) {
            setScheduleDate(getDefaultDate(initialDate))
        }
    }, [open, initialDate])

    const handleSchedule = () => {
        if (!scheduleDate) {
            notify({
                messageCode: 'studio.scheduleDateError' as any,
                severity: 'ERROR'
            })
            
return
        }

        onSchedule(new Date(scheduleDate))
        onClose()
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 'bold' }}>{t('scheduleToSocial')}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {t('scheduleToSocial')}
                    </Typography>
                    <TextField
                        type="datetime-local"
                        fullWidth
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        variant="outlined"
                        sx={{
                             '& .MuiOutlinedInput-root': {
                                 bgcolor: 'background.paper'
                             }
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                 <Button onClick={onClose} color="inherit">{tc('common.cancel')}</Button>
                <Button 
                    onClick={handleSchedule} 
                    variant="contained" 
                    color="primary"
                    startIcon={<i className="tabler-calendar" />}
                >
                    {tc('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
