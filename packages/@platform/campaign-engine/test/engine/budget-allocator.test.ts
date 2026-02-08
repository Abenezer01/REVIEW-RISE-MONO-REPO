
import { getBudgetTier, BudgetTier } from '../../src/engine/budget-allocator';
import { BUDGET_THRESHOLDS, BUDGET_TIERS } from '../../src/constants';

// Mock constants if needed or rely on real ones
jest.mock('../../src/constants', () => ({
    BUDGET_THRESHOLDS: {
        SMALL: 1000,
        MEDIUM: 5000
    },
    BUDGET_TIERS: {
        SMALL: { recommendation: 'Focus on core keywords', campaignLimit: 1 },
        MEDIUM: { recommendation: 'Expand to broad match', campaignLimit: 3 },
        LARGE: { recommendation: 'Full funnel strategy', campaignLimit: 10 }
    }
}));

describe('Budget Allocator', () => {
    it('should return Small tier for budget < 1000', () => {
        const result = getBudgetTier(500);
        expect(result.tier).toBe('Small');
        expect(result.campaignLimit).toBe(1);
    });

    it('should return Medium tier for budget >= 1000 and < 5000', () => {
        const result = getBudgetTier(2500);
        expect(result.tier).toBe('Medium');
        expect(result.campaignLimit).toBe(3);
    });

    it('should return Large tier for budget >= 5000', () => {
        const result = getBudgetTier(10000);
        expect(result.tier).toBe('Large');
        expect(result.campaignLimit).toBe(10);
    });
});
