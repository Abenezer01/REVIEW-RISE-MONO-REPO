'use client'

import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'
import { SystemMessageCode } from '@platform/contracts'
import { useTranslation } from '@/hooks/useTranslation'
import { changePassword } from '@/app/actions/profile'
import CustomTextField from '@core/components/mui/TextField'

const SecurityTab = () => {
    const t = useTranslation('dashboard')
    const { notify } = useSystemMessages()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [isPasswordShown, setIsPasswordShown] = useState<Record<string, boolean>>({
        current: false,
        new: false,
        confirm: false
    })

    const handleFormChange = (field: string, value: string) => {

        setFormData({ ...formData, [field]: value })
    }

    const togglePasswordVisibility = (field: string) => {
        setIsPasswordShown({ ...isPasswordShown, [field]: !isPasswordShown[field] })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.newPassword !== formData.confirmPassword) {
            notify(SystemMessageCode.AUTH_PASSWORD_MISMATCH)

            return
        }

        setIsSubmitting(true)

        const result = await changePassword({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
        })

        setIsSubmitting(false)

        if (result.success) {
            notify(SystemMessageCode.ITEM_UPDATED)
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } else {
            notify(SystemMessageCode.UPDATE_FAILED)
        }
    }

    return (
        <Card>
            <CardContent sx={{ pb: 4 }}>
                <Typography variant='h5' sx={{ mb: 6 }}>{t('accounts.profile.security.changePassword')}</Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomTextField
                                fullWidth
                                label={t('accounts.profile.security.currentPassword')}
                                type={isPasswordShown.current ? 'text' : 'password'}
                                value={formData.currentPassword}
                                onChange={e => handleFormChange('currentPassword', e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton edge='end' onClick={() => togglePasswordVisibility('current')} onMouseDown={e => e.preventDefault()}>
                                                <i className={isPasswordShown.current ? 'tabler-eye' : 'tabler-eye-off'} />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid size={12} sx={{ mb: 2 }} />

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomTextField
                                fullWidth
                                label={t('accounts.profile.security.newPassword')}
                                type={isPasswordShown.new ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={e => handleFormChange('newPassword', e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton edge='end' onClick={() => togglePasswordVisibility('new')} onMouseDown={e => e.preventDefault()}>
                                                <i className={isPasswordShown.new ? 'tabler-eye' : 'tabler-eye-off'} />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomTextField
                                fullWidth
                                label={t('accounts.profile.security.confirmPassword')}
                                type={isPasswordShown.confirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={e => handleFormChange('confirmPassword', e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton edge='end' onClick={() => togglePasswordVisibility('confirm')} onMouseDown={e => e.preventDefault()}>
                                                <i className={isPasswordShown.confirm ? 'tabler-eye' : 'tabler-eye-off'} />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid size={12} sx={{ mt: 2 }}>
                            <Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
                                {t('accounts.profile.security.requirements')}
                                <br />
                                {t('accounts.profile.security.reqMinChars')}
                                <br />
                                {t('accounts.profile.security.reqLowerUpper')}
                                <br />
                                {t('accounts.profile.security.reqNumberSymbol')}
                            </Typography>

                            <Button type='submit' variant='contained' sx={{ mr: 4 }} disabled={isSubmitting}>
                                {isSubmitting ? t('common.status.processing') : t('accounts.profile.security.changePassword')}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    )
}

export default SecurityTab
