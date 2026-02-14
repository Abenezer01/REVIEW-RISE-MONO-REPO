'use client';

import { useEffect, useState } from 'react';

import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useBusinessId } from '@/hooks/useBusinessId';

const AdRiseConfigurationPage = () => {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const { businessId } = useBusinessId();
  const [budgetConfig, setBudgetConfig] = useState({ lowMax: 500, midMax: 1500 });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const budgetCardTitle = 'Budget Band Configuration';
  const budgetCardDescription = 'Set low and mid budget thresholds used by AdRise warnings and budget band labels.';

  useEffect(() => {
    if (!businessId) return;
    const storageKey = `adrise_budget_config_${businessId}`;
    const stored = localStorage.getItem(storageKey);

    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      const lowMax = Math.max(1, Number(parsed?.lowMax || 500));
      const midMax = Math.max(lowMax + 1, Number(parsed?.midMax || 1500));

      setBudgetConfig({ lowMax, midMax });
    } catch (parseError) {
      console.error('Failed to parse AdRise budget config:', parseError);
    }
  }, [businessId]);

  const handleSave = () => {
    const lowMax = Math.max(1, Number(budgetConfig.lowMax || 1));
    const midMax = Math.max(1, Number(budgetConfig.midMax || 1));

    if (midMax <= lowMax) {
      setError('Mid max must be greater than low max.');

      return;
    }

    const nextConfig = { lowMax, midMax };

    setBudgetConfig(nextConfig);
    setError('');
    setSaved(true);

    if (businessId) {
      localStorage.setItem(`adrise_budget_config_${businessId}`, JSON.stringify(nextConfig));
    }

    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h3' sx={{ fontWeight: 700, mb: 0.5 }}>
          {t('navigation.ad-rise')}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {t('navigation.ad-rise-configuration')}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 8, lg: 6 }}>
        <Card>
          <CardContent sx={{ p: 6 }}>
            <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
              {budgetCardTitle}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
              {budgetCardDescription}
            </Typography>

            <Box sx={{ display: 'grid', gap: 4 }}>
              <TextField
                label='Low budget max'
                type='number'
                value={budgetConfig.lowMax}
                onChange={(event) => setBudgetConfig(prev => ({ ...prev, lowMax: Number(event.target.value || 0) }))}
                inputProps={{ min: 1 }}
                fullWidth
              />
              <TextField
                label='Mid budget max'
                type='number'
                value={budgetConfig.midMax}
                onChange={(event) => setBudgetConfig(prev => ({ ...prev, midMax: Number(event.target.value || 0) }))}
                inputProps={{ min: 1 }}
                helperText={`High budget starts above ${budgetConfig.midMax || 0}`}
                fullWidth
              />
            </Box>

            {error ? (
              <Typography variant='caption' color='error' sx={{ mt: 2, display: 'block' }}>
                {error}
              </Typography>
            ) : null}

            {saved ? (
              <Typography variant='caption' color='success.main' sx={{ mt: 2, display: 'block' }}>
                {t('adrise.status.saved')}
              </Typography>
            ) : null}

            <Box sx={{ mt: 4 }}>
              <Button variant='contained' onClick={handleSave}>
                {tc('common.save')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdRiseConfigurationPage;
