import { metaBlueprintEngine } from '../../src/meta-engine/meta-blueprint-engine';
import { CampaignInput } from '../../src/schema/campaign-plan';

async function verifySeniorBlueprint() {
    console.log('🧪 Starting Senior Blueprint Verification...\n');

    const input: CampaignInput = {
        businessName: 'Austin Emergency Plumbers',
        websiteUrl: 'https://austin-plumbers.com',
        vertical: 'Local Service',
        objective: 'Leads',
        budget: 3000, // $3k/mo = ~$100/day (Healthy)
        geo: 'Austin, TX',
        offer: '$50 Off First Service'
    };

    console.log(`Input: ${input.businessName} | Budget: $${input.budget}/mo`);

    const blueprint = metaBlueprintEngine.generateBlueprint(input);

    // 1. Verify Structure Split
    console.log('\n--- 1. Structure Verification ---');
    console.log('Prospecting Campaign:', blueprint.structure.prospecting.name);
    console.log('Retargeting Campaign:', blueprint.structure.retargeting.name);

    if (blueprint.structure.prospecting.adSets.length > 0 && blueprint.structure.retargeting.adSets.length > 0) {
        console.log('✅ STRICT SPLIT: Success');
    } else {
        console.error('❌ STRICT SPLIT: Failed');
    }

    // 2. Verify Audience Overlap & Types
    console.log('\n--- 2. Audience Intelligence ---');
    blueprint.structure.prospecting.adSets.forEach(adSet => {
        console.log(`[${adSet.audience.type}] ${adSet.audience.name} | Exclusions: ${adSet.audience.exclusions?.length || 0}`);
    });

    // Check for Broad
    const hasBroad = blueprint.structure.prospecting.adSets.some(a => a.audience.type === 'Broad');
    if (hasBroad) console.log('✅ BROAD DISCOVERY: Detected');

    // 3. Verify Budget Strategy
    console.log('\n--- 3. Budget Strategy ---');
    console.log('Strategy:', blueprint.recommendations.budgetStrategy);
    console.log('Prospecting Budget: $' + blueprint.structure.prospecting.totalBudget.toFixed(2));
    console.log('Retargeting Budget: $' + blueprint.structure.retargeting.totalBudget.toFixed(2));

    const totalCalculated = blueprint.structure.prospecting.totalBudget + blueprint.structure.retargeting.totalBudget;
    if (Math.abs(totalCalculated - input.budget) < 1) {
        console.log('✅ BUDGET INTEGRITY: Verified');
    }

    // 4. Verify Creative Limits
    console.log('\n--- 4. Creative Guards ---');
    const sampleAd = blueprint.structure.prospecting.adSets[0].creatives[0];
    console.log('Headline:', sampleAd.headlines[0]);
    console.log('Length:', sampleAd.headlines[0].length);

    if (sampleAd.headlines[0].length <= 40) console.log('✅ HEADLINE LIMIT: Pass');
    else console.error('❌ HEADLINE LIMIT: Fail');

    console.log('\n--- 5. Low Budget Warning Test ---');
    const lowBudgetInput = { ...input, budget: 100 }; // $3/day
    const lowBudgetPlan = metaBlueprintEngine.generateBlueprint(lowBudgetInput);
    console.log('Warnings:', lowBudgetPlan.recommendations.warnings);

    if (lowBudgetPlan.recommendations.warnings && lowBudgetPlan.recommendations.warnings.length > 0) {
        console.log('✅ MIN BUDGET GUARD: Functional');
    } else {
        console.error('❌ MIN BUDGET GUARD: Failed');
    }
}

verifySeniorBlueprint();
