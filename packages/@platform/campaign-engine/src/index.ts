import { z } from 'zod';
import {
    CampaignInput,
    CampaignInputSchema,
    CampaignPlan,
    CampaignPlanSchema,
    CampaignNode,
    ChannelDistribution
} from './schema/campaign-plan';
import { calculateChannelAllocations } from './engine/channel-selector';
import { getBudgetTier } from './engine/budget-allocator';
import { VERTICAL_PROFILES } from './config/vertical-profiles';
import { generateAwarenessLayer, generateConsiderationLayer, generateConversionLayer } from './engine/funnel-generator';

/**
 * Generates a deterministic, full-funnel campaign strategy based on business constraints.
 * 
 * @param input - The basic business parameters (Vertical, Objective, Budget)
 * @returns A validated CampaignPlan object containing channel mix, budget allocation, and execution steps.
 * @throws {ZodError} If the input validation fails.
 * 
 * @example
 * const plan = generateCampaignPlan({
 *   vertical: 'SaaS',
 *   objective: 'Leads',
 *   budget: 5000
 * });
 */
export const generateCampaignPlan = (input: CampaignInput): CampaignPlan => {
    // 1. Validate Input
    const validatedInput = CampaignInputSchema.parse(input);
    const verticalProfile = VERTICAL_PROFILES[validatedInput.vertical];

    // 2. Select Channels
    // Returns list of channels with allocated budgets
    const channelAllocations = calculateChannelAllocations(validatedInput);

    // 3. Determine Budget Tier (Global Constraint)
    const budgetTier = getBudgetTier(validatedInput.budget);

    const warnings: string[] = [];
    if (budgetTier.tier === 'Small') {
        warnings.push(`Budget is Small (< $1000). Strategy consolidated to minimize overhead.`);
    }

    // 4. Generate Campaigns
    // Logic: Iterate channels, then split channel budget into funnel stages based on Vertical Profile
    const campaigns: CampaignNode[] = [];

    // We need to track total campaigns to respect limits, but for V1 we'll just distribute logic
    // A heuristic: if Small, only do Conversion layer. Medium/Large = Full Funnel.

    channelAllocations.forEach(alloc => {
        // Skip if allocation is 0
        if (alloc.allocationPercentage <= 0) return;

        // Determine funnel strategy for this channel based on Budget Tier
        let stagesToBuild = ['Conversion']; // Default for Small

        if (budgetTier.tier !== 'Small') {
            stagesToBuild = ['Awareness', 'Consideration', 'Conversion'];
        }

        // Adjust split based on Vertical Profile Recommendation
        const verticalSplit = verticalProfile.recommendedFunnelSplit;

        // Normalize split if we are dropping stages? For V1, let's keep it simple.
        // If we only build Conversion, we give it 100% of the channel budget.

        stagesToBuild.forEach(stage => {
            let stageBudgetRatio = 1.0;

            if (stagesToBuild.length > 1) {
                if (stage === 'Awareness') stageBudgetRatio = verticalSplit.awareness;
                if (stage === 'Consideration') stageBudgetRatio = verticalSplit.consideration;
                if (stage === 'Conversion') stageBudgetRatio = verticalSplit.conversion;

                // Renormalize if necessary (e.g. if we skipped some stages, but here we just skipped based on budget tier)
                // If we want exact precision, we'd code dynamic re-normalization. 
                // For now, let's stick to the profile split but be aware it might not sum to 1 if we dropped stages.
                // Actually, if we drop stages, we should concentrate budget.
            }

            const campaignBudget = Math.floor(alloc.budget * stageBudgetRatio);

            // Don't create tiny campaigns
            if (campaignBudget < 50) return;

            let funnelConfig;
            if (stage === 'Awareness') funnelConfig = generateAwarenessLayer(validatedInput.vertical);
            else if (stage === 'Consideration') funnelConfig = generateConsiderationLayer(validatedInput.vertical);
            else funnelConfig = generateConversionLayer(validatedInput.vertical); // Conversion

            campaigns.push({
                name: `${alloc.channel} - ${validatedInput.vertical} - ${stage}`,
                objective: stage, // Map funnel stage to campaign objective roughly
                budget: campaignBudget,
                description: `${funnelConfig.messageAngle} | Target: ${funnelConfig.audienceIntent}`,
                stage: stage as 'Awareness' | 'Consideration' | 'Conversion',
                targeting: {
                    geo: 'National', // Default
                    audiences: [`${validatedInput.vertical} Interest`], // Placeholder
                }
            });
        });
    });

    // 5. Build Summary
    const summary = {
        goal: `Maximize ${validatedInput.objective} for ${validatedInput.vertical}`,
        totalBudget: validatedInput.budget,
        vertical: validatedInput.vertical,
        funnelSplit: verticalProfile.recommendedFunnelSplit
    };

    // 5. Build Execution Steps (Dynamic based on selected channels)
    const execution_steps: string[] = [];
    const usedChannels = new Set(channelAllocations.map(c => c.channel));

    if (usedChannels.has('Google Search')) {
        execution_steps.push('Connect Google Ads Account');
        execution_steps.push('Setup Conversion Actions (Leads/Purchases)');
        execution_steps.push('Create Search Campaign Structure');
    }
    if (usedChannels.has('Meta (Facebook/Instagram)')) {
        execution_steps.push('Connect Facebook Business Manager');
        execution_steps.push('Install Meta Pixel on Website');
        execution_steps.push('Upload Creative Assets (Images/Videos)');
    }
    if (usedChannels.has('LinkedIn')) {
        execution_steps.push('Connect LinkedIn Campaign Manager');
        execution_steps.push('Install Insight Tag');
    }
    if (usedChannels.has('TikTok')) {
        execution_steps.push('Connect TikTok For Business');
        execution_steps.push('Install TikTok Pixel');
    }

    // 6. Build Optimization Schedule (Standardized)
    const optimization_schedule: string[] = [
        'Day 3: Check for zero-impression ads and broken links.',
        'Day 7: Bid adjustment review. Pause keywords/ads with high CPA.',
        'Day 14: Refresh creative for low-performing ad groups. Review Search Terms report.',
        'Day 30: Full Monthly Performance Review & Funnel Analysis.'
    ];

    const plan = {
        summary,
        channels: channelAllocations,
        campaigns,
        execution_steps,
        optimization_schedule,
        warnings
    };

    // 6. Validate Output (Runtime check)
    return CampaignPlanSchema.parse(plan);
};

// Export types and config
export * from './schema/campaign-plan';
export * from './config/vertical-profiles';
