import { CampaignInput } from '../schema/campaign-plan';
import { VERTICAL_PROFILES } from '../config/vertical-profiles';

export interface BudgetRecommendation {
    minDailyBudget: number;
    recommendedDailyBudget: number;
    budgetType: 'CBO' | 'ABO'; // Campaign Budget Optimization vs Ad Set Budget Optimization
    rationale: string;
    learningPhaseEstimate: {
        eventsPerWeek: number;
        status: 'Healthy' | 'Risk' | 'Starved';
    };
}

export class MetaBudgetEngine {

    /**
     * Calculates the budget required to exit the learning phase (approx 50 conversions/week).
     */
    public calculateBudget(input: CampaignInput, adSetCount: number): BudgetRecommendation {
        const profile = VERTICAL_PROFILES[input.vertical] || VERTICAL_PROFILES['Other'];
        const targetCpa = profile.benchmarks.cpa_target; // e.g. $45 for Local Service

        // Rule of thumb: 50 conversions per week to exit learning phase
        const eventsNeededPerWeek = 50;
        const eventsNeededPerDay = eventsNeededPerWeek / 7;

        // Minimum daily spend per ad set to generate ~7 events/day
        const minDailySpendPerAdSet = eventsNeededPerDay * targetCpa;

        // Total min budget for the whole campaign (if ABO, sum of ad sets; if CBO, total pool)
        // If we have multiple ad sets, CBO is usually more efficient for learning.
        const totalMinDailyBudget = Math.round(minDailySpendPerAdSet * adSetCount);

        // Actual User Budget
        const userDailyBudget = input.budget / 30; // Assuming monthly budget input? 
        // Or is input.budget Total for campaign duration?
        // Let's assume input.budget is Total Montly Spend for now as per usual SaaS inputs.

        let budgetType: 'CBO' | 'ABO' = 'CBO';
        let rationale = '';

        if (userDailyBudget >= totalMinDailyBudget) {
            rationale = 'Budget is sufficient to support all ad sets exiting the learning phase.';
        } else {
            rationale = `Budget is tight. Recommended minimum for ${adSetCount} ad sets is $${totalMinDailyBudget}/day to exit learning phase based on estimated CPA of $${targetCpa}.`;
            // If budget is low, maybe recommend ABO to force spend? Or CBO to consolidate?
            // Usually consolidation is better for low budget -> CBO.
            budgetType = 'CBO';
        }

        const projectedEventsPerWeek = Math.round((userDailyBudget * 7) / targetCpa);
        let learningStatus: 'Healthy' | 'Risk' | 'Starved' = 'Healthy';

        if (projectedEventsPerWeek < 25) {
            learningStatus = 'Starved';
        } else if (projectedEventsPerWeek < 50) {
            learningStatus = 'Risk';
        }

        return {
            minDailyBudget: totalMinDailyBudget,
            recommendedDailyBudget: userDailyBudget,
            budgetType,
            rationale,
            learningPhaseEstimate: {
                eventsPerWeek: projectedEventsPerWeek,
                status: learningStatus
            }
        };
    }
}

export const metaBudgetEngine = new MetaBudgetEngine();
