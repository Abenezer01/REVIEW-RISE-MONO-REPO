import { CampaignInput } from '../schema/campaign-plan';

export interface PlacementRecommendation {
    placements: string[];
    rationale: string;
}

export class MetaPlacementEngine {

    public recommendPlacements(input: CampaignInput, funnelStage: 'TOF' | 'MOF' | 'BOF'): PlacementRecommendation {
        // Default to Advantage+ (All Placements) if no specific reason to narrow
        // But for Blueprint, we want to show specific strategic choices.

        if (funnelStage === 'TOF') {
            // Awareness / Discovery
            // Broadest reach: Feed, Stories, Reels, Audience Network
            return {
                placements: ['facebook_feed', 'instagram_feed', 'instagram_stories', 'facebook_stories', 'instagram_reels', 'facebook_reels'],
                rationale: 'Maximize reach and discovery across high-volume surface areas (Feed, Stories, Reels).'
            };
        }

        if (funnelStage === 'MOF') {
            // Consideration
            // Focus on high quality feeds where people read/engage
            return {
                placements: ['facebook_feed', 'instagram_feed', 'instagram_explore', 'messenger_inbox'],
                rationale: 'Focus on high-attention placements where users are likely to engage and read content.'
            };
        }

        if (funnelStage === 'BOF') {
            // Conversion
            // High intent: Feed, Search, Shops
            // Remove Audience Network usually (often low quality traffic for conversions unless verified)
            const placements = ['facebook_feed', 'instagram_feed', 'facebook_marketplace'];

            if (input.vertical === 'E-commerce') {
                placements.push('instagram_shop');
            }

            return {
                placements,
                rationale: 'Prioritize placements with highest historical conversion rates (Feed, Marketplace).'
            };
        }

        return {
            placements: [],
            rationale: 'Advantage+ Recommended'
        };
    }
}

export const metaPlacementEngine = new MetaPlacementEngine();
