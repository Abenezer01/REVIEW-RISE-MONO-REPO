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
  Alert,
  Divider,
  CircularProgress,
  Skeleton,
  Fade,
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
  Save as SavedIcon,
  AttachMoney as BudgetIcon,
  TrendingUp as GoalIcon,
  LocalOffer as OfferIcon,
  RateReview as ReviewIcon,
} from '@mui/icons-material';

import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { useTranslations } from 'next-intl';

import StepperWrapper from '@core/styles/stepper';
import { saveSession, getBrandTone, getBusinessDetails, generateCampaignNarrative, generateChannelAllocation } from '@/app/actions/adrise';
import { useSystemMessages } from '@/shared/components/SystemMessageProvider';
import {
  getDailyBudget,
  getPacingCurve,
} from './wizard/planning';
import type { AllocationResult, BudgetBandConfig } from './wizard/planning';
import { downloadSimplePdf } from './wizard/pdf';
import ReviewStep from './wizard/review/ReviewStep';
import BasicsStep from './wizard/steps/BasicsStep';
import BudgetStep from './wizard/steps/BudgetStep';
import GeoStep from './wizard/steps/GeoStep';
import GoalStep from './wizard/steps/GoalStep';
import OfferStep from './wizard/steps/OfferStep';
import ToneStep from './wizard/steps/ToneStep';

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
  budgetConfig?: BudgetBandConfig;
}

