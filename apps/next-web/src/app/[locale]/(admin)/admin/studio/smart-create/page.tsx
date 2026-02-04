'use client'

import React, { Suspense } from 'react'

import { useRouter , useSearchParams } from 'next/navigation'

import { Box, Button, Typography, Grid } from '@mui/material'
import { useTranslations } from 'next-intl'

import UnifiedPostGenerator from '@/components/studio/UnifiedPostGenerator'


function SmartCreateContent() {
    const t = useTranslations('studio')
    
    // Read query params safely inside client component
    const searchParams = useSearchParams()
    const dateParam = searchParams.get('date')

    return (
        <Box>
            <Typography variant="h4" mb={1}>{t('tabs.magic')}</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                {t('magic.subtitle')}
            </Typography>
            <UnifiedPostGenerator initialDate={dateParam} />
        </Box>
    )
}

export default function SmartCreatePage() {
    const router = useRouter()
    const t = useTranslations('studio')
    const tc = useTranslations('common')

    return (
        <Grid container spacing={4}>
            <Grid size={12}>
                <Button 
                    startIcon={<i className="tabler-arrow-left" />} 
                    onClick={() => router.push('/admin/studio')} 
                    sx={{ mb: 2 }}
                >
                    {t('page.backToStudio')}
                </Button>
                
                <Suspense fallback={<Box>{tc('common.loading')}</Box>}>
                    <SmartCreateContent />
                </Suspense>
            </Grid>
        </Grid>
    )
}
