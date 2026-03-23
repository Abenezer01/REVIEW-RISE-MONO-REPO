'use client'

import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Custom Component Imports
import CustomTabList from '@core/components/mui/TabList'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { useTranslation } from '@/hooks/useTranslation'

// Tab Components
import GeneralTab from './GeneralTab'
import SecurityTab from './SecurityTab'
import PreferencesTab from './PreferencesTab'

interface UserProfileSettingsProps {
    user: any
}

const UserProfileSettings = ({ user }: UserProfileSettingsProps) => {
    const t = useTranslation('dashboard')
    const [activeTab, setActiveTab] = useState('general')

    return (
        <Grid container spacing={6}>
            <Grid size={12}>
                <Typography variant='h4' sx={{ mb: 2 }}>
                    {t('accounts.profile.title')}
                </Typography>

                <Typography variant='body2' color='text.secondary' sx={{ mb: 6 }}>
                    {t('accounts.profile.subtitle')}
                </Typography>
            </Grid>

            <Grid size={12}>
                <TabContext value={activeTab}>
                    <Grid container spacing={6}>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <CustomTabList
                                orientation='vertical'
                                onChange={(e, value) => setActiveTab(value)}
                                sx={{
                                    borderRight: 0,
                                    '& .MuiTabs-indicator': { display: 'none' },
                                    '& .MuiTab-root': {
                                        alignItems: 'flex-start',
                                        textAlign: 'left',
                                        pl: 4,
                                        minHeight: 48,
                                        borderRadius: 1,
                                        mb: 1,
                                        '&.Mui-selected': {
                                            backgroundColor: 'primary.light',
                                            color: 'primary.main',
                                            fontWeight: 500
                                        }
                                    }
                                }}
                            >
                                <Tab
                                    value='general'
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <i className='tabler-user' />
                                            {t('accounts.profile.tabs.general')}
                                        </Box>
                                    }
                                />

                                <Tab
                                    value='security'
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <i className='tabler-lock' />
                                            {t('accounts.profile.tabs.security')}
                                        </Box>
                                    }
                                />

                                <Tab
                                    value='preferences'
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <i className='tabler-bell' />
                                            {t('accounts.profile.tabs.preferences')}
                                        </Box>
                                    }
                                />
                            </CustomTabList>
                        </Grid>

                        <Grid size={{ xs: 12, md: 9 }}>
                            <Box sx={{ mt: { xs: 4, md: 0 } }}>
                                <TabPanel value='general' sx={{ p: 0 }}>
                                    <GeneralTab user={user} />
                                </TabPanel>
                                <TabPanel value='security' sx={{ p: 0 }}>
                                    <SecurityTab />
                                </TabPanel>
                                <TabPanel value='preferences' sx={{ p: 0 }}>
                                    <PreferencesTab />
                                </TabPanel>
                            </Box>
                        </Grid>
                    </Grid>
                </TabContext>
            </Grid>
        </Grid>
    )
}

export default UserProfileSettings
