import { Box, Card, CardContent, Checkbox, Chip, FormControlLabel, Grid, Stack, Typography, alpha } from '@mui/material';
import { CheckCircle as CheckedIcon, RadioButtonUnchecked as UncheckedIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';

import { OPTIMIZATION_TASKS } from '../guides/optimization';

type Props = {
  isStepCompleted: (stepId: string) => boolean;
  onToggleStep: (stepId: string, completed: boolean) => void;
  isSaving?: boolean;
  t: any;
  theme: any;
};

const OptimizationTab = ({ isStepCompleted, onToggleStep, isSaving, t, theme }: Props) => {
  const getPlatformChip = (platform: 'google' | 'meta' | 'both') => {
    if (platform === 'google') return { label: 'Google', color: 'primary' as const };
    if (platform === 'meta') return { label: 'Meta', color: 'secondary' as const };

    return { label: 'Both', color: 'info' as const };
  };

  return (
    <Stack spacing={4} sx={{ '@media print': { mt: 4 } }}>
      {[3, 7, 14].map((day) => (
        <Box key={day}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUpIcon color="primary" /> {t('dayPostLaunch', { day })}
          </Typography>
          <Grid container spacing={4}>
            {OPTIMIZATION_TASKS.filter(task => task.day === day).map((task) => {
              const platformChip = getPlatformChip(task.platform);

              return (
                <Grid size={{ xs: 12, md: 6 }} key={task.id}>
                  <Card sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: isStepCompleted(task.id) ? alpha(theme.palette.success.main, 0.2) : 'divider',
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isStepCompleted(task.id)}
                            onChange={(e) => onToggleStep(task.id, e.target.checked)}
                            disabled={isSaving}
                            sx={{ '@media print': { display: 'none' } }}
                          />
                        }
                        label={
                          <Stack direction="row" spacing={3} alignItems="flex-start">
                            <Box sx={{
                              display: 'none',
                              mt: 1,
                              '@media print': { display: 'block' }
                            }}>
                              {isStepCompleted(task.id) ?
                                <CheckedIcon color="success" sx={{ fontSize: 20 }} /> :
                                <UncheckedIcon sx={{ fontSize: 20, color: '#ccc' }} />}
                            </Box>
                            <Box>
                              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                  {task.title}
                                </Typography>
                                <Chip label={platformChip.label} size="small" color={platformChip.color} variant="outlined" />
                              </Stack>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {task.description}
                              </Typography>
                            </Box>
                          </Stack>
                        }
                        sx={{ alignItems: 'flex-start', m: 0, '& .MuiCheckbox-root': { mt: -0.5 } }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Stack>
  );
};

export default OptimizationTab;
