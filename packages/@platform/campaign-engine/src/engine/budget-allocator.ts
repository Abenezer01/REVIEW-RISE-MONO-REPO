import { CampaignInput } from '../schema/campaign-plan';
import { BUDGET_THRESHOLDS, BUDGET_TIERS } from '../constants';

export interface BudgetTier {
    tier: 'Small' | 'Medium' | 'Large';
    recommendation: string;
    campaignLimit: number;
}

export const getBudgetTier = (budget: number): BudgetTier => {
    if (budget < BUDGET_THRESHOLDS.SMALL) {
        return { ...BUDGET_TIERS.SMALL, tier: 'Small' };
    } else if (budget < BUDGET_THRESHOLDS.MEDIUM) {
        return { ...BUDGET_TIERS.MEDIUM, tier: 'Medium' };
    } else {
        return { ...BUDGET_TIERS.LARGE, tier: 'Large' };
    }
};
