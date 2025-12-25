/* eslint-disable import/no-unresolved */
'use client'

import { useState } from 'react'

import toast from 'react-hot-toast'
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    TextField,
    FormControlLabel,
    Switch,
    Checkbox,
    Button,
    Grid,
    MenuItem,
    Typography,
    Divider,
} from '@mui/material'

import { type SystemSettingsData, updateSystemSettings } from '@/app/actions/system-settings'

const TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Asia/Tokyo',
]

interface SystemSettingsFormProps {
    initialSettings: SystemSettingsData
}

export default function SystemSettingsForm({ initialSettings }: SystemSettingsFormProps) {
    const [settings, setSettings] = useState(initialSettings)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.site_logo || null)
    const [saving, setSaving] = useState(false)

    // Validation errors
    const [errors, setErrors] = useState({
        site_name: '',
        site_title: '',
        footer_text: '',
        max_requests: '',
        window_ms: '',
        smtp_port: '',
        from_email: '',
        session_timeout: '',
        password_min_length: '',
    })

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (file) {
            
            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Logo file size must be less than 2MB')
            
                return
            }

            setLogoFile(file)
            const reader = new FileReader()

            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }

            reader.readAsDataURL(file)
        }
    }

    const validateForm = () => {
        const newErrors = {
            site_name: '',
            site_title: '',
            footer_text: '',
            max_requests: '',
            window_ms: '',
            smtp_port: '',
            from_email: '',
            session_timeout: '',
            password_min_length: '',
        }

        if (!settings.site_name.trim()) {
            newErrors.site_name = 'Site name is required'
        } else if (settings.site_name.length < 2) {
            newErrors.site_name = 'Site name must be at least 2 characters'
        }

        if (!settings.site_title.trim()) {
            newErrors.site_title = 'Site title is required'
        }

        if (settings.footer_text && settings.footer_text.length > 200) {
            newErrors.footer_text = 'Footer text must be less than 200 characters'
        }

        if (settings.rate_limit_config.max_requests < 1) {
            newErrors.max_requests = 'Max requests must be at least 1'
        } else if (settings.rate_limit_config.max_requests > 10000) {
            newErrors.max_requests = 'Max requests cannot exceed 10,000'
        }

        if (settings.rate_limit_config.window_ms < 1000) {
            newErrors.window_ms = 'Window must be at least 1000ms (1 second)'
        } else if (settings.rate_limit_config.window_ms > 3600000) {
            newErrors.window_ms = 'Window cannot exceed 3,600,000ms (1 hour)'
        }

        // Email validation
        if (settings.email_config.smtp_port < 1 || settings.email_config.smtp_port > 65535) {
            newErrors.smtp_port = 'Port must be between 1 and 65535'
        }

        if (settings.email_config.from_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email_config.from_email)) {
            newErrors.from_email = 'Invalid email format'
        }

        // Security validation
        if (settings.security_config.session_timeout_minutes < 5 || settings.security_config.session_timeout_minutes > 1440) {
            newErrors.session_timeout = 'Session timeout must be between 5 and 1440 minutes'
        }

        if (settings.security_config.password_min_length < 6 || settings.security_config.password_min_length > 32) {
            newErrors.password_min_length = 'Password length must be between 6 and 32 characters'
        }

        setErrors(newErrors)
        
        return !Object.values(newErrors).some(error => error !== '')
    }

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error('Please fix the validation errors before saving')
            
            return
        }

        setSaving(true)
        const formData = new FormData()

        formData.append('site_name', settings.site_name)
        formData.append('site_title', settings.site_title)
        formData.append('footer_text', settings.footer_text)

        if (logoFile) {
            formData.append('site_logo_file', logoFile)
        } else {
            formData.append('site_logo', settings.site_logo)
        }

        formData.append('default_timezone', settings.default_timezone)
        if (settings.maintenance_mode) formData.append('maintenance_mode', 'on')

        if (settings.notification_defaults.email) formData.append('notification_email', 'on')
        if (settings.notification_defaults.sms) formData.append('notification_sms', 'on')
        if (settings.notification_defaults.push) formData.append('notification_push', 'on')

        formData.append('rate_limit_max_requests', settings.rate_limit_config.max_requests.toString())
        formData.append('rate_limit_window_ms', settings.rate_limit_config.window_ms.toString())
        formData.append('rate_limit_strategy', settings.rate_limit_config.strategy || 'ip')

        // Email Config
        formData.append('smtp_host', settings.email_config.smtp_host)
        formData.append('smtp_port', settings.email_config.smtp_port.toString())
        formData.append('smtp_user', settings.email_config.smtp_user)
        formData.append('smtp_password', settings.email_config.smtp_password)
        formData.append('from_email', settings.email_config.from_email)
        formData.append('from_name', settings.email_config.from_name)

        // Security Config
        formData.append('session_timeout_minutes', settings.security_config.session_timeout_minutes.toString())
        formData.append('password_min_length', settings.security_config.password_min_length.toString())
        if (settings.security_config.require_special_chars) formData.append('require_special_chars', 'on')
        if (settings.security_config.require_numbers) formData.append('require_numbers', 'on')
        if (settings.security_config.require_uppercase) formData.append('require_uppercase', 'on')
        if (settings.security_config.enable_2fa) formData.append('enable_2fa', 'on')

        const res = await updateSystemSettings(formData)

        setSaving(false)

        if (res.success) {
            toast.success('Settings updated successfully')
            setErrors({ site_name: '', site_title: '', footer_text: '', max_requests: '', window_ms: '', smtp_port: '', from_email: '', session_timeout: '', password_min_length: '' })
        } else {
            toast.error(res.error || 'Failed to update settings')
        }
    }

    return (
        <Grid container spacing={3}>
            {/* Site Settings */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title="Site Configuration" />
                    <Divider />
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <TextField
                                fullWidth
                                label="Site Name"
                                value={settings.site_name}
                                onChange={(e) => {
                                    setSettings({ ...settings, site_name: e.target.value })
                                    if (errors.site_name) setErrors({ ...errors, site_name: '' })
                                }}
                                onBlur={validateForm}
                                error={!!errors.site_name}
                                helperText={errors.site_name}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Site Title"
                                value={settings.site_title}
                                onChange={(e) => {
                                    setSettings({ ...settings, site_title: e.target.value })
                                    if (errors.site_title) setErrors({ ...errors, site_title: '' })
                                }}
                                onBlur={validateForm}
                                error={!!errors.site_title}
                                helperText={errors.site_title}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Footer Text"
                                value={settings.footer_text}
                                onChange={(e) => {
                                    setSettings({ ...settings, footer_text: e.target.value })
                                    if (errors.footer_text) setErrors({ ...errors, footer_text: '' })
                                }}
                                onBlur={validateForm}
                                error={!!errors.footer_text}
                                helperText={errors.footer_text}
                            />

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Site Logo
                                </Typography>
                                <Box
                                    component="label"
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 4,
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        bgcolor: 'background.default',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            bgcolor: 'action.hover',
                                        },
                                    }}
                                >
                                    <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                                    {logoPreview ? (
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Box
                                                component="img"
                                                src={logoPreview}
                                                alt="Logo Preview"
                                                sx={{
                                                    height: 80,
                                                    maxWidth: '100%',
                                                    objectFit: 'contain',
                                                    mb: 2,
                                                    display: 'block',
                                                    mx: 'auto',
                                                }}
                                            />
                                            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                                                Click to replace logo
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Max 2MB
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Box sx={{ mb: 1, color: 'text.secondary', '& i': { fontSize: 32 } }}>
                                                <i className="tabler-upload" />
                                            </Box>
                                            <Typography variant="h6" sx={{ mb: 0.5, fontSize: '1rem' }}>
                                                Upload Logo
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Recommended size: 200x60px
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* General Settings */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title="General Settings" />
                    <Divider />
                    <CardContent>
                        <TextField
                            select
                            fullWidth
                            label="Default Timezone"
                            value={settings.default_timezone}
                            onChange={(e) => setSettings({ ...settings, default_timezone: e.target.value })}
                        >
                            {TIMEZONES.map((tz) => (
                                <MenuItem key={tz} value={tz}>
                                    {tz}
                                </MenuItem>
                            ))}
                        </TextField>
                    </CardContent>
                </Card>
            </Grid>

            {/* Email/SMTP Configuration */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title="Email/SMTP Configuration" />
                    <Divider />
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <TextField
                                fullWidth
                                label="SMTP Host"
                                value={settings.email_config.smtp_host}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    email_config: { ...settings.email_config, smtp_host: e.target.value }
                                })}
                                placeholder="smtp.gmail.com"
                            />
                            <TextField
                                fullWidth
                                type="number"
                                label="SMTP Port"
                                value={settings.email_config.smtp_port}
                                onChange={(e) => {
                                    setSettings({
                                        ...settings,
                                        email_config: { ...settings.email_config, smtp_port: Number(e.target.value) }
                                    })
                                    if (errors.smtp_port) setErrors({ ...errors, smtp_port: '' })
                                }}
                                onBlur={validateForm}
                                error={!!errors.smtp_port}
                                helperText={errors.smtp_port || '587 for TLS, 465 for SSL'}
                            />
                            <TextField
                                fullWidth
                                label="SMTP Username"
                                value={settings.email_config.smtp_user}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    email_config: { ...settings.email_config, smtp_user: e.target.value }
                                })}
                            />
                            <TextField
                                fullWidth
                                type="password"
                                label="SMTP Password"
                                value={settings.email_config.smtp_password}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    email_config: { ...settings.email_config, smtp_password: e.target.value }
                                })}
                            />
                            <TextField
                                fullWidth
                                type="email"
                                label="From Email"
                                value={settings.email_config.from_email}
                                onChange={(e) => {
                                    setSettings({
                                        ...settings,
                                        email_config: { ...settings.email_config, from_email: e.target.value }
                                    })
                                    if (errors.from_email) setErrors({ ...errors, from_email: '' })
                                }}
                                onBlur={validateForm}
                                error={!!errors.from_email}
                                helperText={errors.from_email}
                                placeholder="noreply@example.com"
                            />
                            <TextField
                                fullWidth
                                label="From Name"
                                value={settings.email_config.from_name}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    email_config: { ...settings.email_config, from_name: e.target.value }
                                })}
                                placeholder="RiseReview"
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Security Settings */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title="Security Settings" />
                    <Divider />
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Session Timeout (minutes)"
                                value={settings.security_config.session_timeout_minutes}
                                onChange={(e) => {
                                    setSettings({
                                        ...settings,
                                        security_config: { ...settings.security_config, session_timeout_minutes: Number(e.target.value) }
                                    })
                                    if (errors.session_timeout) setErrors({ ...errors, session_timeout: '' })
                                }}
                                onBlur={validateForm}
                                error={!!errors.session_timeout}
                                helperText={errors.session_timeout || 'How long before users are logged out due to inactivity'}
                            />
                            <TextField
                                fullWidth
                                type="number"
                                label="Minimum Password Length"
                                value={settings.security_config.password_min_length}
                                onChange={(e) => {
                                    setSettings({
                                        ...settings,
                                        security_config: { ...settings.security_config, password_min_length: Number(e.target.value) }
                                    })
                                    if (errors.password_min_length) setErrors({ ...errors, password_min_length: '' })
                                }}
                                onBlur={validateForm}
                                error={!!errors.password_min_length}
                                helperText={errors.password_min_length}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Password Requirements
                                </Typography>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={settings.security_config.require_special_chars}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                security_config: { ...settings.security_config, require_special_chars: e.target.checked }
                                            })}
                                        />
                                    }
                                    label="Require Special Characters"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={settings.security_config.require_numbers}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                security_config: { ...settings.security_config, require_numbers: e.target.checked }
                                            })}
                                        />
                                    }
                                    label="Require Numbers"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={settings.security_config.require_uppercase}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                security_config: { ...settings.security_config, require_uppercase: e.target.checked }
                                            })}
                                        />
                                    }
                                    label="Require Uppercase Letters"
                                />
                            </Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.security_config.enable_2fa}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            security_config: { ...settings.security_config, enable_2fa: e.target.checked }
                                        })}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1">Enable Two-Factor Authentication</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Require users to set up 2FA for enhanced security
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Maintenance Mode */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title="System Status" />
                    <Divider />
                    <CardContent>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.maintenance_mode}
                                    onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                                    color="error"
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body1">Maintenance Mode</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        When enabled, the site will be inaccessible to non-admin users.
                                    </Typography>
                                </Box>
                            }
                        />
                    </CardContent>
                </Card>
            </Grid>

            {/* Notifications */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title="Notification Defaults" />
                    <Divider />
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, flexWrap: 'wrap' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={settings.notification_defaults.email}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                notification_defaults: { ...settings.notification_defaults, email: e.target.checked },
                                            })
                                        }
                                    />
                                }
                                label="Email Notifications"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={settings.notification_defaults.sms}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                notification_defaults: { ...settings.notification_defaults, sms: e.target.checked },
                                            })
                                        }
                                    />
                                }
                                label="SMS Notifications"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={settings.notification_defaults.push}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                notification_defaults: { ...settings.notification_defaults, push: e.target.checked },
                                            })
                                        }
                                    />
                                }
                                label="Push Notifications"
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Rate Limits */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardHeader title="Global Default Rate Limits" />
                    <Divider />
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <TextField
                                select
                                label="Rate Limit Strategy"
                                fullWidth
                                value={settings.rate_limit_config.strategy || 'ip'}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        rate_limit_config: { ...settings.rate_limit_config, strategy: e.target.value },
                                    })
                                }
                            >
                                <MenuItem value="ip">IP Address</MenuItem>
                                <MenuItem value="user">User ID</MenuItem>
                                <MenuItem value="token">API Token</MenuItem>
                            </TextField>
                            <TextField
                                label="Max Requests"
                                type="number"
                                fullWidth
                                value={settings.rate_limit_config.max_requests}
                                onChange={(e) => {
                                    setSettings({
                                        ...settings,
                                        rate_limit_config: { ...settings.rate_limit_config, max_requests: Number(e.target.value) },
                                    })
                                    if (errors.max_requests) setErrors({ ...errors, max_requests: '' })
                                }}
                                onBlur={validateForm}
                                error={!!errors.max_requests}
                                helperText={errors.max_requests}
                            />
                            <TextField
                                label="Window (ms)"
                                type="number"
                                fullWidth
                                value={settings.rate_limit_config.window_ms}
                                onChange={(e) => {
                                    setSettings({
                                        ...settings,
                                        rate_limit_config: { ...settings.rate_limit_config, window_ms: Number(e.target.value) },
                                    })
                                    if (errors.window_ms) setErrors({ ...errors, window_ms: '' })
                                }}
                                onBlur={validateForm}
                                error={!!errors.window_ms}
                                helperText={errors.window_ms}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" size="large" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </Grid>
        </Grid>
    )
}
