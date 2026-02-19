import { CampaignInput, ChannelDistribution, CampaignObjective } from '../schema/campaign-plan';
import { OBJECTIVE_CHANNEL_RULES } from '../constants';

export interface ChannelRule {
    channels: Record<string, number>; // Channel name -> weight
    rationale: string;
}



export const calculateChannelAllocations = (input: CampaignInput): ChannelDistribution[] => {
    const rule = OBJECTIVE_CHANNEL_RULES[input.objective];

    if (!rule) {
        // Default fallback
        return [{
            channel: 'Google Search',
            allocationPercentage: 1,
            budget: input.budget,
            rationale: 'Default fallback: Capture high intent demand.'
        }];
    }

    // Refine based on Vertical if needed (e.g. SaaS -> add LinkedIn)
    let channels = { ...rule.channels };
    let rationale = rule.rationale;

    if (input.vertical === 'SaaS' && input.objective === 'Leads') {
        channels = {
            'Google Search': 0.6,
            'LinkedIn': 0.4
        };
        rationale = 'SaaS Leads prioritize Search and LinkedIn for B2B targeting.';
    }

    // Normalize and map to output
    const distributions: ChannelDistribution[] = [];
    const entries = Object.entries(channels);

    for (const [channelName, weight] of entries) {
        if (weight > 0) {
            distributions.push({
                // Allow any string cast to enum for now, or ensure strict typing
                channel: channelName as any,
                allocationPercentage: weight,
                budget: Math.floor(input.budget * weight),
                rationale: rationale
            });
        }
    }

    return distributions;
};
