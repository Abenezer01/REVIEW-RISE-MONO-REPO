import { BlueprintService } from '../blueprint.service';
import { BlueprintInput, BlueprintOutput, KeywordCluster } from '@platform/contracts';
import { llmService } from '../llm.service';

// Mock LLM Service to avoid API calls and ensure predictable results
jest.mock('../llm.service', () => ({
    llmService: {
        generateJSON: jest.fn(),
        generateText: jest.fn()
    }
}));

describe('Landing Page Validation Tests', () => {
    let blueprintService: BlueprintService;

    beforeEach(() => {
        jest.clearAllMocks();
        blueprintService = new BlueprintService();
    });

    const baseInput: BlueprintInput = {
        businessName: 'Test Business',
        offerOrService: 'Premium Services',
        vertical: 'Local Service',
        geoTargeting: ['Test City'],
        painPoints: ['Problem 1', 'Problem 2']
    };

    const mockCluster: KeywordCluster = {
        intent: 'Service',
        theme: 'Test Theme',
        keywords: [{ term: 'term', matchType: 'Exact' }]
    };

    // Helper to create valid structure with custom analysis
    const createMockResponse = (landingPageAnalysis: any): BlueprintOutput => ({
        clusters: [mockCluster],
        adGroups: [{
            name: 'Group 1',
            keywords: mockCluster,
            assets: { headlines: ['H1', 'H2', 'H3'], descriptions: ['D1', 'D2'] }
        }],
        negatives: [],
        landingPageAnalysis: {
            url: 'https://test.com',
            score: 85,
            mobileOptimized: true,
            trustSignalsDetected: ['HTTPS'],
            missingElements: [],
            isValid: true,
            ...landingPageAnalysis
        }
    });

    describe('Invalid Domain Detection', () => {
        it('should reject generic domains like google.com', async () => {
            (llmService.generateJSON as jest.Mock).mockResolvedValue(createMockResponse({
                isValid: false,
                validationMessage: 'Generic domain not allowed',
                score: 0
            }));

            const input: BlueprintInput = {
                ...baseInput,
                landingPageUrl: 'https://google.com'
            };

            const result = await blueprintService.generate(input);

            if (result.landingPageAnalysis) {
                expect(result.landingPageAnalysis.isValid).toBe(false);
                expect(result.landingPageAnalysis.validationMessage).toBeDefined();
                expect(result.landingPageAnalysis.score).toBe(0);
            }
        });

        it('should reject facebook.com as landing page', async () => {
            (llmService.generateJSON as jest.Mock).mockResolvedValue(createMockResponse({
                isValid: false,
                validationMessage: 'Social media profiles not relevant',
                score: 0
            }));

            const input: BlueprintInput = {
                ...baseInput,
                landingPageUrl: 'https://facebook.com/business-page'
            };

            const result = await blueprintService.generate(input);

            if (result.landingPageAnalysis) {
                expect(result.landingPageAnalysis.isValid).toBe(false);
                expect(result.landingPageAnalysis.validationMessage).toContain('not relevant');
            }
        });

        it('should reject example.com placeholder domains', async () => {
            (llmService.generateJSON as jest.Mock).mockResolvedValue(createMockResponse({
                isValid: false,
                validationMessage: 'Placeholder domain',
                score: 0
            }));

            const input: BlueprintInput = {
                ...baseInput,
                landingPageUrl: 'https://example.com'
            };

            const result = await blueprintService.generate(input);

            if (result.landingPageAnalysis) {
                expect(result.landingPageAnalysis.isValid).toBe(false);
            }
        });
    });

    describe('Valid Domain Handling', () => {
        it('should accept valid business-specific domains', async () => {
            (llmService.generateJSON as jest.Mock).mockResolvedValue(createMockResponse({
                url: 'https://premiumplumbing.com/emergency-services',
                isValid: true,
                score: 85
            }));

            const input: BlueprintInput = {
                ...baseInput,
                landingPageUrl: 'https://premiumplumbing.com/emergency-services'
            };

            const result = await blueprintService.generate(input);

            if (result.landingPageAnalysis) {
                expect(result.landingPageAnalysis.url).toBe(input.landingPageUrl);
                expect(result.landingPageAnalysis.isValid).toBe(true);
                expect(result.landingPageAnalysis.score).toBeGreaterThan(0);
            }
        });

        it('should provide analysis for valid URLs', async () => {
            (llmService.generateJSON as jest.Mock).mockResolvedValue(createMockResponse({
                isValid: true,
                score: 88,
                mobileOptimized: true,
                trustSignalsDetected: ['HTTPS', 'Phone Number'],
                missingElements: ['Testimonials']
            }));

            const input: BlueprintInput = {
                ...baseInput,
                landingPageUrl: 'https://mybusiness.com/services'
            };

            const result = await blueprintService.generate(input);

            if (result.landingPageAnalysis && result.landingPageAnalysis.isValid) {
                expect(result.landingPageAnalysis.score).toBeDefined();
                expect(result.landingPageAnalysis.score).toBeGreaterThanOrEqual(0);
                expect(typeof result.landingPageAnalysis.mobileOptimized).toBe('boolean');
                expect(Array.isArray(result.landingPageAnalysis.trustSignalsDetected)).toBe(true);
            }
        });
    });

    describe('Missing URL Handling', () => {
        it('should handle missing landing page URL gracefully', async () => {
            (llmService.generateJSON as jest.Mock).mockResolvedValue(createMockResponse({
                url: '',
                isValid: true,
                score: 50
            }));

            const input: BlueprintInput = {
                ...baseInput
                // No landingPageUrl provided
            };

            const result = await blueprintService.generate(input);

            expect(result.clusters).toBeDefined();
            // Should still produce a result
            if (result.landingPageAnalysis) {
                expect(result.landingPageAnalysis.url).toBeDefined();
            }
        });
    });

    describe('URL Format Validation', () => {
        it('should handle URLs without protocol', async () => {
            (llmService.generateJSON as jest.Mock).mockResolvedValue(createMockResponse({
                url: 'http://mybusiness.com/services', // LLM might normalize it
                isValid: true
            }));

            const input: BlueprintInput = {
                ...baseInput,
                landingPageUrl: 'mybusiness.com/services'
            };

            const result = await blueprintService.generate(input);
            expect(result).toBeDefined();
        });
    });
});
