'use client'

import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'
import { SystemMessageCode } from '@platform/contracts'
import { useTranslation } from '@/hooks/useTranslation'

import CustomTextField from '@core/components/mui/TextField'
import { updateProfile } from '@/app/actions/profile'
import { useRouter } from 'next/navigation'

interface GeneralTabProps {
    user: any
}

const GeneralTab = ({ user }: GeneralTabProps) => {
    const router = useRouter()
    const t = useTranslation('dashboard')
    const { notify } = useSystemMessages()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // TODO: Fetch user data from API context
    const [formData, setFormData] = useState({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        phone: '' // Phone not in DB yet
    })

    const handleFormChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value })
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        const fullName = `${formData.firstName} ${formData.lastName}`.trim()
        const result = await updateProfile({ name: fullName, email: formData.email })

        setIsSubmitting(false)

        if (result.success) {
            notify(SystemMessageCode.ITEM_UPDATED)
            router.refresh()
        } else {
            notify(SystemMessageCode.UPDATE_FAILED)
        }
    }

    return (
        <Card>
            <CardContent sx={{ pb: 4 }}>
                <Typography variant='h5' sx={{ mb: 4 }}>{t('accounts.profile.general.title')}</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 6 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            bgcolor: 'action.hover',
                            border: theme => `1px dashed ${theme.palette.divider}`
                        }}
                    >
                        <i className='tabler-user' style={{ fontSize: '3rem', color: 'text.secondary' }} />
                    </Box>
                    <Box>
                        <Button component='label' variant='contained' sx={{ mb: 2 }}>
                            {t('accounts.profile.general.uploadPhoto')}
                            <input hidden type='file' accept='image/png, image/jpeg' />
                        </Button>

                        <Typography variant='body2' color='text.secondary'>
                            {t('accounts.profile.general.uploadHint')}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 6 }} />

                <Grid container spacing={5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            fullWidth
                            label={t('accounts.profile.general.firstName')}
                            placeholder='Jane'
                            value={formData.firstName}
                            onChange={e => handleFormChange('firstName', e.target.value)}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            fullWidth
                            label={t('accounts.profile.general.lastName')}
                            placeholder='Admin'
                            value={formData.lastName}
                            onChange={e => handleFormChange('lastName', e.target.value)}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            fullWidth
                            label={t('accounts.profile.general.email')}
                            placeholder='hello@reviewrise.co'
                            value={formData.email}
                            onChange={e => handleFormChange('email', e.target.value)}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            fullWidth
                            label={t('accounts.profile.general.phone')}
                            placeholder='+1 (555) 000-0000'
                            value={formData.phone}
                            onChange={e => handleFormChange('phone', e.target.value)}
                        />
                    </Grid>

                    <Grid size={12} sx={{ mt: 2 }}>
                        <Button variant='contained' sx={{ mr: 4 }} onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? t('accounts.profile.general.saving') : t('accounts.profile.general.saveChanges')}
                        </Button>

                        <Button type='reset' variant='tonal' color='secondary' onClick={() => { }}>
                            {t('accounts.profile.general.reset')}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default GeneralTab
