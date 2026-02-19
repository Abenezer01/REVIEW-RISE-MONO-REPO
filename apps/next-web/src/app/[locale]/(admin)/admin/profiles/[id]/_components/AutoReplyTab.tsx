'use client';

import React, { useState } from 'react';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  Slider,
  TextField,
  Button,
  Divider,
  Grid,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  SmartToy as RobotIcon,
  Timer as TimerIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Save as SaveIcon
} from '@mui/icons-material';

import { useTranslations } from 'next-intl';

import { SystemMessageCode } from '@platform/contracts';

import { useSystemMessages } from '@/shared/components/SystemMessageProvider';

import type { BrandProfile } from '@/services/brand-profile.service';

interface AutoReplyTabProps {
  profile: BrandProfile;
  onUpdate: (data: any) => Promise<void>;
  isUpdating?: boolean;
}

const AutoReplyTab: React.FC<AutoReplyTabProps> = ({ profile, onUpdate, isUpdating }) => {
  const t = useTranslations('dashboard');
  const { notify } = useSystemMessages();

  const [settings, setSettings] = useState(profile.autoReplySettings || {
    enabled: false,
    mode: 'positive', // 'positive' | 'positive_neutral'
    manualNegativeApproval: true,
    delayHours: 2,
    maxRepliesPerDay: 50
  });

  const handleToggleEnabled = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev: any) => ({ ...prev, enabled: event.target.checked }));
  };

  const handleChangeMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev: any) => ({ ...prev, mode: event.target.value }));
  };

  const handleToggleManualNegative = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev: any) => ({ ...prev, manualNegativeApproval: event.target.checked }));
  };

  const handleDelayChange = (event: Event, newValue: number | number[]) => {
    setSettings((prev: any) => ({ ...prev, delayHours: newValue as number }));
  };

  const handleMaxRepliesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev: any) => ({ ...prev, maxRepliesPerDay: parseInt(event.target.value, 10) || 0 }));
  };

  const handleSave = async () => {
    try {
      await onUpdate({ autoReplySettings: settings });
      notify(SystemMessageCode.SAVE_SUCCESS);
    } catch {
      notify(SystemMessageCode.SAVE_FAILED);
    }
  };

  return (
    <Box>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={4}>
            {/* Main Toggle */}
            <Card variant="outlined" sx={{ borderColor: settings.enabled ? 'primary.main' : 'divider' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main'
                      }}
                    >
                      <RobotIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="700">{t('autoReply.title')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('autoReply.description')}
                      </Typography>
                    </Box>
                  </Stack>
                  <Switch 
                    checked={settings.enabled} 
                    onChange={handleToggleEnabled}
                    color="primary"
                  />
                </Stack>
              </CardContent>
            </Card>

            {settings.enabled && (
              <>
                {/* Rules Section */}
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={3}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SettingsIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle1" fontWeight="700">{t('autoReply.responseRules')}</Typography>
                      </Stack>
                      
                      <Box>
                        <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>{t('autoReply.rulesSubtitle')}</Typography>
                        <RadioGroup value={settings.mode} onChange={handleChangeMode}>
                          <FormControlLabel 
                            value="positive" 
                            control={<Radio size="small" />} 
                            label={<Typography variant="body2">{t('autoReply.positiveOnly')}</Typography>}
                          />
                          <FormControlLabel 
                            value="positive_neutral" 
                            control={<Radio size="small" />} 
                            label={<Typography variant="body2">{t('autoReply.positiveNeutral')}</Typography>}
                          />
                        </RadioGroup>
                      </Box>

                      <Divider />

                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" fontWeight="600">{t('autoReply.negativeSafeguard')}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('autoReply.negativeSafeguardDesc')}
                            </Typography>
                          </Box>
                          <Switch 
                            checked={settings.manualNegativeApproval} 
                            onChange={handleToggleManualNegative}
                            size="small"
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Delay & Safety Section */}
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={4}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TimerIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle1" fontWeight="700">{t('autoReply.timingDelivery')}</Typography>
                      </Stack>

                      <Box sx={{ px: 1 }}>
                        <Typography variant="body2" fontWeight="600" gutterBottom>
                          {t('autoReply.replyDelay')}: {settings.delayHours} {settings.delayHours === 1 ? t('autoReply.hour') : t('autoReply.hours')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {t('autoReply.delayDesc')}
                        </Typography>
                        <Slider
                          value={settings.delayHours}
                          min={0}
                          max={24}
                          step={1}
                          marks={[
                            { value: 0, label: t('autoReply.instant') },
                            { value: 12, label: '12h' },
                            { value: 24, label: '24h' }
                          ]}
                          onChange={handleDelayChange}
                          valueLabelDisplay="auto"
                        />
                      </Box>

                      <Divider />

                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                          <SecurityIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle1" fontWeight="700">{t('autoReply.securitySafeguards')}</Typography>
                        </Stack>
                        
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: 12, sm: 8 }}>
                            <Typography variant="body2" fontWeight="600">{t('autoReply.dailyLimit')}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('autoReply.limitDesc')}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              type="number"
                              size="small"
                              fullWidth
                              value={settings.maxRepliesPerDay}
                              onChange={handleMaxRepliesChange}
                              InputProps={{ inputProps: { min: 1, max: 1000 } }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={isUpdating}
                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              >
                {t('autoReply.saveSettings')}
              </Button>
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ bgcolor: (theme) => alpha(theme.palette.info.main, 0.02) }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="700" color="info.main" gutterBottom>
                {t('autoReply.quickGuide')}
              </Typography>
              <Stack spacing={2}>
                <Typography variant="body2">
                  {t('autoReply.steps.sentiment.desc')}
                </Typography>
                <Typography variant="body2">
                  {t('autoReply.steps.ai.desc')}
                </Typography>
                <Typography variant="body2">
                  {t('autoReply.steps.delay.desc')}
                </Typography>
                <Typography variant="body2">
                  {t('autoReply.steps.manual.desc')}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AutoReplyTab;
