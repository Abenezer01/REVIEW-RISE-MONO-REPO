import { CampaignInput } from '../schema/campaign-plan';
import { MetaAudience, MetaInterestCluster } from '../schema/meta-plan';
import { VERTICAL_PROFILES } from '../config/vertical-profiles';
import { metaInterestEngine } from './meta-interest-engine';

/**
 * Builds Meta Audiences based on Campaign Input and Vertical Intelligence.
 */
export class MetaAudienceBuilder {

    /**
     * Generates a complete audience strategy (Prospecting + Retargeting).
     */
    public buildAudiences(input: CampaignInput): MetaAudience[] {
        const audiences: MetaAudience[] = [];
        const profile = VERTICAL_PROFILES[input.vertical] || VERTICAL_PROFILES['Other'];

        const geoRadius = 25; // Default radius
        const baseAudienceSize = this.estimateAudienceSize(geoRadius, input.vertical);

        // --- 1. Core / Interest Audience (MOF) - Split into Clusters ---
        // We generate specific interest clusters for testing
        const interestClusters = metaInterestEngine.generateClusters(input.vertical, baseAudienceSize);

        // Create an audience for EACH cluster? Or one audience with multiple clusters?
        // The requirement says "Output... Interest clusters". Usually strictly separate ad sets or one ad set with stack.
        // For Blueprint, we usually want to show OPTIONS. 
        // Let's create `Core Audience` with the BEST cluster, and maybe secondary audiences?
        // OR: The `MetaAudience` schema has `interests: MetaInterestCluster[]`. 
        // So we can put ALL clusters into one Audience object (as options) OR separate audiences.
        // Given the requirement "Build 3-6 clusters per audience", it implies the Audience object holds these clusters.

        const coreAudience: MetaAudience = {
            type: 'Core',
            name: `${input.vertical} - Interest Clusters`,
            funnelStage: 'MOF',
            priorityScore: this.calculatePriorityScore('MOF', 8, baseAudienceSize), // Intent: 8/10
            predictedValue: this.calculatePredictedValue('MOF', profile.benchmarks.cvr.MOF),
            audienceSizeEstimate: baseAudienceSize * 0.5,
            geo: {
                city: input.geo,
                radius: geoRadius,
                unit: 'mile',
                audienceSizeEstimate: baseAudienceSize * 0.5
            },
            interests: interestClusters
        };
        audiences.push(coreAudience);

        // --- 2. Broad / Discovery Audience (TOF) ---
        // Wide net for algorithm to find people
        const broadAudience: MetaAudience = {
            type: 'Core',
            name: 'Broad Discovery (AI Targeting)',
            funnelStage: 'TOF',
            priorityScore: this.calculatePriorityScore('TOF', 5, baseAudienceSize),
            predictedValue: this.calculatePredictedValue('TOF', profile.benchmarks.cvr.TOF),
            audienceSizeEstimate: baseAudienceSize,
            geo: {
                city: input.geo,
                radius: geoRadius + 5, // Slightly wider
                unit: 'mile',
                audienceSizeEstimate: baseAudienceSize
            }
        };
        audiences.push(broadAudience);

        // --- 3. Lookalike Audience (BOF/MOF) ---
        // Only if not primarily Awareness
        if (input.objective !== 'Awareness') {
            const lalAudience: MetaAudience = {
                type: 'Lookalike',
                name: '1% Lookalike - Purchasers',
                funnelStage: 'MOF',
                priorityScore: this.calculatePriorityScore('MOF', 9, 2000000), // High Intent
                predictedValue: this.calculatePredictedValue('MOF', profile.benchmarks.cvr.MOF * 1.2),
                audienceSizeEstimate: 2000000, // Fixed size for 1% LAL in US usually ~2M+ but local scales down. 
                // Local LAL is usually small, so we might skip LAL for pure local businesses unless they have big lists.
                // Keeping it for E-com mainly.
                geo: {
                    city: input.geo,
                    radius: geoRadius,
                    unit: 'mile',
                    audienceSizeEstimate: 50000 // Placeholder for local slice of LAL
                },
                lookalike: {
                    source: 'Customer List / Pixel Purchase',
                    percentage: 1
                }
            };

            // Adjust for local vs e-com
            if (input.vertical !== 'Local Service' && input.vertical !== 'Restaurant') {
                audiences.push(lalAudience);
            }
        }

        // --- 4. Retargeting (BOF) ---
        // Highest value
        const retargetingAudience: MetaAudience = {
            type: 'Retargeting',
            name: 'All Website Visitors (30d)',
            funnelStage: 'BOF',
            priorityScore: this.calculatePriorityScore('BOF', 10, 1000), // Very small but high value
            predictedValue: this.calculatePredictedValue('BOF', profile.benchmarks.cvr.BOF),
            audienceSizeEstimate: 1000, // Placeholder
            geo: {
                city: input.geo,
                radius: geoRadius,
                unit: 'mile',
                audienceSizeEstimate: 1000
            },
            retargeting: {
                source: 'Website',
                windowDays: 30,
                engagementType: 'PageView'
            }
        };
        audiences.push(retargetingAudience);

        return audiences.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
    }

    /**
     * Calculates priority score (0-100)
     * Base weights: BOF (3x), MOF (1.5x), TOF (0.5x)
     * + Intent Score (1-10)
     * +/- Audience Size Modifier
     */
    private calculatePriorityScore(stage: 'TOF' | 'MOF' | 'BOF', intentScore: number, size: number): number {
        const stageWeights = {
            'BOF': 3.0,
            'MOF': 1.5,
            'TOF': 0.5
        };

        const baseScore = 50;
        const weightedScore = (intentScore * 5) * stageWeights[stage]; // max 50 * 3 = 150 (cap at 100)

        let finalScore = baseScore + (weightedScore / 3); // Normalize a bit

        // Penalize very small audiences (unless BOF)
        if (size < 1000 && stage !== 'BOF') {
            finalScore -= 20;
        }

        return Math.min(Math.round(finalScore), 100);
    }

    /**
     * Simple heuristic for predicted value (relative scale)
     */
    private calculatePredictedValue(stage: string, cvr: number): number {
        // Value = CVR * constant (representing generally higher ticket for conversions)
        return Math.round(cvr * 10000);
    }

    /**
     * Mock estimator for radius size
     */
    private estimateAudienceSize(radius: number, vertical: string): number {
        // Base population density model
        // In reality, this would query an API
        const basePopPerMileSq = 1000;
        const area = Math.PI * radius * radius;
        return Math.round(area * basePopPerMileSq);
    }
}

export const metaAudienceBuilder = new MetaAudienceBuilder();
