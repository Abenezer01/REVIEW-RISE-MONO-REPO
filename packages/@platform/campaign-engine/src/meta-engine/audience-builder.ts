import { CampaignInput } from '../schema/campaign-plan';
import { MetaAudience } from '../schema/meta-plan';
import { VERTICAL_PROFILES } from '../config/vertical-profiles';
import { metaInterestEngine } from './meta-interest-engine';
import { BudgetTier } from './meta-strategy-engine';

/**
 * Builds Meta Audiences based on Campaign Input, Vertical Intelligence, and Budget Tier.
 *
 * CRITICAL RULE: Website Visitors NEVER appear in Prospecting.
 * Retargeting audiences are ONLY built in FULL_FUNNEL tier.
 *
 * Tier routing:
 *   CONSOLIDATE  → 1 broad audience, no retargeting
 *   STANDARD     → 2 audiences (Intent + Broad), no retargeting
 *   FULL_FUNNEL  → 3 prospecting + 2 retargeting audiences
 */
export class MetaAudienceBuilder {

    public buildAudiences(input: CampaignInput, tier: BudgetTier): MetaAudience[] {
        switch (tier) {
            case 'CONSOLIDATE': return this.buildConsolidatedAudiences(input);
            case 'STANDARD': return this.buildStandardAudiences(input);
            case 'FULL_FUNNEL': return this.buildFullFunnelAudiences(input);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // CONSOLIDATE: 1 campaign, 1 broad ad set
    // Signal density > segmentation at this budget level
    // ─────────────────────────────────────────────────────────────────
    private buildConsolidatedAudiences(input: CampaignInput): MetaAudience[] {
        const geoRadius = 25;
        return [{
            type: 'Broad',
            name: 'Broad — 25mi Radius (Consolidated)',
            funnelStage: 'TOF',
            priorityScore: 80,
            geo: {
                city: input.geo,
                radius: geoRadius,
                unit: 'mile',
                audienceSizeEstimate: this.estimateAudienceSize(geoRadius)
            },
            interests: [] // No interests — let creative do the targeting
        }];
    }

    // ─────────────────────────────────────────────────────────────────
    // STANDARD: 2 prospecting ad sets, no retargeting
    // Intent cluster + Broad — enough signal without fragmentation
    // ─────────────────────────────────────────────────────────────────
    private buildStandardAudiences(input: CampaignInput): MetaAudience[] {
        const geoRadius = 25;
        const baseSize = this.estimateAudienceSize(geoRadius);
        const clusters = metaInterestEngine.generateClusters(input.vertical, baseSize);

        // Only use Intent (Cluster A) and Broad (Cluster C) — skip Topic to avoid fragmentation
        const intentCluster = clusters.find(c => c.theme.includes('Intent'));
        const broadCluster = clusters.find(c => c.theme.includes('Broad'));

        const audiences: MetaAudience[] = [];

        if (intentCluster) {
            audiences.push({
                type: 'Core',
                name: `Intent — ${intentCluster.theme}`,
                funnelStage: 'BOF',
                priorityScore: 85,
                geo: { city: input.geo, radius: geoRadius, unit: 'mile', audienceSizeEstimate: intentCluster.audienceSizeEstimate },
                interests: [intentCluster],
                exclusions: intentCluster.exclusions
            });
        }

        if (broadCluster) {
            audiences.push({
                type: 'Broad',
                name: 'Broad — No Interests (Algorithm-Led)',
                funnelStage: 'TOF',
                priorityScore: 60,
                geo: { city: input.geo, radius: geoRadius, unit: 'mile', audienceSizeEstimate: broadCluster.audienceSizeEstimate },
                interests: [],
                exclusions: broadCluster.exclusions
            });
        }

        return audiences;
    }

    // ─────────────────────────────────────────────────────────────────
    // FULL_FUNNEL: 3 prospecting + 2 retargeting
    // Full separation, proper exclusions, retargeting isolated
    // ─────────────────────────────────────────────────────────────────
    private buildFullFunnelAudiences(input: CampaignInput): MetaAudience[] {
        const geoRadius = 25;
        const baseSize = this.estimateAudienceSize(geoRadius);
        const clusters = metaInterestEngine.generateClusters(input.vertical, baseSize);

        const audiences: MetaAudience[] = [];

        // --- PROSPECTING: All 3 clusters ---
        clusters.forEach(cluster => {
            const isBroad = cluster.theme.includes('Broad');
            const isIntent = cluster.predictedIntentScore !== undefined && cluster.predictedIntentScore >= 8;

            audiences.push({
                type: isBroad ? 'Broad' : 'Core',
                name: cluster.theme,
                funnelStage: isIntent ? 'BOF' : 'TOF',
                priorityScore: this.calcPriorityScore(cluster.predictedIntentScore || 4),
                geo: {
                    city: input.geo,
                    radius: geoRadius,
                    unit: 'mile',
                    audienceSizeEstimate: cluster.audienceSizeEstimate
                },
                interests: isBroad ? [] : [cluster],
                exclusions: cluster.exclusions
            });
        });

        // --- RETARGETING: Website Visitors + Social Engagers ---
        // These NEVER go into Prospecting. They live in a separate campaign.

        audiences.push({
            type: 'Retargeting',
            name: 'Website Visitors — 30d (Exclude Converters)',
            funnelStage: 'BOF',
            priorityScore: 95,
            retargeting: {
                source: 'Website',
                windowDays: 30,
                engagementType: 'PageView',
                minAudienceSize: 1000
            },
            geo: {
                city: input.geo,
                radius: geoRadius,
                unit: 'mile',
                audienceSizeEstimate: 2000
            }
        });

        audiences.push({
            type: 'Retargeting',
            name: 'IG/FB Engagers — 90d (Exclude Converters)',
            funnelStage: 'MOF',
            priorityScore: 80,
            retargeting: {
                source: 'Instagram',
                windowDays: 90,
                engagementType: 'Engaged Shopper',
                minAudienceSize: 500
            },
            geo: {
                city: input.geo,
                radius: geoRadius,
                unit: 'mile',
                audienceSizeEstimate: 5000
            }
        });

        return audiences.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
    }

    private calcPriorityScore(intentScore: number): number {
        if (intentScore >= 8) return 85;
        if (intentScore >= 5) return 65;
        return 50;
    }

    private estimateAudienceSize(radius: number): number {
        const basePopPerMileSq = 1000;
        const area = Math.PI * radius * radius;
        return Math.round(area * basePopPerMileSq);
    }
}

export const metaAudienceBuilder = new MetaAudienceBuilder();
