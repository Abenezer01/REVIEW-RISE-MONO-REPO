/* eslint-disable import/no-unresolved */
'use client';

import { useState, useEffect } from 'react';

import { Box, Button, TextField, Typography, Card, CardContent, CardHeader, Divider, CircularProgress, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { useTranslations } from 'next-intl';

import type { BusinessDto, PaginatedResponse } from '@platform/contracts';

import { BrandProfileService } from '@/services/brand-profile.service';
import apiClient from '@/lib/apiClient';


const WebsiteConnectWizard = () => {
  const t = useTranslations('BrandProfiles');
  const [step, setStep] = useState(1);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [businesses, setBusinesses] = useState<BusinessDto[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  useEffect(() => {
    if (step === 2 && brandProfileId) {
      // Simulate extraction process
      const timer = setTimeout(() => {
        setStep(3); // Advance to preview step after a delay
      }, 3000); // 3 seconds delay for demonstration

      return () => clearTimeout(timer);
    } else if (step === 3 && brandProfileId && !brandProfile) {
      const fetchBrandProfile = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const profile = await BrandProfileService.getBrandProfile(brandProfileId);

          setBrandProfile(profile);
        } catch (err: any) {
          setError(err.message || 'Failed to fetch brand profile.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchBrandProfile();
    }
  }, [step, brandProfileId, brandProfile]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<PaginatedResponse<BusinessDto>>('/admin/businesses', {
          params: { limit: 100 } // Fetch up to 100 businesses
        });

        setBusinesses(response.data.data || []);

        if (response.data.data && response.data.data.length > 0) {
          setSelectedBusinessId(response.data.data[0].id); // Select the first business by default
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch businesses.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWebsiteUrl(event.target.value);
    setIsValidUrl(true); // Reset validation on change
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);

      return true;
    } catch (err) {
      console.log(err);

      return false;
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (validateUrl(websiteUrl)) {
        setIsLoading(true);
        setError(null);

        try {
          const response = await BrandProfileService.onboardBrandProfile(selectedBusinessId as string, websiteUrl);

          setBrandProfileId(response.brandProfileId);
          setStep(step + 1);
        } catch (err: any) {
          setError(err.message || 'Failed to onboard brand profile.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsValidUrl(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleConfirmExtraction = async () => {
    if (brandProfileId) {
      setIsLoading(true);
      setError(null);

      try {
        await BrandProfileService.confirmExtraction(brandProfileId);
        setStep(step + 1); // Advance to step 4 (confirmation)
      } catch (err: any) {
        setError(err.message || 'Failed to confirm extraction.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('wizard.step1.title')}
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="business-select-label">{t('wizard.step1.businessSelectLabel')}</InputLabel>
              <Select
                labelId="business-select-label"
                value={selectedBusinessId || ''}
                label={t('wizard.step1.businessSelectLabel')}
                onChange={(e) => setSelectedBusinessId(e.target.value as string)}
                disabled={isLoading || businesses.length === 0}
              >
                {businesses.map((business) => (
                  <MenuItem key={business.id} value={business.id}>
                    {business.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t('wizard.step1.urlInputLabel')}
              variant="outlined"
              value={websiteUrl}
              onChange={handleUrlChange}
              error={!isValidUrl}
              helperText={!isValidUrl && t('wizard.step1.invalidUrlError')}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleNext} disabled={!websiteUrl || isLoading || !selectedBusinessId}>
              {isLoading && <CircularProgress size={24} sx={{ mr: 1 }} />}
              {t('wizard.step1.nextButton')}
            </Button>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            {error ? (
              <>
                <Typography color="error" variant="h6" gutterBottom>
                  {t('wizard.step2.errorTitle')}
                </Typography>
                <Typography color="error">{error}</Typography>
                <Button variant="contained" onClick={() => setStep(1)} sx={{ mt: 2 }}>
                  {t('wizard.step2.tryAgainButton')}
                </Button>
              </>
            ) : (
              <>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t('wizard.step2.title')}
                </Typography>
                <Typography>{t('wizard.step2.description')}</Typography>
              </>
            )}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('wizard.step3.title')}
            </Typography>
            {isLoading ? (
              <CircularProgress />
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : brandProfile ? (
              <Box>
                <Typography variant="h5" gutterBottom>{brandProfile.currentExtractedData?.title || brandProfile.websiteUrl}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>{brandProfile.currentExtractedData?.description}</Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6">Colors</Typography>
                <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                  {brandProfile.currentExtractedData?.colors?.map((c: any, i: number) => (
                    <Box key={i} sx={{
                      width: 40, height: 40, borderRadius: '50%',
                      bgcolor: c.hexCode, border: '1px solid #ccc'
                    }} title={c.hexCode} />
                  ))}
                  {(!brandProfile.currentExtractedData?.colors || brandProfile.currentExtractedData?.colors.length === 0) && <Typography variant="body2">No colors found</Typography>}
                </Box>

                <Typography variant="h6" sx={{ mt: 2 }}>Assets</Typography>
                <Box sx={{ display: 'flex', gap: 2, my: 1, flexWrap: 'wrap' }}>
                  {brandProfile.currentExtractedData?.assets?.map((a: any, i: number) => (
                    <Box key={i} sx={{ border: '1px solid #eee', p: 1, borderRadius: 1 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.url} alt={a.altText || a.type} style={{ maxHeight: 60, maxWidth: '100%' }} />
                      <Typography variant="caption" display="block">{a.type}</Typography>
                    </Box>
                  ))}
                  {(!brandProfile.currentExtractedData?.assets || brandProfile.currentExtractedData?.assets.length === 0) && <Typography variant="body2">No assets found</Typography>}
                </Box>

                <Typography variant="h6" sx={{ mt: 2 }}>Fonts</Typography>
                <Box sx={{ my: 1 }}>
                  {brandProfile.currentExtractedData?.fonts?.map((f: any, i: number) => (
                    <Chip key={i} label={f.family} sx={{ mr: 1 }} />
                  ))}
                  {(!brandProfile.currentExtractedData?.fonts || brandProfile.currentExtractedData?.fonts.length === 0) && <Typography variant="body2">No fonts found</Typography>}
                </Box>

                <Typography variant="h6" sx={{ mt: 2 }}>Socials</Typography>
                <Box sx={{ my: 1 }}>
                  {brandProfile.currentExtractedData?.socialLinks?.map((s: any, i: number) => (
                    <Chip key={i} label={s.platform} component="a" href={s.url} clickable target="_blank" sx={{ mr: 1 }} />
                  ))}
                  {(!brandProfile.currentExtractedData?.socialLinks || brandProfile.currentExtractedData?.socialLinks.length === 0) && <Typography variant="body2">No social links found</Typography>}
                </Box>

                <Button variant="contained" onClick={handleConfirmExtraction} sx={{ mt: 3 }} disabled={isLoading}>
                  {t('wizard.step3.confirmButton')}
                </Button>
              </Box>
            ) : (
              <Typography>{t('wizard.step3.description')}</Typography>
            )}
          </Box>
        );
      case 4:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('wizard.step4.title')}
            </Typography>
            {error ? (
              <>
                <Typography color="error">{error}</Typography>
                <Button variant="contained" onClick={() => setStep(1)} sx={{ mt: 2 }}>
                  {t('wizard.step4.tryAgainButton')}
                </Button>
              </>
            ) : (
              <>
                <Typography>{t('wizard.step4.description')}</Typography>
                <Button variant="contained" color="primary" onClick={() => {
                  setStep(1);
                  setWebsiteUrl('');
                  setBrandProfileId(null);
                  setBrandProfile(null);
                  setError(null);
                }} sx={{ mt: 2 }}>
                  {t('wizard.step4.newExtractionButton')}
                </Button>
              </>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader title={t('wizard.title')} />
      <Divider />
      <CardContent>
        {renderStepContent()}
      </CardContent>
    </Card>
  );
};

export default WebsiteConnectWizard;
