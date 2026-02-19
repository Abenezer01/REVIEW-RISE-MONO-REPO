import { MetaInterestCluster } from '../schema/meta-plan';
import { VERTICAL_PROFILES, VerticalType } from '../config/vertical-profiles';

/**
 * Generates STRICTLY SEPARATED interest clusters.
 *
 * Senior Media Buyer Rule: Internal competition kills delivery.
 * Each cluster must be mutually exclusive via explicit exclusions.
 *
 * 3-Cluster Structure:
 *   Cluster A — Intent:       Homeowners + Recently Moved (high-intent behavioral)
 *   Cluster B — Topic:        Service/Renovation Interests (topic-based)
 *   Cluster C — Broad:        No interests, 25mi radius, let Meta optimize
 */
export class MetaInterestEngine {

    public generateClusters(vertical: VerticalType, baseAudienceSize: number): MetaInterestCluster[] {
        const profile = VERTICAL_PROFILES[vertical] || VERTICAL_PROFILES['Other' as VerticalType];

        // Fallback: if no profile data, return pure broad only
        if (!profile.metaInterests || !profile.metaInterests.core) {
            return [{
                theme: 'Broad — No Interests',
                interests: [],
                audienceSizeEstimate: baseAudienceSize,
                predictedIntentScore: 3
            }];
        }

        const intentInterests = profile.metaInterests.core;
        const topicInterests = profile.metaInterests.behaviors || [];

        const clusters: MetaInterestCluster[] = [];

        // ─────────────────────────────────────────────────────────────
        // Cluster A — Intent
        // Who: People actively searching for or engaging with this service
        // Excludes: Topic interests (to prevent overlap with Cluster B)
        // ─────────────────────────────────────────────────────────────
        clusters.push({
            theme: 'Intent — Homeowners & High-Intent',
            interests: intentInterests,
            exclusions: topicInterests,   // Strict: exclude Cluster B's interests
            audienceSizeEstimate: Math.round(baseAudienceSize * 0.25),
            predictedIntentScore: 9
        });

        // ─────────────────────────────────────────────────────────────
        // Cluster B — Topic / Renovation Interests
        // Who: People interested in home improvement, renovation, etc.
        // Excludes: Intent interests (to prevent overlap with Cluster A)
        // ─────────────────────────────────────────────────────────────
        if (topicInterests.length > 0) {
            clusters.push({
                theme: 'Topic — Renovation & Service Interests',
                interests: topicInterests,
                exclusions: intentInterests,  // Strict: exclude Cluster A's interests
                audienceSizeEstimate: Math.round(baseAudienceSize * 0.40),
                predictedIntentScore: 6
            });
        }

        // ─────────────────────────────────────────────────────────────
        // Cluster C — Broad
        // Who: No interest targeting — let Meta's algorithm find buyers
        // Excludes: ALL interests from A and B (pure broad signal)
        // Senior note: This is often the best performer with strong creative
        // ─────────────────────────────────────────────────────────────
        clusters.push({
            theme: 'Broad — No Interests (Algorithm-Led)',
            interests: [],  // Empty = pure broad
            exclusions: [...intentInterests, ...topicInterests],
            audienceSizeEstimate: Math.round(baseAudienceSize * 0.80),
            predictedIntentScore: 4
        });

        return clusters;
    }
}

export const metaInterestEngine = new MetaInterestEngine();
