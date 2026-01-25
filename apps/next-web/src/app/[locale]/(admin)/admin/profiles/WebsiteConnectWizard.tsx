/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

import { useState, useEffect } from 'react';

import { 
  Box, 
  Button, 
  TextField, 
  Typography,
  CircularProgress, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Chip,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Stack,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import { 
  Language as WebIcon, 
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  AutoAwesome as MagicIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';

import type { BusinessDto, PaginatedResponse } from '@platform/contracts';

import { BrandProfileService } from '@/services/brand-profile.service';
import apiClient from '@/lib/apiClient';

interface WebsiteConnectWizardProps {
  onSuccess?: () => void;
}

const WebsiteConnectWizard = ({ onSuccess }: WebsiteConnectWizardProps = {}) => {
  const t = useTranslations('BrandProfiles');
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [businesses, setBusinesses] = useState<BusinessDto[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const steps = [
    t('wizard.steps.input') || 'Connect Website',
    t('wizard.steps.extracting') || 'Extracting Brand',
    t('wizard.steps.review') || 'Review Identity',
    t('wizard.steps.done') || 'Success'
  ];

  useEffect(() => {
    let pollTimer: NodeJS.Timeout;

    if (activeStep === 1 && brandProfileId) {
      const checkStatus = async () => {
        try {
          const profile = await BrandProfileService.getBrandProfile(brandProfileId);

          if (profile.status === 'pending_confirmation' || profile.status === 'completed') {
            setBrandProfile(profile);
            setActiveStep(2);
          } else if (profile.status === 'failed') {
            setError('Extraction failed on the server.');
          } else {
            pollTimer = setTimeout(checkStatus, 2000);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to check status.');
        }
      };

      checkStatus();

      return () => clearTimeout(pollTimer);
    }
  }, [activeStep, brandProfileId]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get<PaginatedResponse<BusinessDto>>('/api/admin/businesses', {
          params: { limit: 100 }
        });
        
        setBusinesses(response.data.data || []);
        
        if (response.data.data && response.data.data.length > 0) {
          setSelectedBusinessId(response.data.data[0].id);
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
    setIsValidUrl(true);
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (validateUrl(websiteUrl)) {
        setIsLoading(true);
        setError(null);
       
        try {
          const response = await BrandProfileService.onboardBrandProfile(selectedBusinessId as string, websiteUrl);
         
          setBrandProfileId(response.brandProfileId);
          setActiveStep(1);
        } catch (err: any) {
          setError(err.message || 'Failed to onboard brand profile.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsValidUrl(false);
      }
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleConfirmExtraction = async () => {
    if (brandProfileId) {
      setIsLoading(true);
      setError(null);
      
      try {
        await BrandProfileService.confirmExtraction(brandProfileId);
        setActiveStep(3);
        if (onSuccess) onSuccess();
      } catch (err: any) {
        setError(err.message || 'Failed to confirm extraction.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h5" fontWeight="800" gutterBottom>
              {t('wizard.step1.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Enter the website URL to automatically extract brand identity assets.
            </Typography>
            
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel id="business-select-label">{t('wizard.step1.businessSelectLabel')}</InputLabel>
                <Select
                  labelId="business-select-label"
                  value={selectedBusinessId || ''}
                  label={t('wizard.step1.businessSelectLabel')}
                  onChange={(e) => setSelectedBusinessId(e.target.value as string)}
                  disabled={isLoading || businesses.length === 0}
                  sx={{ borderRadius: 3 }}
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
                placeholder="https://example.com"
                variant="outlined"
                value={websiteUrl}
                onChange={handleUrlChange}
                error={!isValidUrl}
                helperText={!isValidUrl && t('wizard.step1.invalidUrlError')}
                InputProps={{
                  startAdornment: <WebIcon sx={{ mr: 1, color: 'text.disabled' }} fontSize="small" />,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />

              <Button 
                variant="contained" 
                size="large"
                onClick={handleNext} 
                disabled={!websiteUrl || isLoading || !selectedBusinessId}
                endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                sx={{ borderRadius: 3, py: 1.5, fontWeight: 800, boxShadow: theme.shadows[4] }}
              >
                {t('wizard.step1.nextButton')}
              </Button>
            </Stack>

            {error && (
              <Typography color="error" variant="caption" sx={{ mt: 2, display: 'block', fontWeight: 600 }}>
                {error}
              </Typography>
            )}
          </Box>
        );
      case 1:
        return (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            {error ? (
              <Stack spacing={2} alignItems="center">
                <ErrorIcon color="error" sx={{ fontSize: 64 }} />
                <Typography color="error" variant="h6" fontWeight="800">
                  {t('wizard.step2.errorTitle')}
                </Typography>
                <Typography color="text.secondary">{error}</Typography>
                <Button variant="outlined" onClick={() => setActiveStep(0)} sx={{ borderRadius: 3 }}>
                  {t('wizard.step2.tryAgainButton')}
                </Button>
              </Stack>
            ) : (
              <Stack spacing={3} alignItems="center">
                <Box sx={{ position: 'relative', display: 'flex' }}>
                  <CircularProgress size={80} thickness={4} />
                  <MagicIcon sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'primary.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="800" gutterBottom>
                    {t('wizard.step2.title')}
                  </Typography>
                  <Typography color="text.secondary">{t('wizard.step2.description')}</Typography>
                </Box>
              </Stack>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h5" fontWeight="800" gutterBottom>
              {t('wizard.step3.title')}
            </Typography>
            
            {isLoading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : brandProfile ? (
              <Stack spacing={4}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <Typography variant="h4" fontWeight="900" gutterBottom>{brandProfile.title || brandProfile.currentExtractedData?.title || brandProfile.websiteUrl}</Typography>
                  <Typography variant="body1" color="text.secondary">{brandProfile.description || brandProfile.currentExtractedData?.description}</Typography>
                </Paper>

                <Box>
                  <Typography variant="overline" fontWeight="800" color="text.secondary" gutterBottom display="block">Colors</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {brandProfile.currentExtractedData?.colors?.map((c: any, i: number) => (
                      <Tooltip key={i} title={c.hexCode}>
                        <Box sx={{ 
                          width: 48, height: 48, borderRadius: 2, 
                          bgcolor: c.hexCode, border: '1px solid', borderColor: 'divider',
                          boxShadow: theme.shadows[1]
                        }} />
                      </Tooltip>
                    ))}
                    {(!brandProfile.currentExtractedData?.colors || brandProfile.currentExtractedData?.colors.length === 0) && <Typography variant="body2">No colors found</Typography>}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="overline" fontWeight="800" color="text.secondary" gutterBottom display="block">Visual Assets</Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    {brandProfile.currentExtractedData?.assets?.map((a: any, i: number) => (
                      <Paper key={i} variant="outlined" sx={{ p: 1.5, borderRadius: 2, textAlign: 'center', minWidth: 100 }}>
                        <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={a.url} alt={a.altText || a.type} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        </Box>
                        <Chip label={a.type} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase' }} />
                      </Paper>
                    ))}
                    {(!brandProfile.currentExtractedData?.assets || brandProfile.currentExtractedData?.assets.length === 0) && <Typography variant="body2">No assets found</Typography>}
                  </Stack>
                </Box>

                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={handleConfirmExtraction} 
                    disabled={isLoading}
                    fullWidth
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 800 }}
                  >
                    {t('wizard.step3.confirmButton')}
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => setActiveStep(0)} 
                    fullWidth
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 800 }}
                  >
                    Start Over
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Typography>{t('wizard.step3.description')}</Typography>
            )}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Stack spacing={3} alignItems="center">
              <SuccessIcon color="success" sx={{ fontSize: 80 }} />
              <Box>
                <Typography variant="h4" fontWeight="900" gutterBottom>
                  {t('wizard.step4.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  {t('wizard.step4.description')}
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => {
                  setActiveStep(0);
                  setWebsiteUrl('');
                  setBrandProfileId(null);
                  setBrandProfile(null);
                  setError(null);
                }} 
                sx={{ borderRadius: 3, px: 4, fontWeight: 800 }}
              >
                {t('wizard.step4.newExtractionButton')}
              </Button>
            </Stack>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} sx={{ mb: 6, '& .MuiStepLabel-label': { fontWeight: 700 } }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        {renderStepContent()}
      </Paper>
    </Box>
  );
};

export default WebsiteConnectWizard;
