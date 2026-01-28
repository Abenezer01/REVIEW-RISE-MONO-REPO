'use client'

import React from 'react'

import { useRouter } from 'next/navigation'

import { Box, Button, Typography, Grid } from '@mui/material'
import { useTranslations } from 'next-intl'

import PlanGenerator from '@/components/studio/PlanGenerator'

export default function PlannerPage() {
    const router = useRouter()
    const t = useTranslations('studio')

    return (
        <Grid container spacing={4}>
            <Grid size={12}>
                <Button 
                    startIcon={<i className="tabler-arrow-left" />} 
                    onClick={() => router.push('/admin/studio')} 
                    sx={{ mb: 2 }}
                >
                    Back to Studio
                </Button>
                
                <Box>
                    <Typography variant="h4" mb={1}>{t('tabs.planner')}</Typography>
                    <Typography variant="body1" color="text.secondary" mb={4}>
                        {t('planner.subtitle')}
                    </Typography>
                    <PlanGenerator />
                </Box>
            </Grid>
        </Grid>
    )
}
