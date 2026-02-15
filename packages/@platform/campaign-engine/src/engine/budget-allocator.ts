import { CampaignInput, AdGroupSchema } from '../schema/campaign-plan';
import { z } from 'zod';

type AdGroup = z.infer<typeof AdGroupSchema>;

export interface BudgetAllocation {
    percentage: number;
    amount: number;
    estimatedClicks: number;
}

export interface AdGroupWithBudget extends AdGroup {
    budgetAllocation: BudgetAllocation;
}

/**
 * Production-Grade Budget Allocator
 * Distributes budget across ad groups based on:
 * - Funnel Stage Priority (BOF > MOF > TOF)
 * - Intent Strength (9-10 > 7-8 > 4-6 > 1-3)
 * - Keyword Density (more keywords = slightly higher budget)
 */
export class BudgetAllocator {

    // Funnel stage multipliers (BOF gets highest priority)
    private readonly FUNNEL_WEIGHTS = {
        'BOF': 3.0,  // Bottom of Funnel - Ready to convert
        'MOF': 1.5,  // Middle of Funnel - Consideration
        'TOF': 0.5   // Top of Funnel - Awareness
    };

    // Intent strength multipliers
    private readonly INTENT_MULTIPLIERS = {
        HIGH: 1.5,    // 9-10: Emergency, Brand
        MEDIUM: 1.2,  // 7-8: Service
        LOW: 1.0,     // 4-6: Problem
        MINIMAL: 0.8  // 1-3: Generic
    };

    // Constraints
    private readonly MIN_ALLOCATION = 0.03;  // 3% minimum
    private readonly MAX_ALLOCATION = 0.40;  // 40% maximum

    /**
     * Allocate budget across ad groups intelligently
     */
    public allocateBudget(
        adGroups: AdGroup[],
        totalBudget: number,
        avgCpc: number
    ): AdGroupWithBudget[] {

        if (adGroups.length === 0) {
            return [];
        }

        // 1. Calculate priority scores for each ad group
        const scores = adGroups.map(ag => this.calculatePriorityScore(ag));
        const totalScore = scores.reduce((sum, score) => sum + score, 0);

        // 2. Calculate raw percentages
        let allocations = scores.map(score => score / totalScore);

        // 3. Apply constraints (min/max)
        allocations = this.applyConstraints(allocations);

        // 4. Normalize to ensure total = 100%
        allocations = this.normalize(allocations);

        // 5. Build result with budget details
        return adGroups.map((ag, index) => {
            const percentage = allocations[index];
            const amount = totalBudget * percentage;
            const estimatedClicks = Math.floor(amount / avgCpc);

            return {
                ...ag,
                budgetAllocation: {
                    percentage: Math.round(percentage * 100) / 100, // Round to 2 decimals
                    amount: Math.round(amount * 100) / 100,
                    estimatedClicks
                }
            };
        });
    }

    /**
     * Calculate priority score for an ad group
     */
    private calculatePriorityScore(adGroup: AdGroup): number {
        // Base score from funnel stage
        const funnelWeight = this.FUNNEL_WEIGHTS[adGroup.funnelStage] || 1.0;

        // Intent strength multiplier (from metadata if available, otherwise estimate)
        const intentStrength = this.estimateIntentStrength(adGroup);
        const intentMultiplier = this.getIntentMultiplier(intentStrength);

        // Keyword density bonus (more keywords = slightly higher budget, capped at 1.2x)
        const keywordCount = adGroup.keywords.length;
        const densityBonus = Math.min(1.2, 1.0 + (keywordCount / 100));

        return funnelWeight * intentMultiplier * densityBonus;
    }

    /**
     * Estimate intent strength from ad group characteristics
     */
    private estimateIntentStrength(adGroup: AdGroup): number {
        const name = adGroup.adGroupName.toLowerCase();

        // Emergency/Brand = High intent
        if (name.includes('emergency') || name.includes('brand')) {
            return 9;
        }

        // Service = Medium-high intent
        if (name.includes('service') || adGroup.funnelStage === 'BOF') {
            return 7;
        }

        // Problem = Medium intent
        if (name.includes('problem') || adGroup.funnelStage === 'TOF') {
            return 5;
        }

        // Default
        return 6;
    }

    /**
     * Get intent multiplier based on strength
     */
    private getIntentMultiplier(strength: number): number {
        if (strength >= 9) return this.INTENT_MULTIPLIERS.HIGH;
        if (strength >= 7) return this.INTENT_MULTIPLIERS.MEDIUM;
        if (strength >= 4) return this.INTENT_MULTIPLIERS.LOW;
        return this.INTENT_MULTIPLIERS.MINIMAL;
    }

    /**
     * Apply min/max constraints to allocations
     */
    private applyConstraints(allocations: number[]): number[] {
        return allocations.map(alloc => {
            if (alloc < this.MIN_ALLOCATION) return this.MIN_ALLOCATION;
            if (alloc > this.MAX_ALLOCATION) return this.MAX_ALLOCATION;
            return alloc;
        });
    }

    /**
     * Normalize allocations to sum to 1.0 (100%)
     */
    private normalize(allocations: number[]): number[] {
        const sum = allocations.reduce((a, b) => a + b, 0);
        if (sum === 0) return allocations; // Avoid division by zero
        return allocations.map(alloc => alloc / sum);
    }
}

export const budgetAllocator = new BudgetAllocator();
