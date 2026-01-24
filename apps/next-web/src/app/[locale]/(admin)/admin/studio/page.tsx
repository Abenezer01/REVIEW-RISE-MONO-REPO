
'use client'

import React, { useState } from 'react'

import { Grid, Typography, Box, Button } from '@mui/material'
import { useTranslations } from 'next-intl'

// Dashboard
import StudioDashboard from '@/components/studio/dashboard/StudioDashboard'

// Feature Components
import CaptionGenerator from '@/components/studio/CaptionGenerator'
import HashtagGenerator from '@/components/studio/HashtagGenerator'
import IdeaGenerator from '@/components/studio/IdeaGenerator'
import PlanGenerator from '@/components/studio/PlanGenerator'
import ImageStudio from '@/components/studio/ImageStudio'
import CarouselBuilder from '@/components/studio/CarouselBuilder'
import ScriptWriter from '@/components/studio/ScriptWriter'

// Map tool indices to components
const TOOLS = [
    { component: CaptionGenerator, label: 'captions' },
    { component: HashtagGenerator, label: 'hashtags' },
    { component: IdeaGenerator, label: 'ideas' },
    { component: PlanGenerator, label: 'planner' },
    { component: ImageStudio, label: 'images' },
    { component: CarouselBuilder, label: 'carousels' },
    { component: ScriptWriter, label: 'scripts' },
]

export default function AIStudioPage() {
    const t = useTranslations('studio')

    // view = -1 means Dashboard, 0+ means specific tool index
    const [view, setView] = useState(-1)

    const handleNavigate = (toolIndex: number) => {
        setView(toolIndex)
    }

    const handleBack = () => {
        setView(-1)
    }

    if (view === -1) {
        return <StudioDashboard onNavigate={handleNavigate} />
    }

    const ActiveTool = TOOLS[view]?.component
    const toolLabel = TOOLS[view]?.label

    return (
        <Grid container spacing={4}>
            <Grid  size={12}>
                <Button 
                    startIcon={<i className="tabler-arrow-left" />} 
                    onClick={handleBack} 
                    sx={{ mb: 2 }}
                >
                    Back to Studio
                </Button>
                
                {ActiveTool && (
                     <Box>
                        <Typography variant="h4" mb={1}>{t(`tabs.${toolLabel}`)}</Typography>
                        <Typography variant="body1" color="text.secondary" mb={4}>
                            {t(`${toolLabel}.subtitle`)}
                        </Typography>
                        <ActiveTool />
                     </Box>
                )}
            </Grid>
        </Grid>
    )
}
