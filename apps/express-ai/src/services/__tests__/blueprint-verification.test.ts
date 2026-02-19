import { blueprintService } from '../blueprint.service';

import { BlueprintInput, BlueprintOutput } from '@platform/contracts';
// We use the REAL engine now, as it is deterministic for clustering/strategy.
// LLM service mock is kept if needed by other imports, but generateBlueprintV4 shouldn't use it.

jest.mock('../llm.service', () => ({
    llmService: {
        generateJSON: jest.fn(),
        generateText: jest.fn()
    }
}));


describe('Blueprint Strategy Verification', () => {
    // 1. Setup Input based on User Story
    const userInput: BlueprintInput = {
        businessName: 'Apex Plumbing',
        offer: 'Emergency Leak Repair',
        services: ['Pipe Repair', 'Leak Detection', 'Drain Cleaning'],
        vertical: 'Local Service',
        geo: 'Austin, TX',
        budget: 2000,
        objective: 'Leads',
        painPoints: ['Burst pipe flooding house', 'High water bill'],
        landingPageUrl: 'https://apexplumbing.com/emergency',
        expectedAvgCpc: 5,
        conversionTrackingEnabled: true
    };

    // 2. Real Engine Execution


    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should generate a Strategy-Driven Blueprint with all required fields', async () => {
        const result: BlueprintOutput = await blueprintService.generate(userInput);

        // --- 1. Strategy Layer Validation ---
        expect(result.strategySummary).toBeDefined();
        expect(result.strategySummary?.goal).toContain('Drive Leads');
        expect(result.strategySummary?.totalBudget).toBe(2000);
        expect(result.strategySummary?.bidStrategy).toBe('Maximize Conversions'); // Leads + Tracking = Max Conv

        expect(result.budgetModeling).toBeDefined();
        // CPC Priority: Vertical Profile (12.50) > User Input (5)
        // 2000 / 12.50 = 160 clicks -> Medium tier
        expect(result.budgetModeling?.budgetTier).toBe('Medium');
        expect(result.budgetModeling?.clickCapacity).toBeCloseTo(160, -1);
        expect(result.budgetModeling?.recommendedCampaignCount).toBe(2);

        // --- 2. Campaign Structure Validation ---
        expect(result.campaigns).toBeDefined();
        // Medium tier logic (Standard): Brand + General Service
        // StrategyCompiler logic: 
        // - Brand campaign
        // - General Service campaign (Non-Brand)
        expect(result.campaigns?.length).toBeGreaterThanOrEqual(2);

        const brandCampaign = result.campaigns?.find(c => c.name.includes('Brand'));
        const serviceCampaign = result.campaigns?.find(c => c.name.includes('Service') || c.name.includes('Emergency'));

        expect(brandCampaign).toBeDefined();
        expect(brandCampaign?.objective).toBe('Brand Awareness');
        expect(brandCampaign?.adGroups.length).toBeGreaterThan(0);

        expect(serviceCampaign).toBeDefined();
        expect(serviceCampaign?.objective).toBe('Leads');

        // --- 3. Keyword Clustering Validation (Structural, Not Count-Based) ---
        // Test structure, not exact count (resilient to feature additions)
        expect(result.clusters.length).toBeGreaterThan(0);
        expect(result.clusters.some(c => c.intent === 'Brand')).toBe(true);
        expect(result.clusters.some(c => c.intent === 'Service')).toBe(true);
        expect(result.clusters.some(c => c.intent === 'Problem')).toBe(true);

        // --- 4. Funnel Stage Classification ---
        expect(result.clusters.some(c => c.funnelStage === 'BOF')).toBe(true);
        expect(result.clusters.some(c => c.funnelStage === 'MOF')).toBe(true);
        expect(result.clusters.some(c => c.funnelStage === 'TOF')).toBe(true);

        // --- 5. Ad Group Builder & RSA Validation ---
        expect(result.adGroups.length).toBeGreaterThan(0);

        // RSA Character Limits (Google Ads Policy)
        result.adGroups.forEach(ag => {
            expect(ag.assets.headlines.length).toBeLessThanOrEqual(15);
            expect(ag.assets.headlines.length).toBeGreaterThanOrEqual(3); // Minimum for RSA
            expect(ag.assets.descriptions.length).toBeLessThanOrEqual(4);
            expect(ag.assets.descriptions.length).toBeGreaterThanOrEqual(2); // Minimum for RSA

            // Character limits
            ag.assets.headlines.forEach(h => {
                expect(h.length).toBeLessThanOrEqual(30); // Google Ads headline limit
            });
            ag.assets.descriptions.forEach(d => {
                expect(d.length).toBeLessThanOrEqual(90); // Google Ads description limit
            });
        });

        // --- 6. Geo Injection Validation ---
        const hasGeoHeadline = result.adGroups.some(ag =>
            ag.assets.headlines.some(h => h.includes('Austin'))
        );
        expect(hasGeoHeadline).toBe(true);

        // --- 7. Validation Warnings (Production Safety) ---
        // System should not generate invalid output
        if (result.validationWarnings) {
            expect(result.validationWarnings.length).toBe(0);
        }

        // --- 8. Performance Estimator Validation ---
        expect(result.performanceAssumptions).toBeDefined();
        expect(result.performanceAssumptions?.expectedCTR).toBe('4-6%');

        // Output JSON for visual confirmation (optional)
        console.log('Verified Output:', JSON.stringify(result, null, 2));
    });

    // ========================================
    // NEGATIVE PATH TESTS (Edge Cases)
    // ========================================
    describe('Negative Path & Edge Cases', () => {
        it('should use Manual CPC when conversion tracking disabled', async () => {
            const noTrackingInput: BlueprintInput = {
                ...userInput,
                conversionTrackingEnabled: false
            };

            const result = await blueprintService.generate(noTrackingInput);

            // Without tracking, should NOT use conversion-based bidding
            expect(result.strategySummary?.bidStrategy).not.toBe('Maximize Conversions');
            expect(['Manual CPC', 'Maximize Clicks']).toContain(result.strategySummary?.bidStrategy);
        });

        it('should handle low budget (< $300) correctly', async () => {
            const lowBudgetInput: BlueprintInput = {
                ...userInput,
                budget: 250
            };

            const result = await blueprintService.generate(lowBudgetInput);

            expect(result.budgetModeling?.budgetTier).toBe('Low');
            expect(result.budgetModeling?.recommendedCampaignCount).toBe(1); // Single campaign for low budget
        });

        it('should generate fallback clusters when services empty', async () => {
            const noServicesInput: BlueprintInput = {
                ...userInput,
                services: []
            };

            const result = await blueprintService.generate(noServicesInput);

            // Should still generate some clusters (brand, problem-based)
            expect(result.clusters.length).toBeGreaterThan(0);
            expect(result.clusters.some(c => c.intent === 'Brand')).toBe(true);
        });
    });

    // ========================================
    // STRESS TEST (Scalability)
    // ========================================
    describe('Stress Test - High Volume', () => {
        it('should handle 15 services with $15k budget without breaking', async () => {
            const stressInput: BlueprintInput = {
                businessName: 'MegaCorp Services',
                services: [
                    'Service 1', 'Service 2', 'Service 3', 'Service 4', 'Service 5',
                    'Service 6', 'Service 7', 'Service 8', 'Service 9', 'Service 10',
                    'Service 11', 'Service 12', 'Service 13', 'Service 14', 'Service 15'
                ],
                offer: 'Enterprise Solutions Package',
                vertical: 'SaaS',
                geo: 'New York, NY',
                budget: 15000,
                objective: 'Leads',
                conversionTrackingEnabled: true
            };

            const result = await blueprintService.generate(stressInput);

            // Budget tier should be High
            expect(result.budgetModeling?.budgetTier).toBe('High');

            // Campaign count should scale (3-5 for high tier)
            expect(result.budgetModeling?.recommendedCampaignCount).toBeGreaterThanOrEqual(3);
            expect(result.budgetModeling?.recommendedCampaignCount).toBeLessThanOrEqual(5);

            // RSA limits must still be enforced despite cluster explosion
            result.adGroups.forEach(ag => {
                expect(ag.assets.headlines.length).toBeLessThanOrEqual(15);
                expect(ag.assets.descriptions.length).toBeLessThanOrEqual(4);
            });

            // Cluster count should be reasonable (not exponential)
            expect(result.clusters.length).toBeLessThan(50); // Sanity check
        });
    });

    // ========================================
    // BID STRATEGY MATRIX (Lock Logic)
    // ========================================
    describe('Bid Strategy Compiler - Decision Matrix', () => {
        it('Leads + Tracking = Maximize Conversions', async () => {
            const input: BlueprintInput = {
                ...userInput,
                objective: 'Leads',
                conversionTrackingEnabled: true
            };
            const result = await blueprintService.generate(input);
            expect(result.strategySummary?.bidStrategy).toBe('Maximize Conversions');
        });

        it('Leads + No Tracking = Maximize Clicks', async () => {
            const input: BlueprintInput = {
                ...userInput,
                objective: 'Leads',
                conversionTrackingEnabled: false
            };
            const result = await blueprintService.generate(input);
            expect(result.strategySummary?.bidStrategy).toBe('Maximize Clicks');
        });

        it('Sales + Tracking = Target CPA', async () => {
            const input: BlueprintInput = {
                ...userInput,
                objective: 'Sales',
                conversionTrackingEnabled: true
            };
            const result = await blueprintService.generate(input);
            expect(result.strategySummary?.bidStrategy).toBe('Target CPA');
        });

        it('Awareness = Maximize Clicks (always)', async () => {
            const input: BlueprintInput = {
                ...userInput,
                objective: 'Awareness',
                conversionTrackingEnabled: true // Doesn't matter
            };
            const result = await blueprintService.generate(input);
            expect(result.strategySummary?.bidStrategy).toBe('Maximize Clicks');
        });
    });
});
