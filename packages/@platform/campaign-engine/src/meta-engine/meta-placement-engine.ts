import { CampaignInput } from '../schema/campaign-plan';

export interface PlacementRecommendation {
    strategy: string;       // Named strategy (e.g. "Advantage+ Placements")
    placements: string[];
    rationale: string;
    notes: string[];        // Actionable notes for the media buyer
}

/**
 * Recommends placements based on campaign type.
 *
 * Senior Strategy:
 *   Prospecting → Advantage+ (maximize liquidity, let Meta find buyers)
 *     - Include Reels if video asset exists (higher reach, lower CPM)
 *     - Test Marketplace cautiously for local service
 *     - Exclude Audience Network (low-quality traffic for local biz)
 *
 *   Retargeting → Feed + Stories ONLY (high visibility, controlled frequency)
 *     - Avoid Reels/Explore for retargeting (low intent context)
 *     - Monitor frequency weekly — cap at 3-4x/week
 *     - Exclude converters from all retargeting ad sets
 */
export class MetaPlacementEngine {

    public recommendPlacements(
        input: CampaignInput,
        campaignType: 'Prospecting' | 'Retargeting',
        hasVideoAsset: boolean = false
    ): PlacementRecommendation {

        if (campaignType === 'Prospecting') {
            const placements = [
                'facebook_feed',
                'instagram_feed',
                'instagram_explore',
                'facebook_marketplace',  // Good for local service discovery
                'instagram_stories',
                'facebook_stories',
            ];

            // Add Reels if video asset exists — higher reach, lower CPM
            if (hasVideoAsset) {
                placements.push('instagram_reels', 'facebook_reels');
            }

            return {
                strategy: 'Advantage+ Placements (Excluding Audience Network)',
                placements,
                rationale: 'Maximize delivery liquidity. Let Meta\'s algorithm find the highest-value users across surfaces. Excluding Audience Network removes low-quality traffic common in local service campaigns.',
                notes: [
                    'Do NOT manually restrict placements further — this reduces Meta\'s ability to optimize.',
                    hasVideoAsset
                        ? 'Reels included — video assets get 30-40% lower CPM on average.'
                        : 'Add a video asset to unlock Reels placements and reduce CPM.',
                    'Marketplace is included for local service — monitor CTR weekly and exclude if < 0.5%.',
                    'Audience Network is excluded — click quality is poor for local lead gen.'
                ]
            };
        }

        // Retargeting — strict control
        return {
            strategy: 'Manual Placements — Feed + Stories Only',
            placements: [
                'facebook_feed',
                'instagram_feed',
                'instagram_stories',
                'facebook_stories'
            ],
            rationale: 'Warm audiences need high-visibility, high-intent placements. Feed and Stories have the highest attention and conversion rates for retargeting. Avoid low-intent contexts (Reels, Explore, Marketplace) where users are in discovery mode.',
            notes: [
                'Monitor frequency weekly. Cap at 3–4 impressions/person/week to avoid burnout.',
                'Exclude converters from all retargeting ad sets (use custom audience exclusion).',
                'If audience < 1,000 people, pause retargeting and redirect budget to prospecting.',
                'Run retargeting for minimum 7 days before evaluating performance.'
            ]
        };
    }
}

export const metaPlacementEngine = new MetaPlacementEngine();
