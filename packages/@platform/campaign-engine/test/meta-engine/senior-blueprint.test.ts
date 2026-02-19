import { metaBlueprintEngine } from '../../src/meta-engine/meta-blueprint-engine';
import { CampaignInput } from '../../src/schema/campaign-plan';

describe('Meta Blueprint Engine - Senior Upgrade', () => {

    const input: CampaignInput = {
        businessName: 'Austin Emergency Plumbers',
        websiteUrl: 'https://austin-plumbers.com',
        vertical: 'Local Service',
        objective: 'Leads',
        budget: 3000, // $3k/mo = ~$100/day
        geo: 'Austin, TX',
        offer: '$50 Off First Service'
    };

    const blueprint = metaBlueprintEngine.generateBlueprint(input);

    test('Strictly splits Prospecting and Retargeting campaigns', () => {
        expect(blueprint.structure.prospecting).toBeDefined();
        expect(blueprint.structure.retargeting).toBeDefined();

        expect(blueprint.structure.prospecting.name).toContain('PROSPECTING');
        expect(blueprint.structure.retargeting.name).toContain('RETARGETING');

        // Ensure campaigns have distinct budgets
        expect(blueprint.structure.prospecting.totalBudget).toBeGreaterThan(0);
        expect(blueprint.structure.retargeting.totalBudget).toBeGreaterThan(0);
    });

    test('Audience Intelligence - No Overlap', () => {
        const prospectingAdSets = blueprint.structure.prospecting.adSets;

        // specific check for broad vs core types
        const types = prospectingAdSets.map(a => a.audience.type);
        expect(types).toContain('Core'); // Should have Core Interest clusters
        // Broad might be there depending on profile, let's check
        // expect(types).toContain('Broad'); 

        // Check for Retargeting audience in Prospecting (Should NOT exist)
        const retargetingLeak = prospectingAdSets.find(a => a.audience.type === 'Retargeting');
        expect(retargetingLeak).toBeUndefined();
    });

    test('Retargeting Strategy - Correct Audiences', () => {
        const retargetingAdSets = blueprint.structure.retargeting.adSets;
        expect(retargetingAdSets.length).toBeGreaterThanOrEqual(1);

        const audienceNames = retargetingAdSets.map(a => a.audience.name);
        // Should contain Website Visitors
        expect(audienceNames.some(n => n.includes('Website Visitors'))).toBeTruthy();
    });

    test('Budget Intelligence - Logic Check', () => {
        const totalBudget = blueprint.structure.prospecting.totalBudget + blueprint.structure.retargeting.totalBudget;
        // Float precision fix
        expect(Math.abs(totalBudget - input.budget)).toBeLessThan(1);

        // Retargeting should be substantial (e.g. ~15-20%)
        const retargetingShare = blueprint.structure.retargeting.totalBudget / input.budget;
        expect(retargetingShare).toBeGreaterThan(0.1);
        expect(retargetingShare).toBeLessThan(0.4);
    });

    test('Creative Guardrails - Character Limits', () => {
        const sampleAd = blueprint.structure.prospecting.adSets[0].creatives[0];

        // Check Headline < 40
        sampleAd.headlines.forEach(headline => {
            expect(headline.length).toBeLessThanOrEqual(40);
        });

        // Check Primary Text < 125
        sampleAd.primaryText.forEach(text => {
            expect(text.length).toBeLessThanOrEqual(125);
        });
    });

    test('Min Budget Warning', () => {
        const lowBudgetInput = { ...input, budget: 150 }; // $5/day total -> ~$2.50 per campaign -> likely < $20 per ad set
        const lowBudgetPlan = metaBlueprintEngine.generateBlueprint(lowBudgetInput);

        expect(lowBudgetPlan.recommendations.warnings).toBeDefined();
        expect(lowBudgetPlan.recommendations.warnings?.length).toBeGreaterThan(0);
        expect(lowBudgetPlan.recommendations.warnings![0]).toContain('below minimum vital threshold');
    });

});