const AdRiseWizard = ({
  initialData,
  sessionId,
  onSuccess,
  businessId,
  readOnly = false,
  budgetConfig = { lowMax: 500, midMax: 1500 }
}: AdRiseWizardProps) => {
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
  const shareLinkLabel = 'Share Link';
  const copySharePrompt = 'Copy share URL';
  const [activeStep, setActiveStep] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
  const [showSaved, setShowSaved] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [isDraftRecovered, setIsDraftRecovered] = useState(false);
  const [businessBrandTone, setBusinessBrandTone] = useState<string | null>(null);
  const [businessWebsite, setBusinessWebsite] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [allocationData, setAllocationData] = useState<AllocationResult | null>(null);
  const [isAllocationLoading, setIsAllocationLoading] = useState(false);
  const [narrativeData, setNarrativeData] = useState<{ narrative: string; assumptions: string[] } | null>(null);
  const [isNarrativeLoading, setIsNarrativeLoading] = useState(false);
  const [hasReviewRegenerated, setHasReviewRegenerated] = useState(false);

  const isValidAllocation = (payload: any): payload is AllocationResult => {
    if (!payload || !payload.google || !payload.meta || !payload.channelSplit || !payload.tactics) return false;

    const hasNumericStages = ['awareness', 'consideration', 'conversion'].every((stage) => (
      typeof payload.google[stage] === 'number' && typeof payload.meta[stage] === 'number'
    ));

    const hasValidSplit = typeof payload.channelSplit.google === 'number' && typeof payload.channelSplit.meta === 'number';

    const hasTactics = ['awareness', 'consideration', 'conversion'].every((stage) => (
      Array.isArray(payload.tactics?.google?.[stage]) && Array.isArray(payload.tactics?.meta?.[stage])
    ));

    return hasNumericStages && hasValidSplit && hasTactics;
  };

  const resolveAllocation = useCallback(async (values: any) => {
    const allocationRes = await generateChannelAllocation({
      industry: values.industry,
      goal: values.goal,
      budgetMonthly: values.budgetMonthly,
      seasonality: values.seasonality,
      pacing: values.pacing,
      promoWindow: values.promoWindow,
      audienceNotes: values.audienceNotes,
      competitors: values.competitors,
      locations: values.locations
    });

    const payload = (allocationRes.data as any)?.data ?? allocationRes.data;

    if (allocationRes.success && isValidAllocation(payload)) {
      return payload;
    }

    throw new Error('Failed to generate AI channel allocation');
  }, []);

  const resolveNarrative = useCallback(async (values: any, allocation: AllocationResult) => {
    const { campaignDays, dailyBudget } = getDailyBudget(values);
    const pacingCurve = getPacingCurve(values);
    
    const res = await generateCampaignNarrative({
      sessionName: values.sessionName,
      industry: values.industry,
      offer: values.offer,
      goal: values.goal,
      locations: values.locations,
      budgetMonthly: values.budgetMonthly,
      budgetDaily: dailyBudget,
      campaignDays,
      mode: values.mode,
      brandTone: values.brandTone || businessBrandTone,
      channelSplit: allocation.channelSplit,
      pacingCurve
    });

    const payload = (res.data as any)?.data ?? res.data;

    if (res.success && payload?.narrative && Array.isArray(payload?.assumptions)) {
      return payload as { narrative: string; assumptions: string[] };
    }

    throw new Error('Failed to generate AI narrative');
  }, [businessBrandTone]);

  const regenerateAllocationOnly = useCallback(async (values: any) => {
    setIsAllocationLoading(true);

    try {
      const allocation = await resolveAllocation(values);

      setAllocationData(allocation);
      setHasReviewRegenerated(true);
    } catch (error) {
      console.error('Failed to generate allocation:', error);
      setAllocationData(null);
      notify({ messageCode: 'errors.internalError' as any, variant: 'TOAST', severity: 'error' });
    } finally {
      setIsAllocationLoading(false);
    }
  }, [notify, resolveAllocation]);

  const regenerateNarrativeOnly = useCallback(async (values: any) => {
    setIsNarrativeLoading(true);

    try {
      const allocation = allocationData || await resolveAllocation(values);

      if (!allocationData) {
        setAllocationData(allocation);
      }

      const narrative = await resolveNarrative(values, allocation);

      setNarrativeData(narrative);
      setHasReviewRegenerated(true);
    } catch (error) {
      console.error('Failed to generate narrative:', error);
      setNarrativeData(null);
      notify({ messageCode: 'errors.internalError' as any, variant: 'TOAST', severity: 'error' });
    } finally {
      setIsNarrativeLoading(false);
    }
  }, [allocationData, notify, resolveAllocation, resolveNarrative]);

  // Sync currentSessionId with sessionId prop
  useEffect(() => {
    if (sessionId) {
      setCurrentSessionId(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    setHasReviewRegenerated(false);
  }, [sessionId, initialData]);

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

  // Handle Narrative Fetching on review step (Step 6)
  useEffect(() => {
    if (activeStep !== 6) return;

    if (!narrativeData && typeof initialData?.strategyNarrative === 'string' && initialData.strategyNarrative.trim().length > 0) {
      setNarrativeData({
        narrative: initialData.strategyNarrative,
        assumptions: Array.isArray(initialData?.planningAssumptions) ? initialData.planningAssumptions : []
      });
    }

    if (!allocationData && initialData?.savedAllocation) {
      setAllocationData(initialData.savedAllocation as AllocationResult);
    }
  }, [activeStep, initialData, narrativeData, allocationData]);

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
        inputs: {
          sessionName: values.sessionName,
          industryCustom: values.industryCustom,
          offer: values.offer,
          brandTone: values.brandTone,
          competitors: values.competitors,
          geoCenter: values.geoCenter,
          geoRadius: values.geoRadius,
          audienceNotes: values.audienceNotes,
          seasonality: values.seasonality,
          seasonalityStart: values.seasonalityStart,
          seasonalityEnd: values.seasonalityEnd,
          promoWindow: values.promoWindow,
          landingPage: values.landingPage,
          campaignStart: values.campaignStart,
          campaignEnd: values.campaignEnd,
          pacing: values.pacing
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
      industryCustom: '',
      offer: '',
      goal: '',
      budgetMonthly: 1000,
      pacing: 'even',
      locations: [] as string[],
      brandTone: businessBrandTone || '',
      mode: 'QUICK',
      competitors: [] as string[],
      geoCenter: '',
      geoRadius: 10,
      audienceNotes: '',
      seasonality: 'none',
      seasonalityStart: '',
      seasonalityEnd: '',
      promoWindow: 7,
      landingPage: businessWebsite || '',
      campaignStart: '',
      campaignEnd: ''
    };
  };

  const initialValues = getInitialValues();

  const validationSchema = useMemo(() => [
    // Step 0: Basics
    Yup.object({
      sessionName: Yup.string().required(t('validation.required')),
      industry: Yup.string().required(t('validation.required')),
      landingPage: Yup.string()
        .url(t('validation.invalidUrl'))
        .required(t('validation.required')),
      campaignStart: Yup.string()
        .required(t('validation.required'))
        .test('start-not-in-past', t('validation.invalidDateRange'), function (value) {
          if (!value) return true;
          const selected = new Date(value);
          const today = new Date();

          today.setHours(0, 0, 0, 0);
          selected.setHours(0, 0, 0, 0);

          return selected >= today;
        }),
      campaignEnd: Yup.string()
        .required(t('validation.required'))
        .test('end-not-in-past', t('validation.invalidDateRange'), function (value) {
          if (!value) return true;
          const selected = new Date(value);
          const today = new Date();

          today.setHours(0, 0, 0, 0);
          selected.setHours(0, 0, 0, 0);

          return selected >= today;
        })
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
        then: (schema) => schema
          .required(t('validation.required'))
          .test('seasonality-start-within-campaign', t('validation.invalidDateRange'), function (value) {
            const { campaignStart, campaignEnd } = this.parent;

            if (!value || !campaignStart || !campaignEnd) return true;

            const seasonalityStart = new Date(value);
            const campaignStartDate = new Date(campaignStart);
            const campaignEndDate = new Date(campaignEnd);

            return seasonalityStart >= campaignStartDate && seasonalityStart <= campaignEndDate;
          })
          .test('seasonality-start-before-end', t('validation.invalidDateRange'), function (value) {
            const { seasonalityEnd } = this.parent;

            if (!value || !seasonalityEnd) return true;

            return new Date(value) <= new Date(seasonalityEnd);
          }),
        otherwise: (schema) => schema.notRequired()
      }),
      seasonalityEnd: Yup.string().when('seasonality', {
        is: (val: string) => val !== 'none',
        then: (schema) => schema
          .required(t('validation.required'))
          .test('seasonality-end-within-campaign', t('validation.invalidDateRange'), function (value) {
            const { campaignStart, campaignEnd } = this.parent;

            if (!value || !campaignStart || !campaignEnd) return true;

            const seasonalityEnd = new Date(value);
            const campaignStartDate = new Date(campaignStart);
            const campaignEndDate = new Date(campaignEnd);

            return seasonalityEnd >= campaignStartDate && seasonalityEnd <= campaignEndDate;
          })
          .test('seasonality-end-after-start', t('validation.invalidDateRange'), function (value) {
            const { seasonalityStart } = this.parent;

            if (!value || !seasonalityStart) return true;

            return new Date(value) >= new Date(seasonalityStart);
          }),
        otherwise: (schema) => schema.notRequired()
      })
    }),

    // Step 4: Geo
    Yup.object({
      locations: Yup.array().min(1, t('validation.required')),
      geoCenter: Yup.string().when('mode', {
        is: 'PRO',
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.notRequired()
      })
    }),

    // Step 5: Brand Tone
    Yup.object({
      brandTone: Yup.string().when('mode', {
        is: 'PRO',
        then: (schema) => schema.required(t('validation.required')),
        otherwise: (schema) => schema.notRequired()
      })
    }),

    // Step 6: Review
    Yup.object({})
  ], [t]);

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

  const handleExportJSON = (values: any) => {
    const fallbackPayload = {
      schemaVersion: 'campaign-plan.v1',
      exportedAt: new Date().toISOString(),
      session: {
        id: currentSessionId || null,
        name: values.sessionName || 'Draft Campaign'
      },
      draft: values
    };

    const downloadJson = (payload: any, fileNameBase: string) => {
      const data = JSON.stringify(payload, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `${fileNameBase}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (!currentSessionId) {
      downloadJson(fallbackPayload, `campaign-plan-${values.sessionName || 'draft'}-v1`);

      return;
    }

    fetch(`/api/admin/adrise/sessions/${currentSessionId}/export`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to export plan');
        }

        const payload = await response.json();
        const name = (payload?.session?.name || values.sessionName || 'campaign-plan').replace(/[^a-zA-Z0-9-_]/g, '_');

        downloadJson(payload, `${name}-v1`);
      })
      .catch((error) => {
        console.error('Export failed, falling back to local payload:', error);
        downloadJson(fallbackPayload, `campaign-plan-${values.sessionName || 'draft'}-v1`);
      });
  };

  const handleShareLink = async () => {
    if (!currentSessionId) return;

    try {
      const response = await fetch(`/api/admin/adrise/sessions/${currentSessionId}/share`, { method: 'POST' });

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const json = await response.json();
      const shareUrl = json?.data?.shareUrl as string | undefined;

      if (!shareUrl) {
        throw new Error('Share URL missing from response');
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        window.prompt(copySharePrompt, shareUrl);
      }
    } catch (error) {
      console.error('Failed to generate share URL:', error);
    }
  };

  const handlePrint = (values: any) => {
    const allocation = allocationData;
    const narrative = narrativeData?.narrative || 'Narrative is not available yet.';
    const assumptions = narrativeData?.assumptions || [];
    const tradeoffs = allocation?.tradeoffs?.length ? allocation.tradeoffs : ['No tradeoffs generated.'];
    const campaignDays = getDailyBudget(values).campaignDays;
    const dailyBudget = getDailyBudget(values).dailyBudget;

    const formatPlatformLines = (platform: 'google' | 'meta') => {
      if (!allocation) {
        return ['Allocation is not available.'];
      }

      const platformLabel = platform === 'google' ? 'Google' : 'Meta';
      const platformData = allocation[platform];
      const stageOrder: Array<'awareness' | 'consideration' | 'conversion'> = ['awareness', 'consideration', 'conversion'];

      const lines: string[] = [
        `1. Channel split share: ${allocation.channelSplit[platform]}%`,
        `2. Funnel mix: Awareness ${platformData.awareness}%, Consideration ${platformData.consideration}%, Conversion ${platformData.conversion}%`,
        '3. Tactics by stage:'
      ];

      stageOrder.forEach((stage, stageIdx) => {
        const tactics = allocation.tactics?.[platform]?.[stage] || [];

        lines.push(`   ${stageIdx + 1}. ${stage.toUpperCase()} (${platformData[stage]}%)`);

        if (tactics.length === 0) {
          lines.push('      - No tactics generated.');
        } else {
          tactics.forEach((tactic, tacticIdx) => {
            lines.push(`      - ${tacticIdx + 1}. ${tactic.label} (${tactic.weight}% of ${stage})`);
          });
        }
      });

      lines.push(`4. ${platformLabel} execution focus: prioritize high-intent tactics first, then scale winners.`);

      return lines;
    };

    const strategyLines = [
      `Session: ${values.sessionName || 'Unnamed session'}`,
      `Mode: ${values.mode || 'N/A'}`,
      `Industry: ${values.industryCustom || values.industry || 'N/A'}`,
      `Goal: ${values.goal || 'N/A'}`,
      `Offer: ${values.offer || 'N/A'}`,
      '',
      'Narrative:',
      narrative,
      '',
      'Assumptions:'
    ];

    if (assumptions.length === 0) {
      strategyLines.push('1. No assumptions generated.');
    } else {
      assumptions.forEach((item: string, idx: number) => {
        strategyLines.push(`${idx + 1}. ${item}`);
      });
    }

    downloadSimplePdf({
      fileName: `${(values.sessionName || 'campaign-plan').replace(/[^a-zA-Z0-9-_]/g, '_')}-report`,
      title: 'Campaign Plan Report',
      sections: [
        {
          title: 'Strategy',
          lines: strategyLines
        },
        {
          title: 'Google',
          lines: formatPlatformLines('google')
        },
        {
          title: 'Meta',
          lines: formatPlatformLines('meta')
        },
        {
          title: 'Creatives',
          lines: [
            '1. Google Creative Plan:',
            '   - Build responsive headlines and descriptions per intent cluster.',
            '   - Add sitelinks/callouts/snippets matching the offer.',
            '2. Meta Creative Plan:',
            '   - Prepare feed and story/reel creatives.',
            '   - Match hook, CTA, and landing message across all formats.'
          ]
        },
        {
          title: 'Budget',
          lines: [
            `1. Monthly budget: ${tc('common.currencySymbol') || '$'}${values.budgetMonthly || 0}`,
            `2. Daily budget: ${tc('common.currencySymbol') || '$'}${dailyBudget}`,
            `3. Campaign days: ${campaignDays}`,
            `4. Pacing strategy: ${values.pacing || 'even'}`,
            '5. Tradeoffs:',
            ...tradeoffs.map((item: string, idx: number) => `   - ${idx + 1}. ${item}`)
          ]
        },
        {
          title: 'Execution',
          lines: [
            `1. Locations: ${Array.isArray(values.locations) && values.locations.length > 0 ? values.locations.join(', ') : 'N/A'}`,
            `2. Campaign start: ${values.campaignStart || 'N/A'}`,
            `3. Campaign end: ${values.campaignEnd || 'N/A'}`,
            `4. Landing page: ${values.landingPage || 'N/A'}`,
            '5. Launch checklist:',
            '   - Confirm tracking is active.',
            '   - Confirm creative and copy are approved.',
            '   - Confirm budget and schedule are correct.',
            '   - Confirm audience and location settings are correct.'
          ]
        }
      ]
    });
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
        return <BasicsStep values={values} setFieldValue={setFieldValue} t={t} />;
      case 1:
        return <OfferStep values={values} t={t} />;
      case 2:
        return <GoalStep values={values} setFieldValue={setFieldValue} t={t} />;

      case 3: {
        return <BudgetStep values={values} setFieldValue={setFieldValue} t={t} tc={tc} budgetConfig={budgetConfig} />;
      }

      case 4:
        return <GeoStep values={values} t={t} tc={tc} />;

      case 5:
        return <ToneStep values={values} t={t} businessBrandTone={businessBrandTone} />;

      case 6:
        return (
          <Fade in timeout={500}>
            <Box>
              <ReviewStep
                values={values}
                t={t}
                tc={tc}
                theme={theme}
                readOnly={readOnly}
                currentSessionId={currentSessionId}
                businessBrandTone={businessBrandTone}
                narrativeData={narrativeData}
                isNarrativeLoading={isNarrativeLoading}
                allocationData={allocationData}
                isAllocationLoading={isAllocationLoading}
                onRetryAllocation={() => regenerateAllocationOnly(values)}
                onRegenerateNarrative={() => regenerateNarrativeOnly(values)}
                onRegenerateAssumptions={() => regenerateNarrativeOnly(values)}
                onShare={handleShareLink}
                onExport={() => handleExportJSON(values)}
                onPrint={() => handlePrint(values)}
                shareLabel={shareLinkLabel}
              />
            </Box>
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
                const { campaignDays, dailyBudget } = getDailyBudget(values);
                const shouldIncrementVersion = !currentSessionId || hasReviewRegenerated;
                let allocation = allocationData || (initialData?.savedAllocation as AllocationResult | null) || null;
                const pacingCurve = getPacingCurve(values);
                let finalNarrative = narrativeData || (
                  initialData?.strategyNarrative
                    ? {
                        narrative: initialData.strategyNarrative,
                        assumptions: Array.isArray(initialData?.planningAssumptions) ? initialData.planningAssumptions : []
                      }
                    : null
                );

                if (shouldIncrementVersion && !allocation) {
                  allocation = await resolveAllocation(values);
                  setAllocationData(allocation);
                }

                if (shouldIncrementVersion && !finalNarrative && allocation) {
                  const narrativeRes = await generateCampaignNarrative({
                    sessionName: values.sessionName,
                    industry: values.industry,
                    offer: values.offer,
                    goal: values.goal,
                    locations: values.locations,
                    budgetMonthly: values.budgetMonthly,
                    mode: values.mode,
                    brandTone: values.brandTone || businessBrandTone,
                    channelSplit: allocation?.channelSplit,
                    pacingCurve
                  });

                  const payload = (narrativeRes.data as any)?.data ?? narrativeRes.data;

                  if (narrativeRes.success && payload?.narrative && Array.isArray(payload?.assumptions)) {
                    finalNarrative = payload;
                  }
                }

                if (shouldIncrementVersion && (!allocation || !finalNarrative)) {
                  throw new Error('Failed to generate AI review output');
                }

                const outputPayload = {
                  generatedAt: new Date().toISOString(),
                  session: {
                    name: values.sessionName,
                    mode: values.mode
                  },
                  inputs: {
                    industry: values.industry,
                    industryCustom: values.industryCustom,
                    offer: values.offer,
                    goal: values.goal,
                    budgetMonthly: values.budgetMonthly,
                    budgetDaily: dailyBudget,
                    campaignDays,
                    locations: values.locations,
                    landingPage: values.landingPage,
                    timeline: {
                      campaignStart: values.campaignStart,
                      campaignEnd: values.campaignEnd
                    },
                    brandTone: values.brandTone || businessBrandTone || '',
                    pro: values.mode === 'PRO' ? {
                      competitors: values.competitors,
                      geoCenter: values.geoCenter,
                      geoRadius: values.geoRadius,
                      audienceNotes: values.audienceNotes,
                      seasonality: values.seasonality,
                      seasonalityStart: values.seasonalityStart,
                      seasonalityEnd: values.seasonalityEnd,
                      promoWindow: values.promoWindow,
                      pacing: values.pacing
                    } : null
                  },
                  plan: {
                    allocation: allocation || null,
                    pacingCurve,
                    narrative: finalNarrative?.narrative || null,
                    assumptions: finalNarrative?.assumptions || []
                  }
                };

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
                    industryCustom: values.industryCustom,
                    offer: values.offer,
                    brandTone: values.brandTone,
                    competitors: values.competitors,
                    geoCenter: values.geoCenter,
                    geoRadius: values.geoRadius,
                    audienceNotes: values.audienceNotes,
                    seasonality: values.seasonality,
                    seasonalityStart: values.seasonalityStart,
                    seasonalityEnd: values.seasonalityEnd,
                    promoWindow: values.promoWindow,
                    landingPage: values.landingPage,
                    campaignStart: values.campaignStart,
                    campaignEnd: values.campaignEnd,
                    pacing: values.pacing,
                    strategyNarrative: finalNarrative?.narrative || initialData?.strategyNarrative || null,
                    planningAssumptions: finalNarrative?.assumptions || initialData?.planningAssumptions || []
                  },
                  incrementVersion: shouldIncrementVersion,
                  output: shouldIncrementVersion ? outputPayload : undefined,
                  outputStatus: shouldIncrementVersion ? 'success' : undefined
                });

                if (result.success) {
                  localStorage.removeItem(AUTOSAVE_KEY);
                  onSuccess?.(result.data);
                } else {
                  console.error('Failed to save session:', result.error);
                  notify({ messageCode: 'errors.internalError' as any, variant: 'TOAST', severity: 'error' });
                }
              } catch (error) {
                console.error('Error submitting form:', error);
                notify({ messageCode: 'errors.internalError' as any, variant: 'TOAST', severity: 'error' });
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

                <Box sx={{ minHeight: 300, py: 4 }}>
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
