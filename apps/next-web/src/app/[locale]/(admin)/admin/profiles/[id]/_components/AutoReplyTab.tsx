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
import toast from 'react-hot-toast';

import type { BrandProfile } from '@/services/brand-profile.service';

interface AutoReplyTabProps {
  profile: BrandProfile;
  onUpdate: (data: any) => Promise<void>;
  isUpdating?: boolean;
}

const AutoReplyTab: React.FC<AutoReplyTabProps> = ({ profile, onUpdate, isUpdating }) => {
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
      toast.success('Auto-reply settings updated');
    } catch {
      toast.error('Failed to update auto-reply settings');
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
                      <Typography variant="h6" fontWeight="700">Auto-Reply System</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enable or disable automated AI responses to your reviews.
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
                        <Typography variant="subtitle1" fontWeight="700">Reply Rules</Typography>
                      </Stack>
                      
                      <Box>
                        <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>Which reviews should we auto-reply to?</Typography>
                        <RadioGroup value={settings.mode} onChange={handleChangeMode}>
                          <FormControlLabel 
                            value="positive" 
                            control={<Radio size="small" />} 
                            label={<Typography variant="body2">Positive only (4 & 5 stars)</Typography>} 
                          />
                          <FormControlLabel 
                            value="positive_neutral" 
                            control={<Radio size="small" />} 
                            label={<Typography variant="body2">Positive + Neutral (3, 4 & 5 stars)</Typography>} 
                          />
                        </RadioGroup>
                      </Box>

                      <Divider />

                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" fontWeight="600">Manual approval for negative reviews</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Always hold 1 & 2 star reviews for your review.
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
                        <Typography variant="subtitle1" fontWeight="700">Timing & Limits</Typography>
                      </Stack>

                      <Box sx={{ px: 1 }}>
                        <Typography variant="body2" fontWeight="600" gutterBottom>
                          Reply Delay: {settings.delayHours} {settings.delayHours === 1 ? 'hour' : 'hours'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Wait time before posting the automated reply to make it look natural.
                        </Typography>
                        <Slider
                          value={settings.delayHours}
                          min={0}
                          max={24}
                          step={1}
                          marks={[
                            { value: 0, label: 'Instant' },
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
                          <Typography variant="subtitle1" fontWeight="700">Safety Safeguards</Typography>
                        </Stack>
                        
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: 12, sm: 8 }}>
                            <Typography variant="body2" fontWeight="600">Max auto-replies per day</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Limit the number of automated replies across all locations.
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
                Save Settings
              </Button>
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ bgcolor: (theme) => alpha(theme.palette.info.main, 0.02) }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="700" color="info.main" gutterBottom>
                How Auto-Reply Works
              </Typography>
              <Stack spacing={2}>
                <Typography variant="body2">
                  1. New reviews are detected and analyzed for sentiment.
                </Typography>
                <Typography variant="body2">
                  2. If the review matches your rules, an AI reply is generated using your <strong>Brand Voice</strong> and <strong>Tone</strong>.
                </Typography>
                <Typography variant="body2">
                  3. After the configured delay, the reply is either posted automatically or sent to your <strong>Pending Queue</strong>.
                </Typography>
                <Typography variant="body2">
                  4. Negative reviews are always held for approval if that setting is enabled.
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
