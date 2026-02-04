export type VerticalType = 'Local Service' | 'E-commerce' | 'SaaS' | 'Restaurant' | 'Healthcare';

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
}

export const VERTICAL_PROFILES: Record<VerticalType, VerticalProfile> = {
    'Local Service': {
        name: 'Local Service',
        recommendedFunnelSplit: { awareness: 0.1, consideration: 0.2, conversion: 0.7 },
        conversionType: 'Lead Form / Call',
        typicalKPIs: ['CPA', 'Call Volume', 'Lead Quality']
    },
    'E-commerce': {
        name: 'E-commerce',
        recommendedFunnelSplit: { awareness: 0.4, consideration: 0.4, conversion: 0.2 }, // Heavy prospecting
        conversionType: 'Purchase',
        typicalKPIs: ['ROAS', 'AOV', 'CAC']
    },
    'SaaS': {
        name: 'SaaS',
        recommendedFunnelSplit: { awareness: 0.3, consideration: 0.3, conversion: 0.4 },
        conversionType: 'Free Trial / Demo',
        typicalKPIs: ['CPL', 'SQL', 'Trial-to-Paid']
    },
    'Restaurant': {
        name: 'Restaurant',
        recommendedFunnelSplit: { awareness: 0.6, consideration: 0.3, conversion: 0.1 }, // Heavy local awareness
        conversionType: 'Reservation / Walk-in',
        typicalKPIs: ['Reach', 'Engagement', 'Reservations']
    },
    'Healthcare': {
        name: 'Healthcare',
        recommendedFunnelSplit: { awareness: 0.2, consideration: 0.3, conversion: 0.5 },
        conversionType: 'Appointment',
        typicalKPIs: ['CPA', 'Appointment Rate', 'Patient LTV']
    }
};
