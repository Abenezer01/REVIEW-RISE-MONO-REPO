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
