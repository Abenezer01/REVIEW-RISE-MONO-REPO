/* eslint-disable import/no-unresolved */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';

import {
  Info as InfoIcon,
  ShoppingBag as OfferIcon,
  AdsClick as GoalIcon,
  MonetizationOn as BudgetIcon,
  LocationOn as GeoIcon,
  RecordVoiceOver as ToneIcon,
  CheckCircle as ReviewIcon,
  ArrowBack,
  ArrowForward,
  Check,
  WarningAmber as WarningIcon,
  FlashOn as QuickModeIcon,
  SettingsSuggest as ProModeIcon,
  CloudDone as SavedIcon
} from '@mui/icons-material';

import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { useTranslations } from 'next-intl';

import StepperWrapper from '@core/styles/stepper';
import CustomInputVertical from '@core/components/custom-inputs/Vertical';

import CustomTextBox from '@/components/shared/form/custom-text-box';
import CustomSelect from '@/components/shared/form/custom-select';
import CustomTagsInput from '@/components/shared/form/custom-tags-input';
import { saveSession, getBrandTone } from '@/app/actions/adrise';
import { useSystemMessages } from '@/shared/components/SystemMessageProvider';

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
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [isDraftRecovered, setIsDraftRecovered] = useState(false);
  const [businessBrandTone, setBusinessBrandTone] = useState<string | null>(null);

  // Sync currentSessionId with sessionId prop
  useEffect(() => {
    if (sessionId) {
      setCurrentSessionId(sessionId);
    }
  }, [sessionId]);

  // Fetch business brand tone
  useEffect(() => {
    const fetchTone = async () => {
      if (businessId) {
        const result = await getBrandTone(businessId);

        if (result.success && result.data) {
          setBusinessBrandTone(result.data);
        }
      }
    };

    fetchTone();
  }, [businessId]);

  useEffect(() => {
    setIsMounted(true);

    // Check for draft if no initialData or sessionId
    if (!initialData && !sessionId) {
      const savedDraft = localStorage.getItem(AUTOSAVE_KEY);

      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);

          if (draft.businessId === businessId && Date.now() - draft.updatedAt < 24 * 60 * 60 * 1000) {
            // Draft is valid (less than 24h old and for same business)
            setActiveStep(draft.activeStep || 0);
            setIsDraftRecovered(true);
            notify({ messageCode: 'adrise.sessions.draftRecovered' as any, variant: 'TOAST', severity: 'info' });
          }
        } catch (e) {
          console.error('Failed to parse draft', e);
        }
      }
    }
  }, [businessId, initialData, sessionId, notify]);

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
      locations: [] as string[],
      brandTone: businessBrandTone || '',
      mode: 'QUICK',
      competitors: [] as string[],
      geoRadius: 10,
      audienceNotes: '',
      seasonality: 'none',
      status: 'active'
    };
  };

  const initialValues = getInitialValues();

  const validationSchema = [
    // Step 0: Basics
    Yup.object({
      sessionName: Yup.string().required(t('validation.required')),
      industry: Yup.string().required(t('validation.required'))
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
        .min(1, t('validation.minBudget'))
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
  ];

  const handleNext = (validateForm: any, setTouched: any) => {
    validateForm().then((errors: any) => {
      if (Object.keys(errors).length === 0) {
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

  const renderStepContent = (step: number, values: any, setFieldValue: any) => {
    // Automatically set brandTone if it's empty and we have a businessBrandTone
    if (step === 5 && !values.brandTone && businessBrandTone) {
      setTimeout(() => setFieldValue('brandTone', businessBrandTone), 0);
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
                  placeholder="My Summer Campaign"
                  fullWidth
                  autoFocus
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomSelect
                  name="industry"
                  label={t('fields.industry')}
                  options={[
                    { label: 'E-commerce', value: 'ecommerce' },
                    { label: 'SaaS', value: 'saas' },
                    { label: 'Local Business', value: 'local' },
                    { label: 'Education', value: 'education' }
                  ]}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomSelect
                  name="status"
                  label={t('fields.status')}
                  options={[
                    { label: t('status.active'), value: 'active' },
                    { label: t('status.draft'), value: 'draft' },
                    { label: t('status.completed'), value: 'completed' }
                  ]}
                  fullWidth
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
                <CustomTextBox
                  name="offer"
                  label={t('fields.offer')}
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
                    placeholder={t('offer.audiencePlaceholder')}
                    multiline
                    rows={3}
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
              {[
                { value: 'traffic', title: t('goal.objectives.traffic'), content: 'Drive more people to your website' },
                { value: 'leads', title: t('goal.objectives.leads'), content: 'Collect information from potential customers' },
                { value: 'sales', title: t('goal.objectives.sales'), content: 'Directly sell products or services' },
                { value: 'awareness', title: t('goal.objectives.awareness'), content: 'Reach more people and build brand' }
              ].map((item) => (
                <Grid size={{ xs: 12, sm: 6 }} key={item.value}>
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
                </Grid>
              ))}
            </Grid>
          </Fade>
        );
      case 3:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12 }}>
                <CustomTextBox
                  name="budgetMonthly"
                  label={t('fields.budgetMonthly')}
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>{tc('common.currencySymbol') || '$'}</Typography>
                  }}
                />
                {values.budgetMonthly < 500 && (
                  <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
                    {t('validation.lowBudgetWarning')}
                  </Alert>
                )}
              </Grid>
              {values.mode === 'PRO' && (
                <Grid size={{ xs: 12 }}>
                  <CustomSelect
                    name="seasonality"
                    label={t('fields.seasonality')}
                    options={[
                      { label: t('budget.seasonalityNone'), value: 'none' },
                      { label: t('budget.seasonalityHoliday'), value: 'holiday' },
                      { label: t('budget.seasonalitySummer'), value: 'summer' },
                      { label: t('budget.seasonalityBlackFriday'), value: 'black_friday' }
                    ]}
                    fullWidth
                  />
                </Grid>
              )}
            </Grid>
          </Fade>
        );
      case 4:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12 }}>
                <CustomTagsInput
                  name="locations"
                  label={t('fields.locations')}
                  placeholder={t('geo.placeholder')}
                />
              </Grid>
              {values.mode === 'PRO' && (
                <Grid size={{ xs: 12 }}>
                  <CustomTextBox
                    name="geoRadius"
                    label={t('fields.geoRadius')}
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
                <CustomSelect
                  name="brandTone"
                  label={t('fields.brandTone')}
                  options={[
                    { label: 'Professional', value: 'professional' },
                    { label: 'Friendly', value: 'friendly' },
                    { label: 'Exciting', value: 'exciting' },
                    { label: 'Urgent', value: 'urgent' }
                  ]}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Fade>
        );
      case 6:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ReviewIcon color="primary" />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>{t('review.title')}</Typography>
                </Box>
                
                <Paper variant="outlined" sx={{ p: 6, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <Stack spacing={6}>
                    <Box>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {t('review.sessionName')}
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 1 }}>{values.sessionName}</Typography>
                    </Box>

                    <Divider />

                    <Grid container spacing={6}>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                          {t('review.industry')}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1, fontWeight: 500, textTransform: 'capitalize' }}>
                          {values.industry || '—'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                          {t('review.mode')}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={values.mode} 
                            size="small" 
                            color={values.mode === 'PRO' ? 'info' : 'secondary'} 
                            variant="tonal"
                            icon={values.mode === 'PRO' ? <ProModeIcon /> : <QuickModeIcon />}
                          />
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                          {t('review.objective')}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={(values.goal || '—').toUpperCase()} 
                            color="primary" 
                            size="small" 
                            variant="tonal" 
                          />
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                          {t('fields.status')}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={t(`status.${values.status || 'draft'}`)} 
                            color={values.status === 'active' ? 'success' : values.status === 'completed' ? 'info' : 'warning'} 
                            size="small" 
                            variant="tonal" 
                          />
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider />

                    <Box>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {t('review.offer')}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                        {values.offer || '—'}
                      </Typography>
                    </Box>

                    {values.mode === 'PRO' && (
                      <>
                        <Divider />
                        <Grid container spacing={6}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                              {t('review.competitors')}
                            </Typography>
                            {Array.isArray(values.competitors) && values.competitors.length > 0 ? (
                              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                {values.competitors.map((comp: string) => (
                                  <Chip key={comp} label={comp} size="small" variant="outlined" />
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.disabled" sx={{ mt: 1, fontStyle: 'italic' }}>
                                {tc('common.none') || 'None'}
                              </Typography>
                            )}
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                              {t('review.audienceNotes')}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                              {values.audienceNotes || '—'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </>
                    )}

                    <Divider />

                    <Grid container spacing={6}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                          {t('review.budget')}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1, color: 'success.main', fontWeight: 600 }}>
                          {tc('common.currencySymbol') || '$'}{values.budgetMonthly}
                        </Typography>
                      </Grid>
                      {values.mode === 'PRO' && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                            {t('review.seasonality')}
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 1, textTransform: 'capitalize' }}>
                            {values.seasonality || 'None'}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>

                    <Divider />

                    <Box>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {t('review.locations')}
                      </Typography>
                      {Array.isArray(values.locations) && values.locations.length > 0 ? (
                        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 2 }}>
                          {values.locations.map((loc: string) => (
                            <Chip key={loc} label={loc} size="small" color="primary" variant="outlined" />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ mt: 1, mb: 2, fontStyle: 'italic' }}>
                          {tc('common.none') || 'None'}
                        </Typography>
                      )}
                      
                      {values.mode === 'PRO' && (
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GeoIcon fontSize="inherit" />
                          {t('review.radius')}: {values.geoRadius} {tc('common.distanceUnit') || 'km'}
                        </Typography>
                      )}
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {t('review.tone')}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1, textTransform: 'capitalize' }}>
                        {values.brandTone || '—'}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
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
    <StepperWrapper>
      <Card>
        <CardContent>
          {isMobile ? (
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                {t('steps.step')} {activeStep + 1} {tc('common.of')} {steps.length}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {steps[activeStep].label}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                {steps.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      height: 4,
                      flex: 1,
                      maxWidth: 40,
                      borderRadius: 1,
                      bgcolor: index <= activeStep ? 'primary.main' : 'action.hover',
                      transition: 'all 0.3s ease'
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
                mb: 8,
                '& .MuiStepLabel-label': {
                  mt: 1,
                  fontWeight: 500,
                  color: 'text.disabled',
                  '&.Mui-active': {
                    color: 'primary.main',
                    fontWeight: 600
                  },
                  '&.Mui-completed': {
                    color: 'text.primary'
                  }
                },
                '& .MuiStepIcon-root': {
                  width: 32,
                  height: 32,
                  '&.Mui-active': {
                    filter: `drop-shadow(0 0 4px ${alpha(theme.palette.primary.main, 0.4)})`
                  }
                }
              }}
            >
              {steps.map((step, index) => (
                <Step key={step.label} completed={activeStep > index}>
                  <StepLabel 
                    icon={
                      <Box sx={{ 
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {activeStep > index ? (
                          <Check sx={{ color: 'primary.main' }} />
                        ) : (
                          <Box sx={{ 
                            color: activeStep === index ? 'primary.main' : 'text.disabled',
                            display: 'flex'
                          }}>
                            {step.icon}
                          </Box>
                        )}
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
                    seasonality: values.seasonality
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
                        onClick={() => handleNext(validateForm, setTouched)}
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
