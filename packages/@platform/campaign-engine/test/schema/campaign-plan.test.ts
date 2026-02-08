
import { z } from 'zod';
import { CampaignPlanSchema, CampaignInputSchema } from '../../src/schema/campaign-plan';

describe('Campaign Plan Schema Validation', () => {
    
    it('should validate a correct campaign input', () => {
        const validInput = {
            businessName: 'TechCorp',
            website: 'techcorp.io',
            budget: 5000,
            objective: 'Leads',
            targetAudience: 'CTOs',
            locations: ['US', 'CA'],
            vertical: 'SaaS'
        };

        const result = CampaignInputSchema.safeParse(validInput);
        expect(result.success).toBe(true);
    });

    it('should fail input with invalid budget', () => {
        const invalidInput = {
            businessName: 'TechCorp',
            website: 'techcorp.io',
            budget: -100, // Invalid
            objective: 'Leads',
            targetAudience: 'CTOs',
            locations: ['US']
        };

        const result = CampaignInputSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBeDefined();
        }
    });

    it('should validate a full campaign plan structure', () => {
        const validPlan = {
            summary: {
                goal: 'Generate qualified leads',
                totalBudget: 5000,
                vertical: 'SaaS',
                funnelSplit: {
                    awareness: 0.2,
                    consideration: 0.3,
                    conversion: 0.5
                }
            },
            channels: [
                {
                    channel: 'Google Search',
                    allocationPercentage: 0.6,
                    budget: 3000,
                    rationale: 'High intent'
                },
                {
                    channel: 'LinkedIn',
                    allocationPercentage: 0.4,
                    budget: 2000,
                    rationale: 'B2B targeting'
                }
            ],
            campaigns: [
                {
                    name: 'Search - BOFU',
                    objective: 'Leads',
                    budget: 3000,
                    description: 'Capture high intent search traffic',
                    targeting: {
                        audiences: ['Looking for Software'],
                        keywords: ['buy software', 'software pricing'],
                        geo: 'US'
                    },
                    stage: 'Conversion'
                }
            ],
            execution_steps: ['Setup conversion tracking', 'Launch campaigns'],
            optimization_schedule: ['Weekly review', 'Monthly re-budgeting'],
            warnings: []
        };

        const result = CampaignPlanSchema.safeParse(validPlan);
        expect(result.success).toBe(true);
        if (!result.success) {
            console.log(JSON.stringify(result.error, null, 2));
        }
    });
});
