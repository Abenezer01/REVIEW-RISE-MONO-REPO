'use client'

import { useCallback, useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import InfoIcon from '@mui/icons-material/Info'
import LinkIcon from '@mui/icons-material/Link'
import StarIcon from '@mui/icons-material/Star'

// Core Components
import ShareIcon from '@mui/icons-material/Share'

import CustomAvatar from '@core/components/mui/Avatar'
import CustomTabList from '@core/components/mui/TabList'

import ReviewSourcesDashboard from '@/components/admin/locations/review-sync/ReviewSourcesDashboard'
import { useTranslation } from '@/hooks/useTranslation'
import apiClient from '@/lib/apiClient'
import { SERVICES } from '@/configs/services'

import LocationReviews from '@/components/admin/locations/review-sync/LocationReviews'
import { SocialConnectionList } from '@/components/admin/locations/social/SocialConnectionList'


// Placeholder Components for new tabs
const LocationOverview = ({ location }: { location: any }) => {
    const t = useTranslation('dashboard')

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">{t('locations.detail.overview')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {t('locations.form.address')}: {location?.address}
                </Typography>
                {/* Add more stats here later */}
            </CardContent>
        </Card>
    )
}



const getInitials = (string: string) =>
    string.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '')

const LocationDetailsPage = () => {
    const params = useParams()
    const router = useRouter()
    const t = useTranslation('dashboard') // Or specific location trans set
    const { id } = params
    const [location, setLocation] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('sources') // Default to sources as requested context implies interest

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTab(newValue)
    }

    const fetchLocation = useCallback(async () => {
        if (!id) return



        try {
            setLoading(true)
            const res = await apiClient.get(`${SERVICES.admin.url}/locations/${id}`)

            setLocation(res.data)
        } catch (error) {
            console.error('Failed to fetch location', error)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchLocation()
    }, [fetchLocation])

    if (loading) {
        return (
            <Grid container spacing={6}>
                <Grid size={12}>
                    <Skeleton variant="rectangular" height={200} />
                </Grid>
            </Grid>
        )
    }

    if (!location) {
        return <Typography>{t('locations.detail.notFound')}</Typography>
    }

    return (
        <Grid container spacing={6}>
            {/* Header Section */}
            <Grid size={12}>
                <Box sx={{ mb: 2 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => router.push(location.businessId ? `/admin/accounts/${location.businessId}` : '/admin/accounts')}
                        sx={{ pl: 0 }}
                    >
                        {t('locations.detail.backToAccount')}
                    </Button>
                </Box>
                <Card sx={{ position: 'relative', overflow: 'visible', mt: { xs: 0, md: 4 } }}>
                    <CardContent sx={{ pb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 5 }}>
                            <CustomAvatar
                                skin='light'
                                variant='rounded'
                                color='primary'
                                sx={{ width: 100, height: 100, fontSize: '2.5rem', boxShadow: 3 }}
                            >
                                {getInitials(location.name || 'Loc')}
                            </CustomAvatar>

                            <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                                    <Typography variant='h4' sx={{ fontWeight: 600 }}>
                                        {location.name}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                                        <Typography variant='body1' color="text.secondary">
                                            {location.address}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Tabs Section */}
            <Grid size={12}>
                <TabContext value={tab}>
                    <CustomTabList pill='true' onChange={handleTabChange} aria-label='location tabs'>
                        <Tab value='overview' label={t('locations.detail.tabs.overview')} icon={<InfoIcon />} iconPosition='start' />
                        <Tab value='reviews' label={t('locations.detail.tabs.reviews')} icon={<StarIcon />} iconPosition='start' />
                        <Tab value='sources' label={t('locations.detail.tabs.sources')} icon={<LinkIcon />} iconPosition='start' />
                        <Tab value='social' label={t('locations.detail.tabs.social') || 'Social'} icon={<ShareIcon />} iconPosition='start' />
                    </CustomTabList>

                    <Box sx={{ mt: 4 }}>
                        <TabPanel value='overview' sx={{ p: 0 }}>
                            <LocationOverview location={location} />
                        </TabPanel>
                        <TabPanel value='reviews' sx={{ p: 0 }}>
                            <LocationReviews />
                        </TabPanel>
                        <TabPanel value='sources' sx={{ p: 0 }}>
                            <ReviewSourcesDashboard />
                        </TabPanel>
                        <TabPanel value='social' sx={{ p: 0 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h4">Social Integrations</Typography>
                                <Typography color="textSecondary">
                                    Connect your social media accounts to sync posts and reviews.
                                </Typography>
                            </Box>
                            <SocialConnectionList businessId={location.businessId} locationId={id as string} />
                        </TabPanel>
                    </Box>
                </TabContext>
            </Grid>
        </Grid>
    )
}

export default LocationDetailsPage
