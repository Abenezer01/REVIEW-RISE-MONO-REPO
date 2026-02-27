/// <reference types="jest" />

import { generateCampaignPlan } from '../src/index';

describe('Strategy Engine', () => {
    test('SaaS - High Budget - Leads', async () => {
        const plan = await generateCampaignPlan({
            vertical: 'SaaS',
            objective: 'Leads',
            budget: 10000,
            currency: 'USD',
            businessName: 'CloudTech',
            services: ['Cloud Platform', 'API Services'],
            offer: 'Start Free Trial',
            geo: 'United States',
            conversionTrackingEnabled: true
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

    test('Restaurant - Small Budget - Local Visits', async () => {
        const plan = await generateCampaignPlan({
            vertical: 'Restaurant',
            objective: 'Local Visits',
            budget: 600,
            currency: 'USD',
            businessName: 'Bella Restaurant',
            services: ['Fine Dining', 'Catering'],
            offer: 'Book Tonight - 10% Off',
            geo: 'New York, NY',
            conversionTrackingEnabled: true
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

    test('Healthcare - Conversion Overrides', async () => {
        const plan = await generateCampaignPlan({
            vertical: 'Healthcare',
            objective: 'Leads',
            budget: 5000,
            currency: 'USD',
            businessName: 'HealthFirst Clinic',
            services: ['General Practice', 'Urgent Care'],
            offer: 'Book Appointment Online',
            geo: 'Los Angeles, CA',
            conversionTrackingEnabled: true
        });

        const conversionValues = plan.campaigns.filter(c => c.stage === 'Conversion');
        expect(conversionValues.length).toBeGreaterThan(0);
        expect(conversionValues[0].description).toContain('Book Appointment');
    });

});