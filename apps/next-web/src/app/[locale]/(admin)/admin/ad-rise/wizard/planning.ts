export type PacingPoint = { label: string; weight: number };
export type AllocationTactic = { label: string; weight: number };
export type AllocationTacticsByStage = {
  awareness: AllocationTactic[];
  consideration: AllocationTactic[];
  conversion: AllocationTactic[];
};

export type AllocationResult = {
  google: { awareness: number; consideration: number; conversion: number };
  meta: { awareness: number; consideration: number; conversion: number };
  channelSplit: { google: number; meta: number };
  tactics?: {
    google: AllocationTacticsByStage;
    meta: AllocationTacticsByStage;
  };
  tradeoffs: string[];
};

export type BudgetBandConfig = {
  lowMax: number;
  midMax: number;
};

const DEFAULT_BUDGET_BAND_CONFIG: BudgetBandConfig = {
  lowMax: 500,
  midMax: 1500
};

function resolveBudgetBandConfig(config?: BudgetBandConfig): BudgetBandConfig {
  const lowMax = Math.max(1, Number(config?.lowMax ?? DEFAULT_BUDGET_BAND_CONFIG.lowMax));
  const midBase = Math.max(lowMax + 1, Number(config?.midMax ?? DEFAULT_BUDGET_BAND_CONFIG.midMax));
  const midMax = midBase <= lowMax ? lowMax + 1 : midBase;

  return { lowMax, midMax };
}

export function getDaysInCurrentMonth() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export function calculatePromoWindow(start: string, end: string) {
  if (!start || !end) return 7;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return isNaN(diffDays) || diffDays < 0 ? 0 : diffDays;
}

