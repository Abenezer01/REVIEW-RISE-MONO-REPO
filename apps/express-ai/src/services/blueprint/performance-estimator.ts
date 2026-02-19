import { verticalIntelligence } from './vertical-intelligence';
import { PerformanceAssumptions } from '@platform/contracts';

export class PerformanceEstimator {
    estimate(vertical: string, intent: string): PerformanceAssumptions {
        const data = verticalIntelligence.getVerticalData(vertical);

        let multiplier = 1.0;
        if (intent === 'High Intent (BOF)') multiplier = 1.5; // Higher CPC for high intent
        if (intent === 'Research (TOF/MOF)') multiplier = 0.6; // Lower CPC for research

        const estimatedCPC = {
            low: (data.avgCPC.low * multiplier).toFixed(2),
            high: (data.avgCPC.high * multiplier).toFixed(2)
        };

        return {
            expectedCTR: `${(data.avgCTR * 100).toFixed(1)}% - ${(data.avgCTR * 1.5 * 100).toFixed(1)}%`,
            expectedCPC: `$${estimatedCPC.low} - $${estimatedCPC.high}`,
            conversionDifficulty: data.conversionDifficulty
        };
    }
}

export const performanceEstimator = new PerformanceEstimator();
