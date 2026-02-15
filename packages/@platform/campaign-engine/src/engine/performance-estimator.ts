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
        const profile = VERTICAL_PROFILES[input.vertical];
        const avgCpc = profile.avgCpc || input.expectedAvgCpc || 5.0; // Fallback

        // Base metrics (mocked ranges based on profile if we had them, otherwise generics)
        // Vertical Profiles currently have `avgCpc`. We can add CTR/CVR later or use hardcoded heuristics here.

        // Heuristic Benchmarks
        const benchmarks = {
            'Local Service': { ctr: '4-6%', cvr: '10-15%' },
            'E-commerce': { ctr: '2-3%', cvr: '1-3%' },
            'SaaS': { ctr: '2-4%', cvr: '2-5%' },
            'Restaurant': { ctr: '5-8%', cvr: '8-12%' },
            'Healthcare': { ctr: '3-5%', cvr: '5-10%' },
            'Other': { ctr: '3-5%', cvr: '2-5%' }
        };

        const metrics = benchmarks[input.vertical] || { ctr: '3-5%', cvr: '2-5%' };

        // Lead Volume
        // Simple: Budget / CPA.   CPA = CPC / CVR.
        // Let's use the click capacity.
        // Clicks * CVR = Conversions.
        // CVR (midpoint of range)
        const cvrStr = metrics.cvr.replace('%', ''); // e.g. "10-15"
        const [minC, maxC] = cvrStr.split('-').map(s => parseFloat(s));
        const avgCvrPercent = (minC + maxC) / 2;
        const estimatedConversions = Math.floor(clickCapacity * (avgCvrPercent / 100));

        return {
            expectedCtr: metrics.ctr,
            expectedCpc: `$${(avgCpc * 0.8).toFixed(2)} - $${(avgCpc * 1.2).toFixed(2)}`,
            expectedCvr: metrics.cvr,
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
