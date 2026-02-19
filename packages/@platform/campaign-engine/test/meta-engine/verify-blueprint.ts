import { metaBlueprintEngine } from '../../src/meta-engine/meta-blueprint-engine';
import { CampaignInput } from '../../src/schema/campaign-plan';

const mockInput: CampaignInput = {
    vertical: 'Local Service',
    objective: 'Leads',
    budget: 3000,
    currency: 'USD',
    businessName: 'Austin Roof Experts',
    websiteUrl: 'https://austinroofexperts.com',
    services: ['Roof Repair', 'Roof Replacement'],
    offer: 'Free Roof Inspection',
    painPoints: ['Leaking Roof', 'Storm Damage'],
    geo: 'Austin, TX',
    expectedAvgCpc: 12.50,
    conversionTrackingEnabled: true
};

console.log('Generating Blueprint for:', mockInput.businessName);
const blueprint = metaBlueprintEngine.generateBlueprint(mockInput);
console.log(JSON.stringify(blueprint, null, 2));

if (blueprint.structure.prospecting.adSets.length > 0) {
    console.log('SUCCESS: Blueprint generated with Prospecting ad sets.');
    console.log('Tier:', blueprint.recommendations.budgetTier);
    console.log('Warnings:', blueprint.recommendations.warnings);
} else {
    console.error('FAILURE: Missing ad sets.');
    process.exit(1);
}
