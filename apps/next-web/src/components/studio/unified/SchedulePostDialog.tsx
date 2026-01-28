'use client'

import React, { useState } from 'react'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material'
import { toast } from 'react-toastify'

interface SchedulePostDialogProps {
    open: boolean
    onClose: () => void
    onSchedule: (date: Date) => void
}

export default function SchedulePostDialog({ open, onClose, onSchedule }: SchedulePostDialogProps) {
    // Default to tomorrow at 9 AM
    const getDefaultDate = () => {
        const d = new Date()

        d.setDate(d.getDate() + 1)
        d.setHours(9, 0, 0, 0)
        
return d.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm for datetime-local
    }

    const [scheduleDate, setScheduleDate] = useState(getDefaultDate())

    const handleSchedule = () => {
        if (!scheduleDate) {
            toast.error('Please select a date and time')
            
return
        }

        onSchedule(new Date(scheduleDate))
        onClose()
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 'bold' }}>Schedule Post</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Choose when you want this post to go live. We will automatically publish it for you.
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
                 <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button 
                    onClick={handleSchedule} 
                    variant="contained" 
                    color="primary"
                    startIcon={<i className="tabler-calendar" />}
                >
                    Schedule
                </Button>
            </DialogActions>
        </Dialog>
    )
}
