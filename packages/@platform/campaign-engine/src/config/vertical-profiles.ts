export type VerticalType = 'Local Service' | 'E-commerce' | 'SaaS' | 'Restaurant' | 'Healthcare' | 'Other';

export interface FunnelSplit {
    awareness: number;
    consideration: number;
    conversion: number;
}

export interface VerticalProfile {
    name: VerticalType;
    recommendedFunnelSplit: FunnelSplit;
    conversionType: string;
    typicalKPIs: string[];
    // v4 Data
    avgCpc: number;
    negativeKeywords: string[];
    // ROI Benchmarks
    benchmarks: {
        cvr: { BOF: number; MOF: number; TOF: number };
        cpa_target: number;
    };
}

export const VERTICAL_PROFILES: Record<VerticalType, VerticalProfile> = {
    'Local Service': {
        name: 'Local Service',
        recommendedFunnelSplit: { awareness: 0.1, consideration: 0.2, conversion: 0.7 },
        conversionType: 'Lead Form / Call',
        typicalKPIs: ['CPA', 'Call Volume', 'Lead Quality'],
        avgCpc: 12.50,
        negativeKeywords: ['job', 'hiring', 'salary', 'career', 'diy', 'course', 'training'],
        benchmarks: {
            cvr: { BOF: 0.15, MOF: 0.05, TOF: 0.01 }, // High intent = high CVR
            cpa_target: 45.00
        }
    },
    'E-commerce': {
        name: 'E-commerce',
        recommendedFunnelSplit: { awareness: 0.4, consideration: 0.4, conversion: 0.2 }, // Heavy prospecting
        conversionType: 'Purchase',
        typicalKPIs: ['ROAS', 'AOV', 'CAC'],
        avgCpc: 2.50,
        negativeKeywords: ['free', 'hack', 'torrent', 'review'],
        benchmarks: {
            cvr: { BOF: 0.04, MOF: 0.02, TOF: 0.005 }, // Volume play
            cpa_target: 30.00
        }
    },
    'SaaS': {
        name: 'SaaS',
        recommendedFunnelSplit: { awareness: 0.3, consideration: 0.3, conversion: 0.4 },
        conversionType: 'Free Trial / Demo',
        typicalKPIs: ['CPL', 'SQL', 'Trial-to-Paid'],
        avgCpc: 15.00,
        negativeKeywords: ['login', 'support', 'careers', 'stock', 'share price'],
        benchmarks: {
            cvr: { BOF: 0.08, MOF: 0.03, TOF: 0.01 },
            cpa_target: 120.00
        }
    },
    'Restaurant': {
        name: 'Restaurant',
        recommendedFunnelSplit: { awareness: 0.6, consideration: 0.3, conversion: 0.1 }, // Heavy local awareness
        conversionType: 'Reservation / Walk-in',
        typicalKPIs: ['Reach', 'Engagement', 'Reservations'],
        avgCpc: 1.50, // Usually cheap on Search, but mostly Maps
        negativeKeywords: ['recipe', 'delivery job', 'waiter salary'],
        benchmarks: {
            cvr: { BOF: 0.12, MOF: 0.06, TOF: 0.02 },
            cpa_target: 15.00
        }
    },
    'Healthcare': {
        name: 'Healthcare',
        recommendedFunnelSplit: { awareness: 0.2, consideration: 0.3, conversion: 0.5 },
        conversionType: 'Appointment',
        typicalKPIs: ['CPA', 'Appointment Rate', 'Patient LTV'],
        avgCpc: 8.00,
        negativeKeywords: ['school', 'degree', 'salary', 'research'],
        benchmarks: {
            cvr: { BOF: 0.10, MOF: 0.04, TOF: 0.01 },
            cpa_target: 60.00
        }
    },
    'Other': {
        name: 'Other',
        recommendedFunnelSplit: { awareness: 0.3, consideration: 0.3, conversion: 0.4 }, // Balanced approach
        conversionType: 'Conversion',
        typicalKPIs: ['CPA', 'CTR', 'Conversion Rate'],
        avgCpc: 5.00, // Generic mid-range CPC
        negativeKeywords: ['free', 'job', 'salary', 'career'],
        benchmarks: {
            cvr: { BOF: 0.05, MOF: 0.02, TOF: 0.01 },
            cpa_target: 50.00
        }
    }
};
