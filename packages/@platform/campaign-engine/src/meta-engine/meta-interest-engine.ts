import { MetaInterestCluster } from '../schema/meta-plan';
import { VERTICAL_PROFILES, VerticalType } from '../config/vertical-profiles';

export class MetaInterestEngine {

    /**
     * Generates a set of Interest Clusters for a given vertical.
     * Strategies:
     * 1. Core Vertical Interests (High Intent)
     * 2. Broad Related Interests (Discovery)
     * 3. Behavioral / Demographic (Qualifiers)
     * 4. Competitor Proxies (if available/applicable)
     */
    public generateClusters(vertical: VerticalType, baseAudienceSize: number): MetaInterestCluster[] {
        const clusters: MetaInterestCluster[] = [];
        const profile = VERTICAL_PROFILES[vertical] || VERTICAL_PROFILES['Other' as VerticalType];

        // Safety check for missing profile data
        if (!profile.metaInterests || !profile.metaInterests.core) {
            return [{
                theme: 'Broad Targeting',
                interests: ['Small Business', 'Entrepreneurship'], // Safe fallback
                audienceSizeEstimate: baseAudienceSize
            }];
        }

        // 1. Core Cluster
        clusters.push({
            theme: `${vertical} Core`,
            interests: profile.metaInterests.core,
            exclusions: ['Competitors'],
            audienceSizeEstimate: Math.round(baseAudienceSize * 0.45),
            predictedIntentScore: 9
        });

        // 2. Broad Cluster
        if (profile.metaInterests.broad && profile.metaInterests.broad.length > 0) {
            clusters.push({
                theme: 'Broad / Related Topics',
                interests: profile.metaInterests.broad,
                audienceSizeEstimate: Math.round(baseAudienceSize * 0.65),
                predictedIntentScore: 5
            });
        }

        // 3. Behavioral Cluster
        if (profile.metaInterests.behaviors && profile.metaInterests.behaviors.length > 0) {
            clusters.push({
                theme: 'High Interaction Behaviors',
                interests: profile.metaInterests.behaviors,
                audienceSizeEstimate: Math.round(baseAudienceSize * 0.35),
                predictedIntentScore: 7
            });
        }

        // 4. Combined 'Super' Cluster (Core + Behavior) if we have both
        if (profile.metaInterests.core.length > 0 && profile.metaInterests.behaviors.length > 0) {
            clusters.push({
                theme: 'Core + Behavioral Layer',
                interests: [...profile.metaInterests.core, ...profile.metaInterests.behaviors],
                audienceSizeEstimate: Math.round(baseAudienceSize * 0.25), // Narrower because we might intersect in ad manager, but here we list them. 
                // Note: Meta treats lists as OR usually. Stacked interests is different. 
                // For now, we assume this is a standard OR list to see which signals work better.
                predictedIntentScore: 8
            });
        }

        return clusters;
    }
}

export const metaInterestEngine = new MetaInterestEngine();
