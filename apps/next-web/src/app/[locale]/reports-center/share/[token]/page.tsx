'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { Box, Button, Card, CardContent, Stack, TextField, Typography, alpha } from '@mui/material';
import { useTranslations } from 'next-intl';

import apiClient from '@/lib/apiClient';

const ShareReportPage = () => {
  const t = useTranslations('dashboard');
  const params = useParams();
  const token = params.token as string;

  const [html, setHtml] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchShare = useCallback(async (passwordValue?: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      if (passwordValue) {
        await apiClient.post(
          `/api/v1/reports-center/share/${token}/verify`,
          { password: passwordValue },
          { headers: { 'x-skip-system-message': '1' } }
        );
      }

      const response = await apiClient.get<any>(`/api/v1/reports-center/share/${token}`, {
        params: passwordValue ? { password: passwordValue } : undefined,
        headers: { 'x-skip-system-message': '1' }
      });

      const payload = response.data || {};
      const htmlValue = payload?.html ?? payload?.data?.html ?? null;

      if (!htmlValue) {
        setErrorMessage(t('reportsCenter.share.loadFailed'));
        setHtml(null);
      } else {
        setHtml(htmlValue);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setErrorMessage(t('reportsCenter.share.passwordInvalid'));
      } else {
        const message =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          t('reportsCenter.share.loadFailed');

        setErrorMessage(message);
      }
    } finally {
      setLoading(false);
    }
  }, [t, token]);

  useEffect(() => {
    if (token) fetchShare();
  }, [token, fetchShare]);

  if (loading) {
    return (
      <Box sx={{ py: 6 }}>
        <Typography color="text.secondary">{t('reportsCenter.share.loading')}</Typography>
      </Box>
    );
  }

  if (errorMessage && !html) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `radial-gradient(circle at top, ${alpha('#2563EB', 0.2)}, transparent 55%), #f8fafc`,
          py: 10,
          px: 2
        }}
      >
        <Card sx={{ maxWidth: 520, mx: 'auto', borderRadius: 4, boxShadow: '0 30px 80px rgba(15, 23, 42, 0.18)' }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, #0F172A, #1D4ED8)',
                color: '#fff',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: 2,
                    background: '#fff',
                    color: '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 18
                  }}
                >
                  {t('reportsCenter.preview.logoFallback')}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {t('reportsCenter.share.title')}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {t('reportsCenter.share.passwordRequired')}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Box sx={{ p: 4 }}>
              <Stack spacing={2}>
                <Typography color="text.secondary">{errorMessage}</Typography>
                <TextField
                  type="password"
                  label={t('reportsCenter.share.password')}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  fullWidth
                />
                <Button variant="contained" size="large" onClick={() => fetchShare(password)}>
                  {t('reportsCenter.share.unlock')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `radial-gradient(circle at top, ${alpha('#2563EB', 0.12)}, transparent 60%), #eef2f7`,
        py: { xs: 6, md: 8 },
        px: { xs: 2, md: 4 }
      }}
    >
      <Box sx={{ maxWidth: 1160, mx: 'auto' }}>
        <Box
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha('#0f172a', 0.08),
            backgroundColor: 'background.paper',
            boxShadow: '0 30px 80px rgba(15, 23, 42, 0.12)'
          }}
        >
          <Box
            component="iframe"
            title={t('reportsCenter.share.previewTitle')}
            srcDoc={html || '<div style=\"padding:24px;font-family:Helvetica,Arial,sans-serif;\">No content.</div>'}
            sx={{
              width: '100%',
              minHeight: { xs: 720, md: 980 },
              border: 0,
              backgroundColor: '#ffffff'
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ShareReportPage;
