import { BlueprintService } from '../blueprint.service';
import { BlueprintInput, BlueprintOutput, KeywordCluster } from '@platform/contracts';
import { RSA_CONSTRAINTS } from '@platform/contracts';
import { llmService } from '../llm.service';

jest.mock('../llm.service', () => ({
    llmService: {
        generateJSON: jest.fn(),
        generateText: jest.fn()
    }
}));

describe('Blueprint RSA Quality Tests', () => {
    let blueprintService: BlueprintService;

    beforeEach(() => {
        jest.clearAllMocks();
        blueprintService = new BlueprintService();
    });

    const mockInput: BlueprintInput = {
        businessName: 'Premium Plumbing Co',
        offerOrService: 'Emergency Plumbing Services',
        vertical: 'Local Service',
        geoTargeting: ['Los Angeles, CA'],
        painPoints: ['Burst pipes'],
        landingPageUrl: 'https://premiumplumbing.com/emergency'
    };

    const mockCluster: KeywordCluster = {
        intent: 'Service',
        theme: 'Test Theme',
        keywords: [{ term: 'term', matchType: 'Exact' }]
    };

    const createMockResponse = (adGroupAssets: any[]): BlueprintOutput => ({
        clusters: [mockCluster],
        adGroups: adGroupAssets.map((assets, i) => ({
            name: `Group ${i}`,
            keywords: mockCluster,
            assets
        })),
        negatives: [],
        landingPageAnalysis: {
            url: 'https://test.com',
            isValid: true,
            score: 80,
            mobileOptimized: true,
            trustSignalsDetected: [],
            missingElements: []
        }
    });

    describe('RSA Headline Constraints', () => {
        it('should ensure all headlines are <= 30 characters (truncation test)', async () => {
            const longHeadline = 'This headline is way too long and should be truncated by the service';
            const shortHeadline = 'Valid Headline';

            (llmService.generateJSON as jest.Mock).mockResolvedValue(createMockResponse([{
                headlines: [longHeadline, shortHeadline, 'Another Valid One'],
                descriptions: ['Valid Desc 1', 'Valid Desc 2']
            }]));

            const result = await blueprintService.generate(mockInput);

            result.adGroups.forEach((adGroup) => {
                adGroup.assets.headlines.forEach((headline) => {
                    expect(headline.length).toBeLessThanOrEqual(RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH);
                    if (headline.includes('...')) {
                        expect(headline.length).toBeLessThanOrEqual(30);
                    }
                });
            });
        });

        it('should have between 3-15 headlines per ad group', async () => {
            (llmService.generateJSON as jest.Mock).mockResolvedValue(createMockResponse([{
                headlines: ['H1', 'H2', 'H3', 'H4', 'H5'],
                descriptions: ['D1', 'D2']
            }]));

            const result = await blueprintService.generate(mockInput);

            result.adGroups.forEach((adGroup) => {
                const headlineCount = adGroup.assets.headlines.length;
                expect(headlineCount).toBeGreaterThanOrEqual(RSA_CONSTRAINTS.HEADLINE_MIN_COUNT);
                expect(headlineCount).toBeLessThanOrEqual(RSA_CONSTRAINTS.HEADLINE_MAX_COUNT);
            });
        });
    });

    describe('RSA Description Constraints', () => {
        it('should ensure all descriptions are <= 90 characters', async () => {
            const longDesc = 'This description is excessively long and definitely exceeds the ninety character limit imposed by Google Ads for RSA descriptions which is quite strict.';

            (llmService.generateJSON as jest.Mock).mockResolvedValue(createMockResponse([{
                headlines: ['H1', 'H2', 'H3'],
                descriptions: [longDesc, 'Valid short description']
            }]));

            const result = await blueprintService.generate(mockInput);

            result.adGroups.forEach((adGroup) => {
                adGroup.assets.descriptions.forEach((description) => {
                    expect(description.length).toBeLessThanOrEqual(RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH);
                });
            });
        });

        it('should have between 2-4 descriptions per ad group', async () => {
            (llmService.generateJSON as jest.Mock).mockResolvedValue(createMockResponse([{
                headlines: ['H1', 'H2', 'H3'],
                descriptions: ['D1', 'D2', 'D3']
            }]));

            const result = await blueprintService.generate(mockInput);

            result.adGroups.forEach((adGroup) => {
                const descCount = adGroup.assets.descriptions.length;
                expect(descCount).toBeGreaterThanOrEqual(RSA_CONSTRAINTS.DESCRIPTION_MIN_COUNT);
                expect(descCount).toBeLessThanOrEqual(RSA_CONSTRAINTS.DESCRIPTION_MAX_COUNT);
            });
        });
    });
});
