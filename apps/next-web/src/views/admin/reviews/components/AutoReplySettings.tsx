'use client';

import React, { useState } from 'react';

import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Stack,
  Switch,
  RadioGroup,
  Radio,
  Slider,
  TextField,
  Button,
  Divider,
  Grid,
  alpha,
  CircularProgress,
  Paper,
  Tooltip,
  IconButton
} from '@mui/material';
import type { Theme } from '@mui/material';
import {
  SmartToy as RobotIcon,
  Timer as TimerIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  InfoOutlined as InfoIcon,
  CheckCircleOutline as CheckIcon,
  History as HistoryIcon,
  SentimentSatisfiedAlt as PositiveIcon,
  SentimentSatisfied as NeutralIcon,
  Star as StarIcon,
  AutoGraph as StepIcon,
  RecordVoiceOver as VoiceIcon
} from '@mui/icons-material';
import { useSystemMessages } from '@/shared/components/SystemMessageProvider';
import { SystemMessageCode } from '@platform/contracts';

interface AutoReplySettingsProps {
  profile: any;
  onUpdate: (data: any) => Promise<void>;
  isUpdating?: boolean;
}

const AutoReplySettings: React.FC<AutoReplySettingsProps> = ({ profile, onUpdate, isUpdating }) => {
  const { notify } = useSystemMessages();
  const [settings, setSettings] = useState(profile.autoReplySettings || {
    enabled: false,
    mode: 'positive', // 'positive' | 'positive_neutral'
    manualNegativeApproval: true,
    delayHours: 2,
    maxRepliesPerDay: 50
  });

  // Update internal settings when profile changes (e.g. when switching businesses)
  React.useEffect(() => {
    if (profile) {
      setSettings(profile.autoReplySettings || {
        enabled: false,
        mode: 'positive',
        manualNegativeApproval: true,
        delayHours: 2,
        maxRepliesPerDay: 50
      });
    }
  }, [profile]);

  const handleToggleEnabled = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev: any) => ({ ...prev, enabled: event.target.checked }));
  };

  const handleChangeMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev: any) => ({ ...prev, mode: event.target.value }));
  };

  const handleToggleManualNegative = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev: any) => ({ ...prev, manualNegativeApproval: event.target.checked }));
  };

  const handleDelayChange = (_: Event, newValue: number | number[]) => {
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
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={6}>
            {/* Main Toggle Section */}
            <Paper 
              elevation={0}
              variant="outlined"
              sx={{ 
                p: 5,
                borderRadius: 3,
                borderWidth: 2,
                borderColor: settings.enabled ? 'primary.main' : 'divider',
                bgcolor: (theme: Theme) => settings.enabled ? alpha(theme.palette.primary.main, 0.02) : 'background.paper',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={4} alignItems="center">
                  <Avatar 
                    variant="rounded"
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, settings.enabled ? 0.15 : 0.05),
                      color: settings.enabled ? 'primary.main' : 'text.disabled',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <RobotIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="700" gutterBottom>
                      AI Auto-Reply System
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450 }}>
                      When enabled, our AI will automatically respond to reviews based on your configuration, using your brand voice and tone.
                    </Typography>
                  </Box>
                </Stack>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="overline" display="block" color={settings.enabled ? 'primary' : 'text.disabled'} sx={{ mb: 1, fontWeight: 700 }}>
                    {settings.enabled ? 'System Active' : 'System Paused'}
                  </Typography>
                  <Switch 
                    checked={settings.enabled} 
                    onChange={handleToggleEnabled}
                    color="primary"
                    sx={{ transform: 'scale(1.2)' }}
                  />
                </Box>
              </Stack>
            </Paper>

            {settings.enabled && (
              <Stack spacing={6}>
                {/* Rules & Logic */}
                <Card elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardHeader 
                    title="Response Rules" 
                    subheader="Define which reviews should trigger an automatic response"
                    avatar={<Avatar sx={{ bgcolor: alpha('#4f46e5', 0.1), color: '#4f46e5' }}><SettingsIcon /></Avatar>}
                  />
                  <Divider />
                  <CardContent sx={{ p: 5 }}>
                    <Stack spacing={5}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                          Target Sentiment
                          <Tooltip title="Choose which rating levels should receive automated replies">
                            <IconButton size="small"><InfoIcon fontSize="inherit" /></IconButton>
                          </Tooltip>
                        </Typography>
                        <RadioGroup value={settings.mode} onChange={handleChangeMode}>
                          <Grid container spacing={4}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Paper 
                                variant="outlined" 
                                sx={{ 
                                  p: 4, 
                                  cursor: 'pointer',
                                  position: 'relative',
                                  borderRadius: 4,
                                  borderWidth: 2,
                                  borderColor: settings.mode === 'positive' ? 'primary.main' : 'divider',
                                  bgcolor: settings.mode === 'positive' ? alpha('#4f46e5', 0.05) : 'background.paper',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: settings.mode === 'positive' ? (theme: Theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}` : 'none',
                                  '&:hover': {
                                    borderColor: 'primary.main',
                                    transform: 'translateY(-4px)',
                                    boxShadow: (theme: Theme) => `0 12px 32px ${alpha(theme.palette.primary.main, 0.1)}`
                                  }
                                }}
                                onClick={() => setSettings((p: any) => ({ ...p, mode: 'positive' }))}
                              >
                                <Stack spacing={3}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Avatar 
                                      sx={{ 
                                        bgcolor: settings.mode === 'positive' ? 'primary.main' : alpha('#4f46e5', 0.1),
                                        color: settings.mode === 'positive' ? 'white' : 'primary.main',
                                        width: 44,
                                        height: 44
                                      }}
                                    >
                                      <PositiveIcon />
                                    </Avatar>
                                    <Radio 
                                      value="positive" 
                                      checked={settings.mode === 'positive'}
                                      sx={{ p: 0 }}
                                    />
                                  </Stack>
                                  
                                  <Box>
                                    <Typography variant="h6" fontWeight="800" sx={{ mb: 0.5 }}>
                                      Positive Only
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                                      Best for businesses wanting to only automate high-praise reviews.
                                    </Typography>
                                    
                                    <Stack direction="row" spacing={1}>
                                      {[4, 5].map((star) => (
                                        <Box 
                                          key={star}
                                          sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 0.5,
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 2,
                                            bgcolor: alpha('#f59e0b', 0.1),
                                            color: '#f59e0b'
                                          }}
                                        >
                                          <Typography variant="caption" fontWeight="700">{star}</Typography>
                                          <StarIcon sx={{ fontSize: 12 }} />
                                        </Box>
                                      ))}
                                    </Stack>
                                  </Box>
                                </Stack>
                              </Paper>
                            </Grid>
                            
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Paper 
                                variant="outlined" 
                                sx={{ 
                                  p: 4, 
                                  cursor: 'pointer',
                                  position: 'relative',
                                  borderRadius: 4,
                                  borderWidth: 2,
                                  borderColor: settings.mode === 'positive_neutral' ? 'primary.main' : 'divider',
                                  bgcolor: settings.mode === 'positive_neutral' ? alpha('#4f46e5', 0.05) : 'background.paper',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: settings.mode === 'positive_neutral' ? (theme: Theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}` : 'none',
                                  '&:hover': {
                                    borderColor: 'primary.main',
                                    transform: 'translateY(-4px)',
                                    boxShadow: (theme: Theme) => `0 12px 32px ${alpha(theme.palette.primary.main, 0.1)}`
                                  }
                                }}
                                onClick={() => setSettings((p: any) => ({ ...p, mode: 'positive_neutral' }))}
                              >
                                <Stack spacing={3}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Avatar 
                                      sx={{ 
                                        bgcolor: settings.mode === 'positive_neutral' ? 'primary.main' : alpha('#4f46e5', 0.1),
                                        color: settings.mode === 'positive_neutral' ? 'white' : 'primary.main',
                                        width: 44,
                                        height: 44
                                      }}
                                    >
                                      <NeutralIcon />
                                    </Avatar>
                                    <Radio 
                                      value="positive_neutral" 
                                      checked={settings.mode === 'positive_neutral'}
                                      sx={{ p: 0 }}
                                    />
                                  </Stack>
                                  
                                  <Box>
                                    <Typography variant="h6" fontWeight="800" sx={{ mb: 0.5 }}>
                                      Positive + Neutral
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                                      Comprehensive coverage including 3-star reviews for maximum efficiency.
                                    </Typography>
                                    
                                    <Stack direction="row" spacing={1}>
                                      {[3, 4, 5].map((star) => (
                                        <Box 
                                          key={star}
                                          sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 0.5,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 2,
                                            bgcolor: alpha('#f59e0b', 0.1),
                                            color: '#f59e0b'
                                          }}
                                        >
                                          <Typography variant="caption" fontWeight="700">{star}</Typography>
                                          <StarIcon sx={{ fontSize: 12 }} />
                                        </Box>
                                      ))}
                                    </Stack>
                                  </Box>
                                </Stack>
                              </Paper>
                            </Grid>
                          </Grid>
                        </RadioGroup>
                      </Box>

                      <Divider />

                      <Box sx={{ 
                        p: 4, 
                        borderRadius: 3, 
                        bgcolor: (theme: Theme) => alpha(theme.palette.error.main, 0.02),
                        border: (theme: Theme) => `1px dashed ${alpha(theme.palette.error.main, 0.2)}`
                      }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2" fontWeight="800" color="error.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              Negative Review Safeguard
                              <Avatar sx={{ width: 20, height: 20, bgcolor: 'error.main', fontSize: 10, fontWeight: 900 }}>!</Avatar>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              Always hold 1 & 2 star reviews for manual approval before posting.
                            </Typography>
                          </Box>
                          <Switch 
                            checked={settings.manualNegativeApproval} 
                            onChange={handleToggleManualNegative}
                            color="error"
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Timing & Capacity */}
                <Card elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardHeader 
                    title="Timing & Delivery" 
                    subheader="Control when and how often replies are sent"
                    avatar={<Avatar sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }}><TimerIcon /></Avatar>}
                  />
                  <Divider />
                  <CardContent sx={{ p: 5 }}>
                    <Stack spacing={5}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="700">Reply Delay</Typography>
                            <Typography variant="body2" color="text.secondary">Wait time to make AI replies look more natural</Typography>
                          </Box>
                          <Typography variant="h6" color="primary.main" fontWeight="700">
                            {settings.delayHours} {settings.delayHours === 1 ? 'hour' : 'hours'}
                          </Typography>
                        </Stack>
                        <Box sx={{ px: 2 }}>
                          <Slider
                            value={settings.delayHours}
                            min={0}
                            max={24}
                            step={1}
                            marks={[
                              { value: 0, label: 'Instant' },
                              { value: 6, label: '6h' },
                              { value: 12, label: '12h' },
                              { value: 18, label: '18h' },
                              { value: 24, label: '24h' }
                            ]}
                            onChange={handleDelayChange}
                            valueLabelDisplay="auto"
                          />
                        </Box>
                      </Box>

                      <Divider />

                      <Box>
                        <Grid container spacing={4} alignItems="center">
                          <Grid size={{ xs: 12, sm: 8 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', width: 40, height: 40 }}>
                                <SecurityIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="700">Daily Reply Limit</Typography>
                                <Typography variant="body2" color="text.secondary">Maximum automated replies per 24-hour period</Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              type="number"
                              fullWidth
                              value={settings.maxRepliesPerDay}
                              onChange={handleMaxRepliesChange}
                              slotProps={{
                                input: {
                                  startAdornment: <HistoryIcon sx={{ mr: 2, color: 'text.disabled' }} />,
                                },
                                htmlInput: {
                                  min: 1,
                                  max: 1000
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={isUpdating}
                sx={{ 
                  px: 8, 
                  py: 1.5, 
                  borderRadius: 2,
                  boxShadow: (theme: Theme) => `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                {isUpdating ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={6}>
            <Card 
              elevation={0} 
              variant="outlined" 
              sx={{ 
                borderRadius: 3, 
                bgcolor: 'background.paper',
                border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                p: 5, 
                bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.03),
                borderBottom: (theme: Theme) => `1px solid ${theme.palette.divider}`
              }}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar 
                    variant="rounded"
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      width: 40,
                      height: 40,
                      boxShadow: (theme: Theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
                    }}
                  >
                    <StepIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="800">Quick Guide</Typography>
                    <Typography variant="caption" color="text.secondary">How the workflow handles reviews</Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 5 }}>
                <Stack spacing={2} sx={{ position: 'relative' }}>
                  {/* Vertical Line Connector */}
                  <Box sx={{ 
                    position: 'absolute', 
                    left: 17, 
                    top: 20, 
                    bottom: 20, 
                    width: 2, 
                    bgcolor: (theme: Theme) => alpha(theme.palette.divider, 0.8),
                    zIndex: 0
                  }} />

                  {[
                    { step: 1, title: 'Sentiment Analysis', desc: 'New reviews are analyzed for star rating and content sentiment.' },
                    { step: 2, title: 'AI Generation', desc: 'Replies are crafted using your unique Brand Voice and response patterns.' },
                    { step: 3, title: 'Natural Delay', desc: 'Replies wait for your configured delay period before being queued for posting.' },
                    { step: 4, title: 'Manual Review', desc: 'Negative or flagged reviews are always held for your human approval.' }
                  ].map((item) => (
                    <Box key={item.step} sx={{ 
                      display: 'flex', 
                      gap: 4,
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'transparent',
                      position: 'relative',
                      zIndex: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.04),
                        transform: 'translateX(4px)',
                        '& .step-number': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          transform: 'scale(1.1)'
                        }
                      }
                    }}>
                      <Avatar 
                        className="step-number"
                        sx={{ 
                          width: 34, 
                          height: 34, 
                          fontSize: 14, 
                          fontWeight: 800,
                          bgcolor: 'background.paper',
                          color: 'primary.main',
                          border: (theme: Theme) => `2px solid ${theme.palette.primary.main}`,
                          boxShadow: (theme: Theme) => `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        {item.step}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'text.primary' }}>{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.5 }}>
                          {item.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card 
              elevation={0} 
              variant="outlined" 
              sx={{ 
                borderRadius: 3, 
                bgcolor: 'background.paper',
                border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <Box sx={{ 
                position: 'absolute', 
                top: -15, 
                right: -15, 
                width: 120, 
                height: 120, 
                bgcolor: (theme: Theme) => alpha(theme.palette.success.main, 0.04),
                borderRadius: '50%',
                zIndex: 0
              }} />

              <Box sx={{ 
                p: 5, 
                bgcolor: (theme: Theme) => alpha(theme.palette.success.main, 0.03),
                borderBottom: (theme: Theme) => `1px solid ${theme.palette.divider}`,
                position: 'relative',
                zIndex: 1
              }}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar 
                    variant="rounded"
                    sx={{ 
                      bgcolor: 'success.main', 
                      color: 'white',
                      width: 40,
                      height: 40,
                      boxShadow: (theme: Theme) => `0 4px 12px ${alpha(theme.palette.success.main, 0.25)}`
                    }}
                  >
                    <VoiceIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="800">Brand Voice</Typography>
                    <Typography variant="caption" color="text.secondary">Personality & Tone</Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                <Stack spacing={4} alignItems="center" textAlign="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight="800" color="success.dark" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                      <CheckIcon fontSize="small" /> Status: Active
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.6 }}>
                      Your responses will automatically reflect your established brand personality and values across all platforms.
                    </Typography>
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    size="medium" 
                    color="success"
                    fullWidth
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 2,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        bgcolor: (theme: Theme) => alpha(theme.palette.success.main, 0.04)
                      }
                    }}
                  >
                    Configure Brand Voice
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AutoReplySettings;
