
import { generateCampaignPlan } from '../src/index';

describe('Strategy Engine', () => {

    test('SaaS - High Budget - Leads', () => {
        const plan = generateCampaignPlan({
            vertical: 'SaaS',
            objective: 'Leads',
            budget: 10000,
            currency: 'USD'
        });

        expect(plan.summary.vertical).toBe('SaaS');
        expect(plan.summary.goal).toContain('Leads');

        // SaaS Leads usually mixes Search and LinkedIn/Meta
        // We expect at least higher funnel stages because budget is Large/Medium
        const hasAwareness = plan.campaigns.some(c => c.stage === 'Awareness');
        expect(hasAwareness).toBe(true);

        // Check if we have specific SaaS messaging
        const conversionCampaign = plan.campaigns.find(c => c.stage === 'Conversion');
        expect(conversionCampaign?.description).toContain('Start Free Trial');
    });

    test('Restaurant - Small Budget - Local Visits', () => {
        const plan = generateCampaignPlan({
            vertical: 'Restaurant',
            objective: 'Local Visits',
            budget: 600,
            currency: 'USD'
        });

        // Small budget trigger
        expect(plan.warnings.length).toBeGreaterThan(0);
        expect(plan.warnings[0]).toContain('Small Budget');

        // Should consolidate to Conversion or max 2 campaigns
        expect(plan.campaigns.length).toBeLessThanOrEqual(2);

        // Check Restaurant specific override
        const campaign = plan.campaigns.find(c => c.stage === 'Conversion' || c.stage === 'Awareness');
        // Depending on logic, might be Awareness or Conversion, but let's check content if it exists
        if (campaign) {
            const desc = campaign.description;
            // Expect 'Book Tonight' or 'Mouth-watering'
            const isRestaurantMsg = desc.includes('Book Tonight') || desc.includes('Mouth-watering');
            expect(isRestaurantMsg).toBe(true);
        }
    });

    test('Healthcare - Conversion Overrides', () => {
        const plan = generateCampaignPlan({
            vertical: 'Healthcare',
            objective: 'Leads',
            budget: 5000,
            currency: 'USD'
        });

        const conversionValues = plan.campaigns.filter(c => c.stage === 'Conversion');
        expect(conversionValues.length).toBeGreaterThan(0);
        expect(conversionValues[0].description).toContain('Book Appointment');
    });

});
