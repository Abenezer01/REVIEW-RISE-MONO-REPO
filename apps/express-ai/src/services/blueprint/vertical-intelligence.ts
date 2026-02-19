export interface VerticalData {
    avgCPC: { low: number; high: number };
    avgCTR: number;
    conversionDifficulty: number; // 1-10
    negativeKeywords: string[];
}

export class VerticalIntelligence {
    getVerticalData(vertical: string): VerticalData {
        const normalized = vertical.toLowerCase();

        if (normalized.includes('local service') || normalized.includes('plumber') || normalized.includes('contractor')) {
            return {
                avgCPC: { low: 5.00, high: 25.00 },
                avgCTR: 0.045, // 4.5%
                conversionDifficulty: 6,
                negativeKeywords: ['parts', 'supply', 'wholesale', 'jobs', 'apprenticeship', 'salary', 'diy', 'how to']
            };
        }

        if (normalized.includes('e-commerce') || normalized.includes('retail')) {
            return {
                avgCPC: { low: 0.50, high: 3.00 },
                avgCTR: 0.02, // 2%
                conversionDifficulty: 4,
                negativeKeywords: ['free', 'hiring', 'review', 'complaints', 'scam', 'login', 'customer service']
            };
        }

        if (normalized.includes('saas') || normalized.includes('software')) {
            return {
                avgCPC: { low: 10.00, high: 80.00 },
                avgCTR: 0.03, // 3%
                conversionDifficulty: 8,
                negativeKeywords: ['crack', 'torrent', 'free download', 'open source', 'login', 'support']
            };
        }

        if (normalized.includes('healthcare') || normalized.includes('medical')) {
            return {
                avgCPC: { low: 8.00, high: 40.00 },
                avgCTR: 0.05, // 5%
                conversionDifficulty: 7,
                negativeKeywords: ['school', 'training', 'salary', 'jobs', 'research', 'statistics']
            };
        }

        // Default / Other
        return {
            avgCPC: { low: 2.00, high: 10.00 },
            avgCTR: 0.035,
            conversionDifficulty: 5,
            negativeKeywords: ['free', 'cheap', 'jobs', 'hiring']
        };
    }
}

export const verticalIntelligence = new VerticalIntelligence();
