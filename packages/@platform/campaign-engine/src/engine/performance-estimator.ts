import { CampaignInput } from '../schema/campaign-plan';
import { VERTICAL_PROFILES } from '../config/vertical-profiles';

export interface PerformanceEstimates {
    expectedCtr: string;
    expectedCpc: string;
    expectedCvr: string;
    leadVolumeProjection: string;
    conversionDifficulty: number;
    competitionLevel: 'Low' | 'Medium' | 'High';
}

export class PerformanceEstimator {

    public estimate(input: CampaignInput, clickCapacity: number): PerformanceEstimates {
        const profile = VERTICAL_PROFILES[input.vertical] || VERTICAL_PROFILES['Other'];
        const avgCpc = profile.avgCpc || input.expectedAvgCpc || 5.0; // Fallback

        // 1. Get Benchmarks from Vertical Profile
        const metrics = {
            ctr: (input.vertical === 'Local Service') ? '4-6%' : '3-5%', // Simple heuristic for CTR
            cvr: profile.benchmarks?.cvr || { BOF: 0.05, MOF: 0.03, TOF: 0.01 },
            cpaTarget: profile.benchmarks?.cpa_target || 50.00
        };

        // 2. Calculate Weighted Average CVR
        // Assumption: 60% BOF, 30% MOF, 10% TOF traffic mix for a healthy campaign
        const weightedCvr = (metrics.cvr.BOF * 0.6) + (metrics.cvr.MOF * 0.3) + (metrics.cvr.TOF * 0.1);

        // 3. Lead Volume Projection
        // Clicks * Weighted CVR = Conversions
        const estimatedConversions = Math.floor(clickCapacity * weightedCvr);

        return {
            expectedCtr: metrics.ctr,
            expectedCpc: `$${(avgCpc * 0.8).toFixed(2)} - $${(avgCpc * 1.2).toFixed(2)}`,
            expectedCvr: `${(weightedCvr * 100).toFixed(1)}%`,
            leadVolumeProjection: `${Math.floor(estimatedConversions * 0.8)} - ${Math.ceil(estimatedConversions * 1.2)} / month`,
            conversionDifficulty: this.calculateDifficulty(input.budget, avgCpc),
            competitionLevel: 'Medium' // Placeholder
        };
    }

    private calculateDifficulty(budget: number, cpc: number): number {
        // Low budget + High CPC = Hard
        const clicks = budget / cpc;
        if (clicks < 50) return 9;
        if (clicks < 200) return 6;
        return 3;
    }
}

export const performanceEstimator = new PerformanceEstimator();
