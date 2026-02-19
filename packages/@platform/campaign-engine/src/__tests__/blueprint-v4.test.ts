import { generateBlueprintV4 } from '../index';
import { CampaignInput } from '../schema/campaign-plan';

describe('Blueprint Engine V4 Integration', () => {

    const mockInput: CampaignInput = {
        vertical: 'Local Service',
        objective: 'Leads',
        budget: 3000,
        currency: 'USD',
        businessName: 'Austin Plumbing Pros',
        websiteUrl: 'https://austinplumbingpros.com',
        services: ['Plumbing', 'Water Heater Repair', 'Drain Cleaning'],
        offer: '10% Off First Service',
        painPoints: ['Leaky Faucet', 'Clogged Drain', 'No Hot Water'],
        geo: 'Austin, TX',
        conversionTrackingEnabled: true
    };

    it('should generate a valid campaign plan structure', async () => {
        const plan = await generateBlueprintV4(mockInput);

        expect(plan).toBeDefined();
        expect(plan.summary.vertical).toBe('Local Service');
        expect(plan.summary.clickCapacity).toBeGreaterThan(0);
        expect(plan.summary.budgetTier).toBeDefined();
    });

    it('should generate keyword clusters', async () => {
        const plan = await generateBlueprintV4(mockInput);

        expect(plan.keywordClusters).toBeDefined();
        expect(plan.keywordClusters?.length).toBeGreaterThan(0);

        const serviceCluster = plan.keywordClusters?.find(c => c.intentType === 'Service');
        expect(serviceCluster).toBeDefined();
        expect(serviceCluster?.keywords).toContain('plumbing');
        expect(serviceCluster?.keywords.some(k => k.includes('austin'))).toBe(true);
    });

    it('should generate negative keywords', async () => {
        const plan = await generateBlueprintV4(mockInput);
        expect(plan.negativeKeywords).toBeDefined();
        expect(plan.negativeKeywords).toContain('free'); // Global negative
        expect(plan.negativeKeywords).toContain('job'); // Vertical negative
    });

    it('should generate ad groups with RSAs', async () => {
        const plan = await generateBlueprintV4(mockInput);
        expect(plan.adGroups).toBeDefined();
        expect(plan.adGroups?.length).toBeGreaterThan(0);

        const firstAdGroup = plan.adGroups![0];
        expect(firstAdGroup.rsaAssets.headlines.length).toBeGreaterThan(2);
        expect(firstAdGroup.rsaAssets.descriptions.length).toBeGreaterThan(1);
        expect(firstAdGroup.extensions).toBeDefined();
    });

    it('should include performance estimates', async () => {
        const plan = await generateBlueprintV4(mockInput);
        expect(plan.performanceAssumptions).toBeDefined();
        expect(plan.performanceAssumptions?.ctr).toBeDefined();
        expect(plan.performanceAssumptions?.cpc).toBeDefined();
    });

    it('should include landing page analysis', async () => {
        const plan = await generateBlueprintV4(mockInput);
        expect(plan.landingPageAnalysis).toBeDefined();
        expect(plan.landingPageAnalysis?.score).toBeDefined();
    });
});
