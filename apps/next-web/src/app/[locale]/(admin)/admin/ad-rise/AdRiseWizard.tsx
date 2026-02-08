/* eslint-disable import/no-unresolved */
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import {
  Box,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  Stack,
  Alert,
  Divider,
  Chip,
  CircularProgress,
  Skeleton,
  Fade,
  Paper,
  Tooltip,
  alpha,
  useTheme,
  useMediaQuery,
  GlobalStyles
} from '@mui/material';

import {
  Info as InfoIcon,
  LocationOn as GeoIcon,
  RecordVoiceOver as ToneIcon,
  ArrowBack,
  ArrowForward,
  Check,
  WarningAmber as WarningIcon,
  FlashOn as QuickModeIcon,
  SettingsSuggest as ProModeIcon,
  Save as SavedIcon,
  AutoFixHigh,
  AttachMoney as BudgetIcon,
  TrendingUp as GoalIcon,
  LocalOffer as OfferIcon,
  RateReview as ReviewIcon,
  FileDownload as DownloadIcon,
  Print as PrintIcon,
  Image as ImageIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { useTranslations } from 'next-intl';

import StepperWrapper from '@core/styles/stepper';
import CustomInputVertical from '@core/components/custom-inputs/Vertical';

import CustomTextBox from '@/components/shared/form/custom-text-box';
import CustomSelect from '@/components/shared/form/custom-select';
import CustomTagsInput from '@/components/shared/form/custom-tags-input';
import { saveSession, getBrandTone, getBusinessDetails, scrapeOfferFromUrl, recommendGoal } from '@/app/actions/adrise';
import { useSystemMessages } from '@/shared/components/SystemMessageProvider';
import { countries } from '@/shared/utils/countries';

const AUTOSAVE_KEY = 'adrise_wizard_draft';

interface FormikAutosaveProps {
  businessId: string;
  activeStep: number;
  onStepSave?: (values: any) => void;
  isSaving?: boolean;
}

const FormikAutosave = ({ businessId, activeStep, onStepSave, disabled = false, isSaving = false }: FormikAutosaveProps & { disabled?: boolean }) => {
  const { values, dirty } = useFormikContext<any>();
  const lastSavedName = useRef(values.sessionName);

  // Save to localStorage on every change (debounced)
  useEffect(() => {
    if (!dirty || disabled) return;

    const timer = setTimeout(() => {
      const draft = {
        values,
        activeStep,
        businessId,
        updatedAt: Date.now()
      };

      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
    }, 1000); // Faster local save (1s)

    return () => clearTimeout(timer);
  }, [values, activeStep, businessId, dirty, disabled]);

  // Save to database on step change
  useEffect(() => {
    if (!dirty || disabled || isSaving) return;

    onStepSave?.(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  // Proactive save for session name on Step 0
  useEffect(() => {
    if (activeStep !== 0 || !dirty || disabled || isSaving || !values.sessionName) return;
    if (values.sessionName === lastSavedName.current) return;

    const timer = setTimeout(() => {
      onStepSave?.(values);
      lastSavedName.current = values.sessionName;
    }, 2000); // 2 seconds debounce for name changes

    return () => clearTimeout(timer);
  }, [values.sessionName, activeStep, dirty, disabled, isSaving, onStepSave, values]);

  return null;
};

interface AdRiseWizardProps {
  initialData?: any;
  sessionId?: string;
  onSuccess?: (data: any) => void;
  businessId: string;
  readOnly?: boolean;
}

const AdRiseWizard = ({ initialData, sessionId, onSuccess, businessId, readOnly = false }: AdRiseWizardProps) => {
  const theme = useTheme();
  const t = useTranslations('dashboard.adrise');
  const tc = useTranslations('common');

  const steps = [
    { label: t('steps.basics'), icon: <InfoIcon /> },
    { label: t('steps.offer'), icon: <OfferIcon /> },
    { label: t('steps.goal'), icon: <GoalIcon /> },
    { label: t('steps.budget'), icon: <BudgetIcon /> },
    { label: t('steps.geo'), icon: <GeoIcon /> },
    { label: t('steps.tone'), icon: <ToneIcon /> },
    { label: t('steps.review'), icon: <ReviewIcon /> }
  ];

  const { notify } = useSystemMessages();
  const [activeStep, setActiveStep] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
  const [showSaved, setShowSaved] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [isDraftRecovered, setIsDraftRecovered] = useState(false);
  const [businessBrandTone, setBusinessBrandTone] = useState<string | null>(null);
  const [businessWebsite, setBusinessWebsite] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [recommendedGoal, setRecommendedGoal] = useState<string | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);

  // Sync currentSessionId with sessionId prop
  useEffect(() => {
    if (sessionId) {
      setCurrentSessionId(sessionId);
    }
  }, [sessionId]);

  // Fetch business profile data (brand tone and website)
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (businessId) {
        // Fetch tone and details in parallel
        const [toneResult, profileResult] = await Promise.all([
          getBrandTone(businessId),
          getBusinessDetails(businessId)
        ]);

        if (toneResult.success && toneResult.data) {
          setBusinessBrandTone(toneResult.data);
        }

        if (profileResult.success && profileResult.data) {
          const business = profileResult.data as any;

          if (business.website) {
            setBusinessWebsite(business.website);
          }
        }
      }
    };

    fetchBusinessProfile();
  }, [businessId]);

  useEffect(() => {
    setIsMounted(true);

    // Check for draft if no initialData or sessionId and we haven't recovered one yet
    if (!initialData && !sessionId && !isDraftRecovered) {
      const savedDraft = localStorage.getItem(AUTOSAVE_KEY);

      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);

          if (draft.businessId === businessId && Date.now() - draft.updatedAt < 24 * 60 * 60 * 1000) {
            // Draft is valid (less than 24h old and for same business)
            setActiveStep(draft.activeStep || 0);
            setIsDraftRecovered(true);
            notify({ messageCode: 'adrise.sessions.draftRecovered' as any, variant: 'TOAST', severity: 'info' });
          } else {
            // Even if invalid or not found, mark as attempt done to avoid re-runs
            setIsDraftRecovered(true);
          }
        } catch (e) {
          console.error('Failed to parse draft', e);
          setIsDraftRecovered(true);
        }
      } else {
        // No draft found, mark as attempt done
        setIsDraftRecovered(true);
      }
    }
  }, [businessId, initialData, sessionId, notify, isDraftRecovered]);

  const handleStepSave = useCallback(async (values: any) => {
    if (readOnly) return;
    setIsSaving(true);

    try {
      const result = await saveSession({
        sessionId: currentSessionId,
        businessId,
        mode: values.mode,
        industryCode: values.industry,
        objective: values.goal,
        budgetMonthly: values.budgetMonthly,
        geo: values.locations,
        status: values.status,
        inputs: {
          sessionName: values.sessionName,
          offer: values.offer,
          brandTone: values.brandTone,
          competitors: values.competitors,
          geoRadius: values.geoRadius,
          audienceNotes: values.audienceNotes,
          seasonality: values.seasonality
        }
      });

      if (result.success && result.data) {
        if (!currentSessionId) {
          setCurrentSessionId(result.data.id);
        }

        // Show "Saved" indicator briefly
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error autosaving to database:', error);
    } finally {
      setIsSaving(false);
    }
  }, [businessId, currentSessionId, readOnly]);

  const getInitialValues = () => {
    if (initialData) return initialData;

    if (!sessionId) {
      const savedDraft = localStorage.getItem(AUTOSAVE_KEY);

      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);

          if (draft.businessId === businessId) {
            return draft.values;
          }
        } catch (e) {
          console.error('Failed to load draft values', e);
        }
      }
    }

    return {
      sessionName: '',
      industry: '',
      offer: '',
      goal: '',
      budgetMonthly: 1000,
      pacing: 'even',
      locations: [] as string[],
      brandTone: businessBrandTone || '',
      mode: 'QUICK',
      competitors: [] as string[],
      geoRadius: 10,
      audienceNotes: '',
      seasonality: 'none',
      seasonalityStart: '',
      seasonalityEnd: '',
      promoWindow: 7,
      landingPage: businessWebsite || '',
      campaignStart: '',
      campaignEnd: '',
      status: 'active'
    };
  };

  const initialValues = getInitialValues();

  const getDaysInCurrentMonth = () => {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  const calculatePromoWindow = (start: string, end: string) => {
    if (!start || !end) return 7;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

    return isNaN(diffDays) || diffDays < 0 ? 0 : diffDays;
  };

  const getAllocation = (goal: string, budget: number) => {
    const isLowBudget = budget < 500;

    // Default allocations
    const allocation = {
      google: { awareness: 20, consideration: 40, conversion: 40 },
      meta: { awareness: 30, consideration: 40, conversion: 30 }
    };

    if (goal === 'awareness') {
      allocation.google = { awareness: 50, consideration: 30, conversion: 20 };
      allocation.meta = { awareness: 60, consideration: 30, conversion: 10 };
    } else if (goal === 'traffic') {
      allocation.google = { awareness: 20, consideration: 60, conversion: 20 };
      allocation.meta = { awareness: 30, consideration: 50, conversion: 20 };
    }

    // Adjust for low budget (prioritize conversion/consideration)
    if (isLowBudget) {
      allocation.google.awareness = Math.max(0, allocation.google.awareness - 10);
      allocation.google.conversion = Math.min(100, allocation.google.conversion + 10);
      allocation.meta.awareness = Math.max(0, allocation.meta.awareness - 10);
      allocation.meta.conversion = Math.min(100, allocation.meta.conversion + 10);
    }

    return allocation;
  };

  const validationSchema = useMemo(() => [
    // Step 0: Basics
    Yup.object({
      sessionName: Yup.string().required(t('validation.required')),
      industry: Yup.string().required(t('validation.required')),
      landingPage: Yup.string()
        .url(t('validation.invalidUrl'))
        .required(t('validation.required')),
      campaignStart: Yup.string().required(t('validation.required')),
      campaignEnd: Yup.string()
        .required(t('validation.required'))
        .test('is-after', t('validation.invalidDateRange'), function (value) {
          const { campaignStart } = this.parent;

          return !campaignStart || !value || new Date(value) >= new Date(campaignStart);
        })
    }),

    // Step 1: Offer
    Yup.object({
      offer: Yup.string().required(t('validation.required'))
    }),

    // Step 2: Goal
    Yup.object({
      goal: Yup.string().required(t('validation.required'))
    }),

    // Step 3: Budget
    Yup.object({
      budgetMonthly: Yup.number()
        .required(t('validation.required'))
        .min(1, t('validation.minBudget')),
      seasonalityStart: Yup.string().when('seasonality', {
        is: (val: string) => val !== 'none',
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.notRequired()
      }),
      seasonalityEnd: Yup.string().when('seasonality', {
        is: (val: string) => val !== 'none',
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.notRequired()
      })
    }),

    // Step 4: Geo
    Yup.object({
      locations: Yup.array().min(1, t('validation.required'))
    }),

    // Step 5: Brand Tone
    Yup.object({
      brandTone: Yup.string().required(t('validation.required'))
    }),

    // Step 6: Review
    Yup.object({})
  ], [t]);

  const handleNext = (validateForm: any, setTouched: any, values: any) => {
    validateForm().then((errors: any) => {
      if (Object.keys(errors).length === 0) {
        // If moving from Step 1 (Offer) to Step 2 (Goal), trigger recommendation
        if (activeStep === 1) {
          handleRecommendGoal(values);
        }

        setActiveStep((prev) => prev + 1);
      } else {
        // Mark all fields in current step as touched to show errors
        const touched: any = {};

        Object.keys(errors).forEach(key => {
          touched[key] = true;
        });
        setTouched(touched);
      }
    });
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSmartFill = async (values: any, setFieldValue: any) => {
    if (!values.landingPage) {
      notify({ messageCode: 'errors.missingLandingPage' as any, variant: 'TOAST', severity: 'warning' });

      return;
    }

    setIsScraping(true);

    try {
      const result = await scrapeOfferFromUrl(values.landingPage, values.industry);

      if (result.success && result.data) {
        setFieldValue('offer', result.data);
        notify({ messageCode: 'adrise.offer.smartFillSuccess' as any, variant: 'TOAST', severity: 'success' });
      } else {
        notify({ messageCode: 'errors.internalError' as any, variant: 'TOAST', severity: 'error' });
      }
    } catch (error: any) {
      console.error('Smart Fill Error:', error);
      notify({ messageCode: 'adrise.offer.smartFillError' as any, variant: 'TOAST', severity: 'error' });
    } finally {
      setIsScraping(false);
    }
  };

  const handleRecommendGoal = async (values: any) => {
    if (!values.offer) {
      return;
    }

    setIsRecommending(true);

    try {
      const result = await recommendGoal(values.offer, values.industry);

      if (result.success && result.data) {
        setRecommendedGoal(result.data);
      }
    } catch (error) {
      console.error('Goal Recommendation Error:', error);
    } finally {
      setIsRecommending(false);
    }
  };

  const handleExportJSON = (values: any) => {
    const data = JSON.stringify(values, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `campaign-plan-${values.sessionName || 'draft'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderStepContent = (step: number, values: any, setFieldValue: any) => {
    // Automatically set brandTone if it's empty and we have a businessBrandTone
    if (step === 5 && !values.brandTone && businessBrandTone) {
      setTimeout(() => setFieldValue('brandTone', businessBrandTone), 0);
    }

    // Automatically set landingPage if it's empty and we have a businessWebsite
    if (step === 0 && !values.landingPage && businessWebsite) {
      setTimeout(() => setFieldValue('landingPage', businessWebsite), 0);
    }

    switch (step) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12 }}>
                <CustomTextBox
                  name="sessionName"
                  label={t('fields.sessionName')}
                  tooltip={t('fields.sessionNameTooltip')}
                  placeholder="My Summer Campaign"
                  fullWidth
                  autoFocus
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomSelect
                  name="industry"
                  label={t('fields.industry')}
                  tooltip={t('fields.industryTooltip')}
                  placeholder="e.g. Health & Wellness"
                  options={[
                    { label: 'E-commerce', value: 'ecommerce' },
                    { label: 'SaaS', value: 'saas' },
                    { label: 'Real Estate', value: 'real_estate' },
                    { label: 'Healthcare', value: 'healthcare' },
                    { label: 'Fashion & Apparel', value: 'fashion' },
                    { label: 'Food & Beverage', value: 'food_beverage' },
                    { label: 'Travel & Hospitality', value: 'travel' },
                    { label: 'Automotive', value: 'automotive' },
                    { label: 'Financial Services', value: 'finance' },
                    { label: 'Legal Services', value: 'legal' },
                    { label: 'Education', value: 'education' },
                    { label: 'Local Business', value: 'local' }
                  ]}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomSelect
                  name="status"
                  label={t('fields.status')}
                  tooltip={t('fields.statusTooltip')}
                  placeholder="Select status"
                  options={[
                    { label: t('status.active'), value: 'active' },
                    { label: t('status.draft'), value: 'draft' },
                    { label: t('status.completed'), value: 'completed' }
                  ]}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomTextBox
                  name="landingPage"
                  label={t('fields.landingPage')}
                  tooltip={t('fields.landingPageTooltip')}
                  placeholder="https://yourbrand.com/special-offer"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextBox
                  name="campaignStart"
                  label={t('fields.campaignStart')}
                  tooltip={t('fields.campaignTimelineTooltip')}
                  type="date"
                  placeholder="YYYY-MM-DD"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextBox
                  name="campaignEnd"
                  label={t('fields.campaignEnd')}
                  tooltip={t('fields.campaignTimelineTooltip')}
                  type="date"
                  placeholder="YYYY-MM-DD"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 600 }}>
                  {t('basics.mode')}
                </Typography>
                <Grid container spacing={4}>
                  {[
                    {
                      value: 'QUICK',
                      title: t('basics.modeQuick'),
                      content: t('basics.modeQuickDesc'),
                      icon: <QuickModeIcon fontSize="large" color={values.mode === 'QUICK' ? 'primary' : 'action'} />
                    },
                    {
                      value: 'PRO',
                      title: t('basics.modePro'),
                      content: t('basics.modeProDesc'),
                      icon: <ProModeIcon fontSize="large" color={values.mode === 'PRO' ? 'primary' : 'action'} />
                    }
                  ].map((item) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={item.value}>
                      <CustomInputVertical
                        type="radio"
                        name="mode"
                        selected={values.mode}
                        handleChange={(val) => setFieldValue('mode', val)}
                        data={{
                          value: item.value,
                          title: item.title,
                          content: item.content,
                          asset: item.icon
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              {values.mode === 'PRO' && (
                <Grid size={{ xs: 12 }}>
                  <CustomTagsInput
                    name="competitors"
                    label={t('fields.competitors')}
                    tooltip={t('fields.competitorsTooltip')}
                    placeholder={t('competitors.placeholder')}
                    fullWidth
                  />
                </Grid>
              )}
            </Grid>
          </Fade>
        );
      case 1:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {t('offer.title')}
                  </Typography>
                  <Tooltip title={t('offer.smartFillTooltip')}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={isScraping ? <CircularProgress size={16} color="inherit" /> : <AutoFixHigh />}
                      onClick={() => handleSmartFill(values, setFieldValue)}
                      disabled={isScraping || !values.landingPage}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        borderWidth: 1.5,
                        '&:hover': { borderWidth: 1.5 }
                      }}
                    >
                      {isScraping ? t('offer.smartFillLoading') : t('offer.smartFill')}
                    </Button>
                  </Tooltip>
                </Box>
                <CustomTextBox
                  name="offer"
                  label={t('fields.offer')}
                  tooltip={t('fields.offerTooltip')}
                  placeholder={t('offer.placeholder')}
                  multiline
                  rows={4}
                  fullWidth
                />
              </Grid>
              {values.mode === 'PRO' && (
                <Grid size={{ xs: 12 }}>
                  <CustomTextBox
                    name="audienceNotes"
                    label={t('fields.audienceNotes')}
                    tooltip={t('fields.audienceNotesTooltip')}
                    placeholder={t('offer.audiencePlaceholder')}
                    multiline
                    rows={4}
                    fullWidth
                  />
                </Grid>
              )}
            </Grid>
          </Fade>
        );
      case 2:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={4}>
              {isRecommending && (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {t('goal.recommending')}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {[
                { value: 'traffic', title: t('goal.objectives.traffic'), content: t('goal.objectives.trafficSubtitle') },
                { value: 'leads', title: t('goal.objectives.leads'), content: t('goal.objectives.leadsSubtitle') },
                { value: 'sales', title: t('goal.objectives.sales'), content: t('goal.objectives.salesSubtitle') },
                { value: 'awareness', title: t('goal.objectives.awareness'), content: t('goal.objectives.awarenessSubtitle') }
              ].map((item) => (
                <Grid size={{ xs: 12, sm: 6 }} key={item.value}>
                  <Box sx={{ position: 'relative' }}>
                    {recommendedGoal === item.value && (
                      <Chip
                        label={t('goal.recommended')}
                        color="primary"
                        size="small"
                        icon={<AutoFixHigh sx={{ fontSize: '14px !important' }} />}
                        sx={{
                          position: 'absolute',
                          top: -10,
                          right: 10,
                          zIndex: 1,
                          fontWeight: 800,
                          fontSize: '10px',
                          height: 20,
                          boxShadow: theme.shadows[2]
                        }}
                      />
                    )}
                    <CustomInputVertical
                      type="radio"
                      name="goal"
                      selected={values.goal}
                      handleChange={(val) => setFieldValue('goal', val)}
                      data={{
                        value: item.value,
                        title: item.title,
                        content: item.content,
                        asset: <GoalIcon fontSize="large" color={values.goal === item.value ? 'primary' : 'action'} />
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Fade>
        );

      case 3: {

        // Calculate campaign duration if both dates are set
        let campaignDays = getDaysInCurrentMonth(); // Default to ~30 days

        if (values.campaignStart && values.campaignEnd) {
          const startDate = new Date(values.campaignStart);
          const endDate = new Date(values.campaignEnd);
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());

          campaignDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        }

        const dailyBudget = Math.round((values.budgetMonthly || 0) / campaignDays);
        const isLowBudget = values.budgetMonthly < 500;
        const isVeryLowBudget = values.budgetMonthly < 200;

        return (
          <Fade in timeout={500}>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12 }}>
                <CustomTextBox
                  name="budgetMonthly"
                  label={t('fields.budgetMonthly')}
                  tooltip={t('fields.budgetMonthlyTooltip')}
                  type="number"
                  placeholder="500"
                  fullWidth
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>{tc('common.currencySymbol') || '$'}</Typography>
                  }}
                />
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('budget.dailyBudget')}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {tc('common.currencySymbol') || '$'}{dailyBudget}{t('budget.dailyUnit')}
                  </Typography>
                  {values.campaignStart && values.campaignEnd && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({campaignDays} {t('budget.days')})
                    </Typography>
                  )}
                </Box>

                {isVeryLowBudget && (
                  <Alert severity="error" icon={<WarningIcon />} sx={{ mt: 2 }}>
                    {t('budget.lowBudgetWarning')}
                  </Alert>
                )}
                {isLowBudget && !isVeryLowBudget && (
                  <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
                    {t('validation.lowBudgetWarning')}
                  </Alert>
                )}
              </Grid>
              {values.mode === 'PRO' && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomSelect
                      name="seasonality"
                      label={t('fields.seasonality')}
                      tooltip={t('fields.seasonalityTooltip')}
                      options={[
                        { label: t('budget.seasonalityNone'), value: 'none', description: t('budget.seasonalityNoneDesc') },
                        { label: t('budget.seasonalityHoliday'), value: 'holiday', description: t('budget.seasonalityHolidayDesc') },
                        { label: t('budget.seasonalitySummer'), value: 'summer', description: t('budget.seasonalitySummerDesc') },
                        { label: t('budget.seasonalityBlackFriday'), value: 'black_friday', description: t('budget.seasonalityBlackFridayDesc') }
                      ]}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomSelect
                      name="pacing"
                      label={t('budget.allocation')}
                      tooltip={t('fields.pacingTooltip')}
                      options={[
                        { label: t('budget.pacingEven'), value: 'even', description: t('budget.pacingEvenDesc') },
                        { label: t('budget.pacingFrontLoad'), value: 'front_load', description: t('budget.pacingFrontLoadDesc') },
                        { label: t('budget.pacingRampUp'), value: 'ramp_up', description: t('budget.pacingRampUpDesc') }
                      ]}
                      fullWidth
                    />
                  </Grid>

                  {values.seasonality !== 'none' && (
                    <>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextBox
                          name="seasonalityStart"
                          label={t('fields.seasonalityStart')}
                          tooltip={t('fields.seasonalityStartTooltip')}
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          onValueChange={(val: string | number) => {
                            const window = calculatePromoWindow(String(val), values.seasonalityEnd);

                            setFieldValue('promoWindow', window);
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextBox
                          name="seasonalityEnd"
                          label={t('fields.seasonalityEnd')}
                          tooltip={t('fields.seasonalityEndTooltip')}
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          onValueChange={(val: string | number) => {
                            const window = calculatePromoWindow(values.seasonalityStart, String(val));

                            setFieldValue('promoWindow', window);
                          }}
                        />
                      </Grid>
                    </>
                  )}
                </>
              )}
            </Grid>
          </Fade>
        );
      }

      case 4:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12 }}>
                <CustomTagsInput
                  name="locations"
                  label={t('fields.locations')}
                  tooltip={t('fields.locationsTooltip')}
                  placeholder={t('geo.countryPlaceholder') || 'Select target countries...'}
                  options={countries}
                  fullWidth
                />
              </Grid>
              {values.mode === 'PRO' && (
                <Grid size={{ xs: 12 }}>
                  <CustomTextBox
                    name="geoRadius"
                    label={t('fields.geoRadius')}
                    tooltip={t('fields.geoRadiusTooltip')}
                    type="number"
                    placeholder="10"
                    fullWidth
                    InputProps={{
                      endAdornment: <Typography sx={{ ml: 1 }}>{tc('common.distanceUnit') || 'km'}</Typography>
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </Fade>
        );

      case 5:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12 }}>
                {values.mode === 'PRO' ? (
                  <CustomTextBox
                    name="brandTone"
                    label={t('fields.brandTone')}
                    tooltip={t('fields.brandToneTooltip')}
                    placeholder={t('tone.placeholder')}
                    multiline
                    rows={4}
                    fullWidth
                  />
                ) : (
                  <CustomTextBox
                    name="brandTone"
                    label={t('fields.brandTone')}
                    tooltip={t('fields.brandToneTooltip')}
                    placeholder={businessBrandTone || t('tone.placeholder')}
                    disabled
                    fullWidth
                    helperText={businessBrandTone ? t('tone.fromProfile') : t('tone.notSet')}
                  />
                )}
              </Grid>
            </Grid>
          </Fade>
        );

      case 6:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ReviewIcon color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1 }}>
                      {t('review.title')}
                    </Typography>
                  </Box>
                  <Box className="hide-on-print" sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleExportJSON(values)}
                    >
                      {t('review.exportJson')}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<PrintIcon />}
                      onClick={handlePrint}
                    >
                      {t('review.print')}
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {/* Primary Info Blueprint */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 8,
                      borderRadius: 5,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{
                      position: 'absolute',
                      bottom: -40,
                      right: -40,
                      opacity: 0.03,
                      transform: 'rotate(-15deg)'
                    }}>
                      <ReviewIcon sx={{ fontSize: 240 }} />
                    </Box>

                    <Grid container spacing={6}>
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: 2 }}>
                          {t('review.sessionName')}
                        </Typography>
                        <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, letterSpacing: -1 }}>{values.sessionName}</Typography>

                        <Stack direction="row" spacing={3} sx={{ mt: 4 }}>
                          <Chip
                            label={t(`status.${values.status || 'draft'}`)}
                            color={values.status === 'active' ? 'success' : 'warning'}
                            variant="tonal"
                            sx={{ fontWeight: 700, px: 2 }}
                          />
                          <Chip
                            label={values.mode}
                            color="primary"
                            variant="tonal"
                            sx={{ fontWeight: 700, px: 2 }}
                            icon={values.mode === 'PRO' ? <ProModeIcon /> : <QuickModeIcon />}
                          />
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                          {t('fields.landingPage')}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1, color: 'primary.main', fontWeight: 700, textDecoration: 'underline', wordBreak: 'break-all' }}>
                          {values.landingPage || '—'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Secondary Details Grid */}
                  <Grid container spacing={6}>
                    {/* Strategy Column */}
                    <Grid size={{ xs: 12, md: 7 }}>
                      <Card sx={{ height: '100%', p: 2 }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 6, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex' }}>
                              <GoalIcon color="primary" />
                            </Box>
                            {t('review.campaignStrategy')}
                          </Typography>
                          <Grid container spacing={6}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                                {t('review.objective')}
                              </Typography>
                              <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: 'primary.main' }}>
                                {t(`goal.objectives.${values.goal}`)}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                                {t('fields.campaignStart')} / {t('fields.campaignEnd')}
                              </Typography>
                              <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>
                                {values.campaignStart || '—'} — {values.campaignEnd || '—'}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                                {t('review.locations')}
                              </Typography>
                              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                                {values.locations.map((loc: string) => (
                                  <Chip key={loc} label={loc} size="small" variant="outlined" sx={{ borderRadius: 1, fontWeight: 600 }} />
                                ))}
                                {values.mode === 'PRO' && (
                                  <Chip label={`+${values.geoRadius}km radius`} size="small" color="primary" variant="tonal" sx={{ borderRadius: 1, fontWeight: 600 }} />
                                )}
                              </Stack>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Financial Column */}
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Card sx={{ height: '100%', p: 2, bgcolor: alpha(theme.palette.success.main, 0.02) }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 6, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.1), display: 'flex' }}>
                              <BudgetIcon color="success" />
                            </Box>
                            {t('review.budgetLogistics')}
                          </Typography>

                          <Box sx={{ mb: 6 }}>
                            <Typography variant="h3" sx={{ color: 'success.main', fontWeight: 900 }}>
                              {tc('common.currencySymbol') || '$'}{values.budgetMonthly}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {t('review.totalMonthly')} / {tc('common.currencySymbol') || '$'}{Math.round((values.budgetMonthly || 0) / getDaysInCurrentMonth())} {t('budget.dailyUnit')}
                            </Typography>
                          </Box>

                          <Stack spacing={3}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{t('fields.industry')}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>{values.industry}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{t('fields.brandTone')}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>{values.brandTone}</Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Allocation Visualizer */}
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 6, fontWeight: 800 }}>
                        {t('review.channelAllocation')}
                      </Typography>
                      {(() => {
                        const allocation = getAllocation(values.goal, values.budgetMonthly);

                        return (
                          <Grid container spacing={8}>
                            {[
                              { platform: 'Google Ads', icon: <GoalIcon />, color: theme.palette.primary.main, data: allocation.google },
                              { platform: 'Meta (FB/IG)', icon: <OfferIcon />, color: theme.palette.secondary.main, data: allocation.meta }
                            ].map((item) => (
                              <Grid size={{ xs: 12, md: 6 }} key={item.platform}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 4, color: item.color, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  {item.icon} {item.platform}
                                </Typography>
                                <Stack spacing={4}>
                                  {['awareness', 'consideration', 'conversion'].map((stage) => (
                                    <Box key={stage}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                                          {t(`budget.${stage}`)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 900 }}>{item.data[stage as keyof typeof item.data]}%</Typography>
                                      </Box>
                                      <Box sx={{ height: 8, width: '100%', bgcolor: 'action.hover', borderRadius: 10, overflow: 'hidden' }}>
                                        <Box sx={{
                                          height: '100%',
                                          width: `${item.data[stage as keyof typeof item.data]}%`,
                                          bgcolor: item.color,
                                          borderRadius: 10,
                                          boxShadow: `0 0 10px ${alpha(item.color, 0.4)}`
                                        }} />
                                      </Box>
                                    </Box>
                                  ))}
                                </Stack>
                              </Grid>
                            ))}
                          </Grid>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </Box>

                {/* Creatives & Execution Grid */}
                <Grid container spacing={6} sx={{ mt: 2 }}>
                  {/* Creatives Column */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%', p: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 6, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.warning.main, 0.1), display: 'flex' }}>
                            <ImageIcon color="warning" />
                          </Box>
                          {t('review.creatives')}
                        </Typography>
                        <Stack spacing={3}>
                          <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default', border: `1px dashed ${theme.palette.divider}` }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{t('review.creativeSpecs.googleTitle')}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              • {t('review.creativeSpecs.googleHeadlines')}<br />
                              • {t('review.creativeSpecs.googleDescriptions')}<br />
                              • {t('review.creativeSpecs.googleSitelinks')}
                            </Typography>
                          </Box>
                          <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default', border: `1px dashed ${theme.palette.divider}` }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{t('review.creativeSpecs.metaTitle')}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              • {t('review.creativeSpecs.metaFeed')}<br />
                              • {t('review.creativeSpecs.metaStories')}<br />
                              • {t('review.creativeSpecs.metaText')}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Execution Column */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%', p: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 6, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.1), display: 'flex' }}>
                            <TimelineIcon color="info" />
                          </Box>
                          {t('review.execution')}
                        </Typography>
                        <Stack spacing={4}>
                          {[
                            { day: 'Day 1', task: t('review.timeline.setup'), color: theme.palette.primary.main },
                            { day: 'Day 3', task: t('review.timeline.review'), color: theme.palette.info.main },
                            { day: 'Day 7', task: t('review.timeline.optimize'), color: theme.palette.success.main }
                          ].map((item, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 3 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color, border: `3px solid ${alpha(item.color, 0.2)}` }} />
                                {i < 2 && <Box sx={{ width: 2, height: '100%', bgcolor: 'divider', my: 0.5 }} />}
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.day}</Typography>
                                <Typography variant="body2" color="text.secondary">{item.task}</Typography>
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Fade>
        );
      default:
        return null;
    }
  };

  if (!isMounted) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ width: '100%' }}>
            <Skeleton variant="rectangular" height={50} sx={{ mb: 8 }} />
            <Skeleton variant="rectangular" height={300} sx={{ mb: 4 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton variant="rectangular" width={100} height={40} />
              <Skeleton variant="rectangular" width={100} height={40} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <StepperWrapper sx={{
      '& .MuiCard-root': {
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(12px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
        borderRadius: 4
      }
    }}>
      <GlobalStyles styles={{
        '@media print': {
          '.hide-on-print, header, footer, .MuiDrawer-root, .MuiStepper-root, nav, button, aside, [class*="sidebar"], [class*="Sidebar"]': {
            display: 'none !important'
          },
          'body, html, #root, .MuiCard-root': {
            height: 'auto !important',
            overflow: 'visible !important',
            backgroundColor: 'white !important',
            color: 'black !important'
          },
          '.MuiCard-root': {
            boxShadow: 'none !important',
            border: 'none !important'
          }
        }
      }} />
      <Card>
        <CardContent sx={{ p: { xs: 6, md: 10 } }}>
          {isMobile ? (
            <Box sx={{ mb: 8, textAlign: 'center' }}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 2 }}>
                {t('steps.step')} {activeStep + 1} / {steps.length}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
                {steps[activeStep].label}
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'center' }}>
                {steps.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      height: 6,
                      width: index === activeStep ? 40 : 12,
                      borderRadius: 3,
                      bgcolor: index <= activeStep ? 'primary.main' : 'action.hover',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: index === activeStep ? `0 0 10px ${alpha(theme.palette.primary.main, 0.4)}` : 'none'
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : (
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                mb: 12,
                '& .MuiStepLabel-label': {
                  mt: 2,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: 'text.disabled',
                  '&.Mui-active': {
                    color: 'primary.main',
                  }
                },
                '& .MuiStepIcon-root': {
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
                  p: 0.5,
                  color: 'transparent',
                  bgcolor: 'background.paper',
                  transition: 'all 0.3s ease',
                  '&.Mui-active': {
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    transform: 'scale(1.1)',
                    boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`
                  },
                  '&.Mui-completed': {
                    color: 'success.main',
                    borderColor: 'success.main',
                    bgcolor: alpha(theme.palette.success.main, 0.05)
                  }
                }
              }}
            >
              {steps.map((step, index) => (
                <Step key={step.label} completed={activeStep > index}>
                  <StepLabel
                    icon={
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: activeStep === index ? 'primary.main' : activeStep > index ? 'success.main' : 'text.disabled'
                      }}>
                        {activeStep > index ? <Check sx={{ fontSize: 24 }} /> : step.icon}
                      </Box>
                    }
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema[activeStep]}
            enableReinitialize
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const result = await saveSession({
                  sessionId: currentSessionId,
                  businessId,
                  mode: values.mode,
                  industryCode: values.industry,
                  objective: values.goal,
                  budgetMonthly: values.budgetMonthly,
                  geo: values.locations,
                  inputs: {
                    sessionName: values.sessionName,
                    offer: values.offer,
                    brandTone: values.brandTone,
                    competitors: values.competitors,
                    geoRadius: values.geoRadius,
                    audienceNotes: values.audienceNotes,
                    seasonality: values.seasonality,
                    landingPage: values.landingPage,
                    campaignStart: values.campaignStart,
                    campaignEnd: values.campaignEnd
                  },
                  incrementVersion: true
                });

                if (result.success) {
                  localStorage.removeItem(AUTOSAVE_KEY);
                  onSuccess?.(result.data);
                } else {
                  console.error('Failed to save session:', result.error);
                }
              } catch (error) {
                console.error('Error submitting form:', error);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, setFieldValue, validateForm, setTouched, submitForm, isSubmitting }) => (
              <Form>
                <FormikAutosave
                  businessId={businessId}
                  activeStep={activeStep}
                  onStepSave={handleStepSave}
                  disabled={readOnly}
                  isSaving={isSaving}
                />

                {isDraftRecovered && !readOnly && (
                  <Alert
                    severity="info"
                    sx={{ mb: 4 }}
                    action={
                      <Button color="inherit" size="small" onClick={() => {
                        localStorage.removeItem(AUTOSAVE_KEY);
                        window.location.reload();
                      }}>
                        {tc('common.discard')}
                      </Button>
                    }
                  >
                    {t('status.draftLoaded')}
                  </Alert>
                )}

                <Box sx={{ minHeight: 300, py: 4, pointerEvents: readOnly ? 'none' : 'auto' }}>
                  {renderStepContent(activeStep, values, setFieldValue)}
                </Box>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    type="button"
                    disabled={activeStep === 0 || isSubmitting}
                    onClick={handleBack}
                    startIcon={<ArrowBack />}
                  >
                    {tc('common.back')}
                  </Button>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Fade in={isSaving || showSaved}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        {isSaving ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <SavedIcon fontSize="small" color="success" />
                        )}
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {isSaving ? t('status.saving') : t('status.saved')}
                        </Typography>
                      </Box>
                    </Fade>

                    {activeStep === steps.length - 1 ? (
                      !readOnly && (
                        <Button
                          key='finish-button'
                          variant='contained'
                          color='primary'
                          type='button'
                          disabled={isSubmitting}
                          onClick={() => submitForm()}
                          startIcon={isSubmitting ? <CircularProgress size={20} /> : <Check />}
                        >
                          {tc('common.finish')}
                        </Button>
                      )
                    ) : (
                      <Button
                        key='next-button'
                        type='button'
                        variant='contained'
                        onClick={() => handleNext(validateForm, setTouched, values)}
                        endIcon={<ArrowForward />}
                      >
                        {tc('common.next')}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </StepperWrapper>
  );
};

export default AdRiseWizard;
