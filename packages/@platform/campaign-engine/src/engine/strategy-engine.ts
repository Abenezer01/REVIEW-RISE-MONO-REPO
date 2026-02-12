import { CampaignInput, CampaignPlan, CampaignNode } from '../schema/campaign-plan';
import { VERTICAL_PROFILES } from '../config/vertical-profiles';
import { getBudgetTier } from './budget-allocator';
import { calculateChannelAllocations, ChannelRule } from './channel-selector';
import { generateAwarenessLayer, generateConsiderationLayer, generateConversionLayer } from './funnel-generator';
import { CampaignPlanSchema } from '../schema/campaign-plan';

export class StrategyEngine {

    /**
     * Generates a comprehensive marketing strategy based on inputs.
     */
    public generatePlan(input: CampaignInput): CampaignPlan {
        // 1. Context & Profile Lookup
        const verticalProfile = VERTICAL_PROFILES[input.vertical];
        if (!verticalProfile) {
            throw new Error(`Vertical profile not found for: ${input.vertical}`);
        }

        // 2. Financial Constraints & Tiers
        const budgetTier = getBudgetTier(input.budget);

        // 3. Channel Strategy
        const channelAllocations = calculateChannelAllocations(input);

        // 4. Funnel Construction (Campaigns)
        const campaigns: CampaignNode[] = [];
        const warnings: string[] = [];

        // Analysis: Check for budget/ambition mismatch
        if (budgetTier.tier === 'Small' && input.objective !== 'Local Visits') {
            // warnings.push(`Budget is tight for ${input.objective}. Focusing on bottom-of-funnel conversion.`);
        }
        if (budgetTier.tier === 'Small') {
            warnings.push(`Small Budget detected ($${input.budget}). Strategy consolidated to maximize impact.`);
        }

        channelAllocations.forEach(alloc => {
            if (alloc.allocationPercentage <= 0) return;

            // Determine which funnel stages to build based on Budget Tier
            let stagesToBuild: ('Awareness' | 'Consideration' | 'Conversion')[] = ['Conversion'];

            if (budgetTier.tier === 'Medium') {
                stagesToBuild = ['Consideration', 'Conversion']; // Mid-funnel + Bottom
                // If Awareness is cheap (e.g. Meta), maybe add it? For now, stick to rules.
                if (alloc.channel.includes('Meta') || alloc.channel.includes('TikTok')) {
                    stagesToBuild = ['Awareness', 'Consideration', 'Conversion'];
                }
            } else if (budgetTier.tier === 'Large') {
                stagesToBuild = ['Awareness', 'Consideration', 'Conversion'];
            }

            // Calculate precise budget per stage
            stagesToBuild.forEach(stage => {
                let stageRatio = 0;
                // Use profile recommendations as baseline
                if (stage === 'Awareness') stageRatio = verticalProfile.recommendedFunnelSplit.awareness;
                if (stage === 'Consideration') stageRatio = verticalProfile.recommendedFunnelSplit.consideration;
                if (stage === 'Conversion') stageRatio = verticalProfile.recommendedFunnelSplit.conversion;

                // Normalize if we are not building all stages
                // Simple normalization: sum(ratios of active stages) -> scale to 1.0
                const activeRatiosSum = stagesToBuild.reduce((sum, s) => {
                    if (s === 'Awareness') return sum + verticalProfile.recommendedFunnelSplit.awareness;
                    if (s === 'Consideration') return sum + verticalProfile.recommendedFunnelSplit.consideration;
                    if (s === 'Conversion') return sum + verticalProfile.recommendedFunnelSplit.conversion;
                    return sum;
                }, 0);

                const normalizedRatio = stageRatio / activeRatiosSum;
                const campaignBudget = Math.floor(alloc.budget * normalizedRatio);

                if (campaignBudget < 50) return; // Skip tiny campaigns

                // Generate Creative/Messaging Specs
                let funnelConfig;
                if (stage === 'Awareness') funnelConfig = generateAwarenessLayer(input.vertical);
                else if (stage === 'Consideration') funnelConfig = generateConsiderationLayer(input.vertical);
                else funnelConfig = generateConversionLayer(input.vertical);

                campaigns.push({
                    name: `${alloc.channel} - ${stage}`,
                    objective: stage,
                    budget: campaignBudget,
                    stage: stage,
                    description: `${funnelConfig.messageAngle} | CTA: ${funnelConfig.cta} | Target: ${funnelConfig.audienceIntent}`,
                    targeting: {
                        geo: 'National', // Smart default, would come from input if we had it
                        audiences: [`${input.vertical} Intenders`, `${funnelConfig.audienceIntent}`],
                    }
                });
            });
        });

        // 5. Execution Steps
        const executionSteps = this.generateExecutionSteps(new Set(channelAllocations.map(c => c.channel)));

        // 6. Optimization Schedule
        const optimizationSchedule = [
            'Day 3: Sanity Check (Impressions, Clicks, Spend pace).',
            'Day 7: Keyword/Audience Audit. Negate irrelevant terms.',
            'Day 14: Creative Performance Review. Pause low CTR ads.',
            'Day 30: Full Monthly Report & Strategy Pivot.'
        ];

        return CampaignPlanSchema.parse({
            summary: {
                goal: `Drive ${input.objective} for ${input.vertical} Business`,
                totalBudget: input.budget,
                vertical: input.vertical,
                funnelSplit: verticalProfile.recommendedFunnelSplit
            },
            channels: channelAllocations,
            campaigns,
            execution_steps: executionSteps,
            optimization_schedule: optimizationSchedule,
            warnings
        });
    }

    private generateExecutionSteps(channels: Set<string>): string[] {
        const steps: string[] = [];

        if (channels.has('Google Search')) {
            steps.push('Link Google Ads to Google Analytics 4.');
            steps.push('Set up Convention Tracking for the defined goal.');
            steps.push('Launch Search Campaign with "Maximize Conversions" bidding.');
        }

        if (channels.has('Meta (Facebook/Instagram)')) {
            steps.push('Verify Domain in Meta Business Manager.');
            steps.push('Configure Aggregated Event Measurement.');
            steps.push('Launch Campaign with CAPI (Conversions API) enabled.');
        }

        if (channels.has('LinkedIn')) {
            steps.push('Install LinkedIn Insight Tag.');
            steps.push('Create Matched Audiences (Contact Lists/Company Lists).');
        }

        if (channels.has('TikTok')) {
            steps.push('Setup TikTok Pixel events.');
            steps.push('Enable Pangle placement if budget is low (optional).');
        }

        return steps;
    }
}

export const strategyEngine = new StrategyEngine();
