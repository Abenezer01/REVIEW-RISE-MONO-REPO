/* eslint-disable import/no-unresolved */
'use client'

import { useState } from 'react'

import { toast } from 'react-toastify'

import { Box, Card, CardContent, CardHeader, TextField, FormControlLabel, Switch, Checkbox, Button, Grid, MenuItem, Typography, Divider } from '@mui/material'
import { PageHeader } from '@platform/shared-ui'

import { type SystemSettingsData, updateSystemSettings } from '@/app/actions/system-settings'

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Tokyo'
]

export default function SystemSettingsClient({ initialSettings }: { initialSettings: SystemSettingsData }) {
  const [settings, setSettings] = useState(initialSettings)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.site_logo || null)
  const [saving, setSaving] = useState(false)

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      setLogoFile(file)
      const reader = new FileReader()

      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
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

    const res = await updateSystemSettings(formData)

    setSaving(false)

    if (res.success) {
      toast.success('Settings updated successfully')
    } else {
      toast.error(res.error || 'Failed to update settings')
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title="System Settings"
        subtitle="Configure global system parameters"
      />

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
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Site Title"
                  value={settings.site_title}
                  onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Footer Text"
                  value={settings.footer_text}
                  onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Site Logo</Typography>
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
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
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
                            mx: 'auto'
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
                      onChange={(e) => setSettings({
                        ...settings,
                        notification_defaults: { ...settings.notification_defaults, email: e.target.checked }
                      })}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.notification_defaults.sms}
                      onChange={(e) => setSettings({
                        ...settings,
                        notification_defaults: { ...settings.notification_defaults, sms: e.target.checked }
                      })}
                    />
                  }
                  label="SMS Notifications"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.notification_defaults.push}
                      onChange={(e) => setSettings({
                        ...settings,
                        notification_defaults: { ...settings.notification_defaults, push: e.target.checked }
                      })}
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
                  onChange={(e) => setSettings({
                    ...settings,
                    rate_limit_config: { ...settings.rate_limit_config, strategy: e.target.value }
                  })}
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
                  onChange={(e) => setSettings({
                    ...settings,
                    rate_limit_config: { ...settings.rate_limit_config, max_requests: Number(e.target.value) }
                  })}
                />
                <TextField
                  label="Window (ms)"
                  type="number"
                  fullWidth
                  value={settings.rate_limit_config.window_ms}
                  onChange={(e) => setSettings({
                    ...settings,
                    rate_limit_config: { ...settings.rate_limit_config, window_ms: Number(e.target.value) }
                  })}
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
    </Box>
  )
}
