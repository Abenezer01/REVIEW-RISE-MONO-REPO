'use client'

import React from 'react'

import { useRouter } from 'next/navigation'

import { Box, Button, Typography, Grid } from '@mui/material'
import { useTranslations } from 'next-intl'

import UnifiedPostGenerator from '@/components/studio/UnifiedPostGenerator'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

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
                
                <Suspense fallback={<Box>Loading...</Box>}>
                    <SmartCreateContent />
                </Suspense>
            </Grid>
        </Grid>
    )
}
