import { CampaignInput, AdGroupSchema } from '../schema/campaign-plan';
import { z } from 'zod';

type AdGroup = z.infer<typeof AdGroupSchema>;

export interface BudgetAllocation {
    percentage: number;
    amount: number;
    estimatedClicks: number;
    estimatedConversions: number;
    estimatedCpa: number;
    learningPhaseStatus: 'Healthy' | 'Risk' | 'Starved';
}

export interface AdGroupWithBudget extends AdGroup {
    budgetAllocation: BudgetAllocation;
}

/**
 * AI-Guided Budget Optimization Engine
 * Uses weighted additive scoring and ROI modeling to distribute budget.
 */
export class BudgetAllocator {

    // 1. Scoring Weights (Additive)
    // Sum should ideally be close to 1.0, but normalization handles it anyway.
    private readonly SCORING_WEIGHTS = {
        FUNNEL: 0.5,   // 50% impact
        INTENT: 0.3,   // 30% impact
        DENSITY: 0.2   // 20% impact
    };

    // Funnel Stage Scores (0-10 scale)
    private readonly FUNNEL_SCORES = {
        'BOF': 10,
        'MOF': 6,
        'TOF': 3
    };

    // Intent Multipliers (used as raw score inputs 0-10)
    private readonly INTENT_SCORES = {
        HIGH: 10,    // Brand/Emergency
        MEDIUM: 7,   // Service
        LOW: 4,      // Problem
        MINIMAL: 2   // Generic
    };

    // Constraints
    private readonly MIN_ALLOCATION = 0.03;  // 3% minimum (Hard floor)
    private readonly MAX_ALLOCATION = 0.40;  // 40% maximum (Hard cap)

    /**
     * Allocate budget across ad groups intelligently
     */
    public allocateBudget(
        adGroups: AdGroup[],
        totalBudget: number,
        avgCpc: number,
        cvrBenchmarks: { BOF: number; MOF: number; TOF: number } = { BOF: 0.1, MOF: 0.05, TOF: 0.02 } // Default fallbacks
    ): AdGroupWithBudget[] {

        if (adGroups.length === 0) {
            return [];
        }

        // 1. Calculate weighted priority scores
        const scores = adGroups.map(ag => this.calculateWeightedScore(ag));
        const totalScore = scores.reduce((sum, score) => sum + score, 0);

        // 2. Calculate raw percentages
        let allocations = scores.map(score => score / totalScore);

        // 3. Apply constraints (min/max)
        allocations = this.applyConstraints(allocations);

        // 4. Normalize to ensure total = 100%
        allocations = this.normalize(allocations);

        // 5. Build result with ROI modeling
        return adGroups.map((ag, index) => {
            const percentage = allocations[index];
            const amount = totalBudget * percentage;

            // ROI Modeling
            const estimatedClicks = Math.floor(amount / avgCpc);

            // Get CVR based on funnel stage
            const cvr = cvrBenchmarks[ag.funnelStage as 'BOF' | 'MOF' | 'TOF'] || 0.05;
            const estimatedConversions = Math.max(0, parseFloat((estimatedClicks * cvr).toFixed(1))); // Can be decimal (e.g. 0.5 conv/mo)

            // Calculate CPA (Sanitized)
            // If < 1 conversion, CPA blows up. Cap it or use projected CPC/CVR.
            let estimatedCpa = 0;
            if (estimatedConversions >= 1) {
                estimatedCpa = amount / estimatedConversions;
            } else {
                // Fallback for low volume: Just show Target CPA from profile or a capped value
                estimatedCpa = (amount / (estimatedClicks * cvr)) || 0;
            }

            // Learning Phase Logic (Relaxed for small businesses)
            // Healthy: > 5 conversions OR > 100 clicks (Data density)
            // Risk: < 5 conversions but > 30 clicks
            // Starved: < 30 clicks (Google AI has zero signal)
            let learningStatus: 'Healthy' | 'Risk' | 'Starved' = 'Healthy';

            if (estimatedClicks < 30) {
                learningStatus = 'Starved';
            } else if (estimatedConversions < 5 && estimatedClicks < 100) {
                learningStatus = 'Risk';
            }

            return {
                ...ag,
                budgetAllocation: {
                    percentage: Math.round(percentage * 100) / 100,
                    amount: Math.round(amount * 100) / 100,
                    estimatedClicks,
                    estimatedConversions,
                    estimatedCpa: Math.round(estimatedCpa * 100) / 100,
                    learningPhaseStatus: learningStatus
                }
            };
        });
    }

    /**
     * Calculate Weighted Additive Score
     * Score = (W_Funnel * S_Funnel) + (W_Intent * S_Intent) + (W_Density * S_Density)
     */
    private calculateWeightedScore(adGroup: AdGroup): number {
        // 1. Funnel Score (0-10)
        const funnelScore = this.FUNNEL_SCORES[adGroup.funnelStage as 'BOF' | 'MOF' | 'TOF'] || 5;

        // 2. Intent Score (0-10)
        const intentStrength = this.estimateIntentStrength(adGroup);
        const intentScore = this.getIntentScore(intentStrength);

        // 3. Density Score (0-10)
        // Normalize keyword count to 0-10 scale (capped at 20 keywords)
        const keywordCount = adGroup.keywords.length;
        const densityScore = Math.min(10, (keywordCount / 20) * 10);

        // Weighted Sum
        return (
            (this.SCORING_WEIGHTS.FUNNEL * funnelScore) +
            (this.SCORING_WEIGHTS.INTENT * intentScore) +
            (this.SCORING_WEIGHTS.DENSITY * densityScore)
        );
    }

    /**
     * Estimate intent strength from ad group characteristics (0-10 scale)
     */
    private estimateIntentStrength(adGroup: AdGroup): number {
        const name = adGroup.adGroupName.toLowerCase();

        // Brand/Emergency = High
        if (name.includes('emergency') || name.includes('brand')) return 9;

        // Service/BOF = Medium-High
        if (name.includes('service') || adGroup.funnelStage === 'BOF') return 7;

        // Problem/TOF = Low-Medium
        if (name.includes('problem') || adGroup.funnelStage === 'TOF') return 4;

        // Default
        return 5;
    }

    private getIntentScore(strength: number): number {
        if (strength >= 9) return this.INTENT_SCORES.HIGH;
        if (strength >= 7) return this.INTENT_SCORES.MEDIUM;
        if (strength >= 4) return this.INTENT_SCORES.LOW;
        return this.INTENT_SCORES.MINIMAL;
    }

    private applyConstraints(allocations: number[]): number[] {
        return allocations.map(alloc => {
            if (alloc < this.MIN_ALLOCATION) return this.MIN_ALLOCATION;
            if (alloc > this.MAX_ALLOCATION) return this.MAX_ALLOCATION;
            return alloc;
        });
    }

    private normalize(allocations: number[]): number[] {
        const sum = allocations.reduce((a, b) => a + b, 0);
        if (sum === 0) return allocations;
        return allocations.map(alloc => alloc / sum);
    }
}

export const budgetAllocator = new BudgetAllocator();