export function getCampaignDays(values: any) {
  if (values.campaignStart && values.campaignEnd) {
    const startDate = new Date(values.campaignStart);
    const endDate = new Date(values.campaignEnd);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate >= startDate) {
      const diffTime = endDate.getTime() - startDate.getTime();

      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  return getDaysInCurrentMonth();
}

export function getDailyBudget(values: any) {
  const campaignDays = getCampaignDays(values);

  return {
    campaignDays,
    dailyBudget: Math.round((values.budgetMonthly || 0) / Math.max(1, campaignDays))
  };
}

export function getMinViableBudgetWarning(values: any, config?: BudgetBandConfig) {
  const budget = Number(values?.budgetMonthly || 0);
  const goal = String(values?.goal || '').toLowerCase();
  const mode = String(values?.mode || 'QUICK').toUpperCase();
  const isMultiChannel = mode === 'PRO';
  const { lowMax, midMax } = resolveBudgetBandConfig(config);
  const threshold = lowMax;
  const hardFloor = Math.max(25, Math.round(threshold * 0.4));

  if (budget <= 0) return null;

  if (budget < hardFloor) {
    return {
      severity: 'error' as const,
      threshold,
      message: `Budget is very low for ${goal || 'this objective'}. Start with one primary channel to avoid fragmentation.`
    };
  }

  if (budget < threshold) {
    return {
      severity: 'warning' as const,
      threshold,
      message: `Budget is below the recommended minimum for ${goal || 'this objective'}${isMultiChannel ? ' in multi-channel mode' : ''}.`
    };
  }

  if (isMultiChannel && budget <= lowMax) {
    return {
      severity: 'warning' as const,
      threshold,
      message: `Current budget is in your Low band (<= ${lowMax}). Multi-channel delivery may be fragmented.`
    };
  }

  if (isMultiChannel && budget <= midMax) {
    return {
      severity: 'warning' as const,
      threshold,
      message: `Current budget is in your Mid band (<= ${midMax}). Keep testing focused and scale winners gradually.`
    };
  }

  return null;
}

export function getMinViableBudgetGuidance(values: any, config?: BudgetBandConfig) {
  const mode = String(values?.mode || 'QUICK').toUpperCase();
  const isMultiChannel = mode === 'PRO';
  const { lowMax } = resolveBudgetBandConfig(config);
  const threshold = lowMax;

  return {
    threshold,
    note: isMultiChannel
      ? 'Pro mode runs multi-channel planning; lower budgets usually perform better with one primary channel.'
      : 'Quick mode can run lower budgets, but performance improves as budget reaches the recommended level.'
  };
}

export function getBudgetBand(values: any, config?: BudgetBandConfig) {
  const budget = Number(values?.budgetMonthly || 0);
  const { lowMax, midMax } = resolveBudgetBandConfig(config);
  const band = budget <= lowMax ? 'low' : budget <= midMax ? 'mid' : 'high';

  return {
    band,
    lowMax,
    midMax
  };
}

export function getPacingCurve(values: any): PacingPoint[] {
  const isSeasonal = values.seasonality && values.seasonality !== 'none';
  const promoWindow = Number(values.promoWindow || 7);
  const longPromo = promoWindow >= 14;
  const pacing = values.pacing || 'even';

  if (!isSeasonal) {
    if (pacing === 'front_load') {
      return [
        { label: 'Week 1', weight: 40 },
        { label: 'Week 2', weight: 30 },
        { label: 'Week 3', weight: 20 },
        { label: 'Week 4', weight: 10 }
      ];
    }

    if (pacing === 'ramp_up') {
      return [
        { label: 'Week 1', weight: 10 },
        { label: 'Week 2', weight: 20 },
        { label: 'Week 3', weight: 30 },
        { label: 'Week 4', weight: 40 }
      ];
    }

    return [
      { label: 'Week 1', weight: 25 },
      { label: 'Week 2', weight: 25 },
      { label: 'Week 3', weight: 25 },
      { label: 'Week 4', weight: 25 }
    ];
  }

  if (pacing === 'front_load') {
    return [
      { label: 'Ramp-Up', weight: longPromo ? 25 : 35 },
      { label: 'Peak', weight: longPromo ? 35 : 35 },
      { label: 'Sustain', weight: longPromo ? 25 : 20 },
      { label: 'Ramp-Down', weight: longPromo ? 15 : 10 }
    ];
  }

  if (pacing === 'ramp_up') {
    return [
      { label: 'Ramp-Up', weight: longPromo ? 15 : 10 },
      { label: 'Peak', weight: longPromo ? 30 : 25 },
      { label: 'Sustain', weight: longPromo ? 35 : 35 },
      { label: 'Ramp-Down', weight: longPromo ? 20 : 30 }
    ];
  }

  return [
    { label: 'Ramp-Up', weight: longPromo ? 20 : 20 },
    { label: 'Peak', weight: longPromo ? 30 : 30 },
    { label: 'Sustain', weight: longPromo ? 30 : 30 },
    { label: 'Ramp-Down', weight: longPromo ? 20 : 20 }
  ];
}

export function getAllocation(goal: string, budget: number, industry: string, seasonality: string, pacing: string, promoWindow: number): AllocationResult {
  const isLowBudget = budget < 500;
  const isVeryLowBudget = budget < 300;
  const intentDrivenIndustries = ['saas', 'legal', 'finance', 'healthcare', 'local', 'real_estate'];
  const discoveryIndustries = ['fashion', 'food_beverage', 'travel', 'ecommerce'];
  const isIntentDriven = intentDrivenIndustries.includes(industry);
  const isDiscoveryDriven = discoveryIndustries.includes(industry);
  const isSeasonal = seasonality && seasonality !== 'none';
  const longPromo = Number(promoWindow || 7) >= 14;

  const allocation = {
    google: { awareness: 20, consideration: 40, conversion: 40 },
    meta: { awareness: 30, consideration: 40, conversion: 30 }
  };

  let channelSplit = { google: 50, meta: 50 };

  if (goal === 'awareness') {
    allocation.google = { awareness: 50, consideration: 30, conversion: 20 };
    allocation.meta = { awareness: 60, consideration: 30, conversion: 10 };
    channelSplit = { google: 40, meta: 60 };
  } else if (goal === 'traffic') {
    allocation.google = { awareness: 20, consideration: 60, conversion: 20 };
    allocation.meta = { awareness: 30, consideration: 50, conversion: 20 };
    channelSplit = { google: 45, meta: 55 };
  } else if (goal === 'leads' || goal === 'sales') {
    channelSplit = { google: 60, meta: 40 };
  }

  if (isIntentDriven) {
    channelSplit.google = Math.min(80, channelSplit.google + 10);
    channelSplit.meta = 100 - channelSplit.google;
    allocation.google.conversion = Math.min(70, allocation.google.conversion + 10);
    allocation.google.awareness = Math.max(10, allocation.google.awareness - 5);
  }

  if (isDiscoveryDriven) {
    channelSplit.meta = Math.min(80, channelSplit.meta + 10);
    channelSplit.google = 100 - channelSplit.meta;
    allocation.meta.awareness = Math.min(70, allocation.meta.awareness + 10);
    allocation.meta.conversion = Math.max(10, allocation.meta.conversion - 5);
  }

  if (isSeasonal && (pacing === 'front_load' || pacing === 'ramp_up')) {
    const seasonalityBoost = longPromo ? 5 : 10;

    allocation.google.awareness = Math.min(70, allocation.google.awareness + seasonalityBoost);
    allocation.meta.awareness = Math.min(75, allocation.meta.awareness + seasonalityBoost);
    allocation.google.conversion = Math.max(10, allocation.google.conversion - 5);
    allocation.meta.conversion = Math.max(10, allocation.meta.conversion - 5);
  }

  if (isLowBudget) {
    allocation.google.awareness = Math.max(0, allocation.google.awareness - 10);
    allocation.google.conversion = Math.min(100, allocation.google.conversion + 10);
    allocation.meta.awareness = Math.max(0, allocation.meta.awareness - 10);
    allocation.meta.conversion = Math.min(100, allocation.meta.conversion + 10);
  }

  if (isVeryLowBudget) {
    if (channelSplit.google >= channelSplit.meta) {
      channelSplit = { google: 80, meta: 20 };
    } else {
      channelSplit = { google: 20, meta: 80 };
    }
  }

  const normalizeStages = (stages: { awareness: number; consideration: number; conversion: number }) => {
    const total = Math.max(1, stages.awareness + stages.consideration + stages.conversion);

    return {
      awareness: Math.round((stages.awareness / total) * 100),
      consideration: Math.round((stages.consideration / total) * 100),
      conversion: Math.max(0, 100 - Math.round((stages.awareness / total) * 100) - Math.round((stages.consideration / total) * 100))
    };
  };

  const normalizedGoogle = normalizeStages(allocation.google);
  const normalizedMeta = normalizeStages(allocation.meta);

  const tradeoffs: string[] = [];

  if (isLowBudget) {
    tradeoffs.push('With this budget, coverage and testing depth will be limited, especially across two channels.');
    tradeoffs.push('Expect slower learning on upper-funnel audiences while we prioritize conversion efficiency.');
  }

  if (isVeryLowBudget) {
    tradeoffs.push('To avoid fragmentation, spend is concentrated on one primary channel and the secondary channel is kept minimal.');
  }

  return {
    google: normalizedGoogle,
    meta: normalizedMeta,
    channelSplit,
    tradeoffs
  };
}

export function buildFallbackNarrative(params: {
  values: any;
  allocation: AllocationResult;
  dailyBudget: number;
  campaignDays: number;
  currencySymbol?: string;
  dailyUnit?: string;
}) {
  const { values, allocation, dailyBudget, campaignDays, currencySymbol = '$', dailyUnit = '/day' } = params;

  const narrative = `This plan uses approximately ${currencySymbol}${dailyBudget}${dailyUnit} across ${campaignDays} days, split ${allocation.channelSplit.google}% Google and ${allocation.channelSplit.meta}% Meta to match your ${values.goal} objective in ${values.industry}. Funnel weighting is tuned to balance learning and results while protecting efficiency for the available budget.`;

  const assumptions = [
    'Tracking is configured correctly and conversion events fire reliably.',
    'Creative and landing page message match the campaign objective.',
    values.seasonality !== 'none'
      ? `Seasonality window (${values.seasonalityStart || 'start'} to ${values.seasonalityEnd || 'end'}) requires ${values.pacing || 'even'} pacing with ramp phases.`
      : 'No major seasonal spikes are expected during this campaign window.'
  ];

  return { narrative, assumptions };
}
