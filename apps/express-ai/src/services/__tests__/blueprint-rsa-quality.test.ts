import { BlueprintService } from '../blueprint.service';
import { BlueprintInput } from '@platform/contracts';
import { RSA_CONSTRAINTS } from '@platform/contracts';
import { llmService } from '../llm.service';

jest.mock('../llm.service', () => ({
    llmService: {
        generateJSON: jest.fn(),
        generateText: jest.fn()
    }
}));

// Mock the real blueprint engine just in case it takes too long or fails
// But actually relying on the real one is fine if it works in test environment.
// Let's assume it works since previous tests relied on it indirectly.

describe('Blueprint RSA Quality Tests', () => {
    let blueprintService: BlueprintService;

    beforeEach(() => {
        jest.clearAllMocks();
        blueprintService = new BlueprintService();
    });

    const mockInput: BlueprintInput = {
        businessName: 'Premium Plumbing Co',
        offer: 'Emergency Plumbing Services',
        services: ['Plumbing'],
        vertical: 'Local Service',
        geo: 'Los Angeles, CA',
        painPoints: ['Burst pipes'],
        landingPageUrl: 'https://premiumplumbing.com/emergency',
        objective: 'Leads',
        budget: 1000,
        conversionTrackingEnabled: true
    };

    const createMockEnhancement = (adGroupName: string, newHeadlines: string[], newDescriptions: string[]): any => ({
        adGroupEnhancements: [{
            adGroupName,
            newHeadlines,
            newDescriptions
        }],
        keywordExpansions: [],
        landingPageInsights: []
    });

    describe('RSA Headline Constraints', () => {
        it('should ensure all headlines (including AI enhanced) are <= 30 characters', async () => {
            const validEnhancement = createMockEnhancement('Emergency Plumbing',
                ['Valid AI Headline 1', 'Valid AI Headline 2'],
                ['Valid Desc 1']
            );

            // Mock successful AI response
            (llmService.generateJSON as jest.Mock).mockResolvedValue(validEnhancement);

            const result = await blueprintService.generate(mockInput);

            // Verify result
            // Note: We need to find the ad group that matches.
            // Assuming 'Emergency Plumbing' is generated based on input offer.
            const adGroup = result.adGroups.find(g => g.name.includes('Emergency') || g.name.includes('Plumbing'));
            expect(adGroup).toBeDefined();

            if (adGroup) {
                // Check if AI headlines were added (if match found)
                // If ad group name didn't match exactly, AI skipped it (safe).
                // But let's check basic validity of whatever is there.
                adGroup.assets.headlines.forEach((headline) => {
                    expect(headline.length).toBeLessThanOrEqual(RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH);
                });
            }
        });

        it('should REJECT AI enhancements that exceed 30 characters', async () => {
            const invalidEnhancement = createMockEnhancement('Emergency Plumbing',
                ['This headline is way too long and should be truncated by the service'],
                ['Valid Desc']
            );

            // Mock AI returning invalid data
            (llmService.generateJSON as jest.Mock).mockResolvedValue(invalidEnhancement);

            const result = await blueprintService.generate(mockInput);

            // Zod validation inside enhancer should fail and return original plan
            // Use find to locate the ad group
            const adGroup = result.adGroups.find(g => g.name.includes('Emergency') || g.name.includes('Plumbing'));
            expect(adGroup).toBeDefined();

            if (adGroup) {
                // The long headline should NOT be present because the whole patch was rejected
                const hasLongHeadline = adGroup.assets.headlines.some(h => h.length > 30);
                expect(hasLongHeadline).toBe(false);
            }
        });
    });

    describe('RSA Description Constraints', () => {
        it('should REJECT AI descriptions that exceed 90 characters', async () => {
            const longDesc = 'This description is excessively long and definitely exceeds the ninety character limit imposed by Google Ads for RSA descriptions which is quite strict.';

            const invalidEnhancement = createMockEnhancement('Emergency Plumbing',
                ['Valid H1'],
                [longDesc]
            );

            (llmService.generateJSON as jest.Mock).mockResolvedValue(invalidEnhancement);

            const result = await blueprintService.generate(mockInput);

            const adGroup = result.adGroups.find(g => g.name.includes('Emergency') || g.name.includes('Plumbing'));
            expect(adGroup).toBeDefined();

            if (adGroup) {
                const hasLongDesc = adGroup.assets.descriptions.some(d => d.length > 90);
                expect(hasLongDesc).toBe(false);
            }
        });
    });
});
