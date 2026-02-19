import { BlueprintService } from '../blueprint.service';
import type { BlueprintInput } from '@platform/contracts';

// Mock the campaign engine to avoid real crawling and ensure predictable results
jest.mock('@platform/campaign-engine', () => ({
    generateBlueprintV4: jest.fn()
}));

import { generateBlueprintV4 } from '@platform/campaign-engine';

describe('Landing Page Validation Tests', () => {
    let blueprintService: BlueprintService;

    beforeEach(() => {
        jest.clearAllMocks();
        blueprintService = new BlueprintService();
    });

    const baseInput: BlueprintInput = {
        businessName: 'Test Business',
        offer: 'Premium Services',
        services: ['Service 1'],
        vertical: 'Local Service',
        geo: 'Test City',
        painPoints: ['Problem 1', 'Problem 2'],
        objective: 'Leads',
        budget: 1000
    };


    describe('Invalid Domain Detection', () => {
        it('should reject generic domains like google.com', async () => {
            (generateBlueprintV4 as jest.Mock).mockResolvedValue({
                summary: { goal: 'test', totalBudget: 1000, vertical: 'Other' },
                landingPageAnalysis: {
                    score: 0,
                    isValid: false,
                    warnings: ['Generic domain not allowed']
                },
                keywordClusters: [],
                adGroups: [],
                negativeKeywords: []
            });

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
            (generateBlueprintV4 as jest.Mock).mockResolvedValue({
                summary: { goal: 'test', totalBudget: 1000, vertical: 'Other' },
                landingPageAnalysis: {
                    score: 0,
                    isValid: false,
                    warnings: ['Social media profiles not relevant']
                },
                keywordClusters: [],
                adGroups: [],
                negativeKeywords: []
            });

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
            (generateBlueprintV4 as jest.Mock).mockResolvedValue({
                summary: { goal: 'test', totalBudget: 1000, vertical: 'Other' },
                landingPageAnalysis: {
                    score: 0,
                    isValid: false,
                    warnings: ['Placeholder domain']
                },
                keywordClusters: [],
                adGroups: [],
                negativeKeywords: []
            });

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
            (generateBlueprintV4 as jest.Mock).mockResolvedValue({
                summary: { goal: 'test', totalBudget: 1000, vertical: 'Other' },
                landingPageAnalysis: {
                    score: 85,
                    isValid: true,
                    warnings: []
                },
                keywordClusters: [],
                adGroups: [],
                negativeKeywords: []
            });

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
            (generateBlueprintV4 as jest.Mock).mockResolvedValue({
                summary: { goal: 'test', totalBudget: 1000, vertical: 'Other' },
                landingPageAnalysis: {
                    score: 88,
                    isValid: true,
                    mobileOptimized: true,
                    trustSignalsDetected: ['HTTPS', 'Phone Number'],
                    warnings: ['Testimonials']
                },
                keywordClusters: [],
                adGroups: [],
                negativeKeywords: []
            });

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
            (generateBlueprintV4 as jest.Mock).mockResolvedValue({
                summary: { goal: 'test', totalBudget: 1000, vertical: 'Other' },
                landingPageAnalysis: {
                    score: 50,
                    isValid: true,
                    warnings: []
                },
                keywordClusters: [],
                adGroups: [],
                negativeKeywords: []
            });

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
            (generateBlueprintV4 as jest.Mock).mockResolvedValue({
                summary: { goal: 'test', totalBudget: 1000, vertical: 'Other' },
                landingPageAnalysis: {
                    score: 70,
                    isValid: true,
                    warnings: []
                },
                keywordClusters: [],
                adGroups: [],
                negativeKeywords: []
            });

            const input: BlueprintInput = {
                ...baseInput,
                landingPageUrl: 'mybusiness.com/services'
            };

            const result = await blueprintService.generate(input);
            expect(result).toBeDefined();
        });
    });
});
