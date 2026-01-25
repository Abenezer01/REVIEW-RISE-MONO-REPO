'use client'

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { formatDate } from '@platform/utils'
import { useTranslations } from 'next-intl'
import { toast } from 'react-toastify'

import { SERVICES } from '@/configs/services'
import { useBusinessId } from '@/hooks/useBusinessId'
import apiClient from '@/lib/apiClient'
import StudioGenerateButton from './shared/StudioGenerateButton'

import CalendarGrid from './planner/CalendarGrid'
import PlanSidebar from './planner/PlanSidebar'
import ScheduledPostList from './planner/ScheduledPostList'

const TOPICS = [
    'Product Launch',
    'Brand Awareness',
    'Educational Series',
    'Community Engagement',
    'Holiday Promotion',
    'Industry News'
]

const BUSINESS_TYPES = [
    'E-commerce Store',
    'Local Business',
    'Consultant / Coach',
    'Service Provider',
    'Tech Startup'
]

export default function PlanGenerator() {
    const t = useTranslations('studio.planner')
    const { businessId } = useBusinessId()
    const [loading, setLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    
    // Generator Config
    const [topic, setTopic] = useState('Brand Awareness')
    const [businessType, setBusinessType] = useState('Local Business')

    // Data State
    const [plan, setPlan] = useState<any[]>([])
    const [selectedDay, setSelectedDay] = useState<number>(1)

    // Derived State
    const currentDayPosts = useMemo(() => plan.filter(p => p.day === selectedDay), [plan, selectedDay])
    
    const stats = useMemo(() => {
        const counts: Record<string, number> = { Instagram: 0, Facebook: 0, LinkedIn: 0, Twitter: 0 }

        plan.forEach(p => {
            if (counts[p.platform] !== undefined) counts[p.platform]++
        })
        
return {
            total: plan.length,
            counts
        }
    }, [plan])

    useEffect(() => {
        if (!businessId) return

        const fetchPosts = async () => {
            try {
                const now = new Date()
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

                const response = await apiClient.get(`${SERVICES.social.url}/posts`, {
                    params: {
                        businessId,
                        startDate: startOfMonth,
                        endDate: endOfMonth,
                        status: 'draft' // Only fetch drafts for planner? Or all? Let's fetch all but maybe distinguish visually later. For now, matching generator which makes drafts.
                    }
                })

                const posts = response.data

                if (Array.isArray(posts) && posts.length > 0) {
                    const mappedPlan = posts.map((post: any) => {
                        const date = new Date(post.scheduledAt)
                        const contentParts = post.content ? post.content.split('\n\n') : ['', '']
                        const topic = contentParts[0].replace(/\*\*/g, '')
                        const contentType = contentParts.slice(1).join('\n\n')
                        
                        return {
                            day: date.getDate(),
                            topic: topic || 'Untitled Post',
                            contentType: contentType || '',
                            platform: post.platform,
                            id: post.id // store ID to avoid duplicates or for updates
                        }
                    })

                    setPlan(mappedPlan)
                }
            } catch (error) {
                console.error('Failed to fetch scheduled posts:', error)

                // Don't toast error on fetch to avoid annoyance on empty states
            }
        }

        fetchPosts()
    }, [businessId])

    const handleGenerate = async () => {
        setLoading(true)
        setDialogOpen(false)

        try {
            const response = await apiClient.post(`${SERVICES.ai.url}/studio/plan`, { 
                topic, 
                businessType 
            })

            const data = response.data


            // Process data to ensure platform standardization if needed
            const newPlan = (data.days || []).map((d: any) => ({
                ...d,
                platform: d.platform || 'Instagram' // Default pivot
            }))
            
            setPlan(newPlan)
            toast.success('30-Day Plan generated!')
        } catch (error) {
            console.error(error)
            toast.error('Failed to generate plan')
        } finally {
            setLoading(false)
        }
    }

    const currentMonthLabel = formatDate(new Date(), 'MMMM YYYY')

    const handleSavePlan = async () => {
        if (plan.length === 0) return
        
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth()

        const formattedPosts = plan.map(p => ({
            content: `**${p.topic}**\n\n${p.contentType || ''}`,
            platform: p.platform,
            status: 'draft',

            // Set time to 10:00 AM on the specific day
            scheduledAt: new Date(year, month, p.day, 10, 0, 0).toISOString(),
            mediaUrls: [] // No media yet
        }))

        try {
            await apiClient.post(`${SERVICES.social.url}/posts/batch`, {
                businessId,
                posts: formattedPosts
            })
            toast.success('Plan saved to drafts successfully!')
        } catch (error) {
            console.error('Failed to save plan:', error)
            toast.error('Failed to save plan')
        }
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>{t('title')}</Typography>
                    <Typography variant="body1" color="text.secondary">{t('subtitle')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        startIcon={<i className="tabler-arrow-left" />} 
                        sx={{ borderColor: 'divider', color: 'text.secondary' }}
                        variant="outlined"
                    >
                         {currentMonthLabel}
                         <i className="tabler-arrow-right" style={{ marginLeft: 8 }} />
                    </Button>
                    <Button 
                        startIcon={<i className="tabler-download" />} 
                        variant="outlined"
                        onClick={handleSavePlan}
                        disabled={plan.length === 0}
                    >
                        {t('savePlan')}
                    </Button>
                    <StudioGenerateButton 
                        onClick={() => setDialogOpen(true)}
                        label="Generate New Plan"
                    />
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                    <CircularProgress size={48} color="secondary" />
                    <Typography variant="h6" sx={{ mt: 3, fontWeight: 'medium' }}>Creating your 30-day strategy...</Typography>
                    <Typography color="text.secondary">Analyzing market trends and best times to post.</Typography>
                </Box>
            ) : plan.length === 0 ? (
                 <Box sx={{ p: 10, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 4, bgcolor: 'background.paper' }}>
                     <Box sx={{ mb: 3, width: 80, height: 80, borderRadius: '50%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>
                        <i className="tabler-calendar-plus" style={{ fontSize: 40, opacity: 0.5 }} />
                     </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>No Active Plan</Typography>
                    <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                        Start by generating a comprehensive content strategy tailored to your niche.
                    </Typography>
                    <StudioGenerateButton 
                        variant="contained" 
                        size="large"
                        onClick={() => setDialogOpen(true)}
                        label="Generate 30-Day Plan"
                    />
                </Box>
            ) : (
                <Grid container spacing={4}>
                    {/* Full Width Calendar */}
                    <Grid size={{ xs: 12 }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Content Calendar</Typography>
                            <CalendarGrid 
                                days={plan} 
                                selectedDay={selectedDay} 
                                onSelectDay={setSelectedDay}
                                monthLabel={currentMonthLabel}
                            />
                        </Box>
                    </Grid>

                    {/* Details and Sidebar Row */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        {/* Selected Day Details */}
                        <Box>
                            <ScheduledPostList 
                                day={selectedDay} 
                                posts={currentDayPosts} 
                                dateLabel={new Date(new Date().getFullYear(), new Date().getMonth(), selectedDay).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            />
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 4 }}>
                        <PlanSidebar totalPosts={stats.total} platformCounts={stats.counts} />
                    </Grid>
                </Grid>
            )}

            {/* Generation Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogContent sx={{ p: 4 }}>
                    <Typography variant="h5" fontWeight="bold" mb={3}>Generate New Plan</Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                         <TextField
                            select
                            label={t('topicLabel')}
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            fullWidth
                        >
                            {TOPICS.map((t) => (
                                <MenuItem key={t} value={t}>{t}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label={t('businessTypeLabel')}
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            fullWidth
                        >
                            {BUSINESS_TYPES.map((t) => (
                                <MenuItem key={t} value={t}>{t}</MenuItem>
                            ))}
                        </TextField>
                        
                        <StudioGenerateButton 
                            onClick={handleGenerate}
                            loading={loading}
                            label={t('submitButton')}
                            loadingLabel="Generating..."
                            sx={{ mt: 2 }}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    )
}
