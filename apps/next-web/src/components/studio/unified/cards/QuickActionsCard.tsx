import React from 'react'

import { Card, CardContent, Typography, Button, Box } from '@mui/material'

interface QuickActionsCardProps {
    onInstantPost: () => void
    onOpenSchedule: () => void
}

export default function QuickActionsCard({ onInstantPost, onOpenSchedule }: QuickActionsCardProps) {
    return (
        <React.Fragment>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>Quick Actions</Typography>
            <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                        { label: 'Post Instantly', icon: 'tabler-send', action: onInstantPost },
                        { label: 'Schedule to Instagram', icon: 'tabler-calendar', action: onOpenSchedule },
                        { label: 'Download as PDF', icon: 'tabler-download', action: () => {} },
                        { label: 'Share with Team', icon: 'tabler-share', action: () => {} }
                    ].map((action, i) => (
                        <Button 
                            key={i}
                            fullWidth 
                            onClick={action.action}
                            sx={{ 
                                justifyContent: 'flex-start', py: 1.5, px: 2, 
                                color: 'text.primary',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                            startIcon={<Box sx={{ p: 0.5, bgcolor: 'action.hover', borderRadius: 1, display: 'flex' }}><i className={action.icon} /></Box>}
                        >
                            {action.label}
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </React.Fragment>
    )
}
