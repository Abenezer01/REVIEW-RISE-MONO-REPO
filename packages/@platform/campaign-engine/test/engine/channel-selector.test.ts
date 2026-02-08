
import { calculateChannelAllocations } from '../../src/engine/channel-selector';
import { CampaignInput, CampaignObjective } from '../../src/schema/campaign-plan';

// Mock input
const mockInput = (objective: CampaignObjective, budget: number, vertical: any = 'Local Service'): CampaignInput => ({
    objective,
    budget,
    vertical,
    brandName: 'Test Biz',
    currency: 'USD'
});

jest.mock('../../src/constants', () => ({
    OBJECTIVE_CHANNEL_RULES: {
        'Awareness': {
            channels: { 'Google Search': 0.5, 'TikTok': 0.5 },
            rationale: 'Split exposure.'
        },
        'Leads': {
            channels: { 'Google Search': 1.0 },
            rationale: 'High intent only.'
        }
    }
}));

describe('Channel Selector', () => {
    it('should fallback if objective not found', () => {
        const input = mockInput('Sales' as any, 1000);
        const result = calculateChannelAllocations(input);
        expect(result[0].channel).toBe('Google Search');
        expect(result[0].rationale).toContain('Default fallback');
    });

    it('should allocate correctly for Awareness', () => {
        const input = mockInput('Awareness', 1000);
        const result = calculateChannelAllocations(input);
        
        expect(result).toHaveLength(2);
        const search = result.find(r => r.channel === 'Google Search');
        const tiktok = result.find(r => r.channel === 'TikTok');

        expect(search?.budget).toBe(500);
        expect(tiktok?.budget).toBe(500);
    });

    it('should apply SaaS vertical override for Leads', () => {
        const input = mockInput('Leads', 1000, 'SaaS');
        const result = calculateChannelAllocations(input);

        // Expectation from code: Search 0.6, LinkedIn 0.4
        const search = result.find(r => r.channel === 'Google Search');
        // LinkedIn might be cast to any string in the implementation
        const linkedin = result.find(r => r.channel === 'LinkedIn');

        expect(search?.allocationPercentage).toBe(0.6);
        expect(linkedin?.allocationPercentage).toBe(0.4);
        expect(linkedin?.budget).toBe(400);
    });
});
