import { CampaignInput, KeywordClusterSchema, AdGroupSchema } from '../schema/campaign-plan';
import { rsaCopyGenerator } from './rsa-copy-generator';
import { extensionsGenerator } from './extensions-generator';
import { z } from 'zod';

type KeywordCluster = z.infer<typeof KeywordClusterSchema>;
type AdGroup = z.infer<typeof AdGroupSchema>;

interface KeywordWithMatchType {
    term: string;
    matchType: 'Exact' | 'Phrase' | 'Broad';
}

interface AdGroupMetadata {
    keywordsCount: number;
    avgIntentStrength: number;
    primaryMatchType: string;
}

export class AdGroupBuilder {

    public buildAdGroups(clusters: KeywordCluster[], input: CampaignInput): AdGroup[] {
        const adGroups: AdGroup[] = [];
        const seenKeywords = new Set<string>(); // Global deduplication tracker

        for (const cluster of clusters) {
            // 1. Convert keywords to objects with match types
            const keywordObjects = this.normalizeKeywords(cluster);

            // 2. Deduplicate across clusters
            const uniqueKeywords = keywordObjects.filter(kw => {
                const key = kw.term.toLowerCase();
                if (seenKeywords.has(key)) {
                    return false; // Skip duplicate
                }
                seenKeywords.add(key);
                return true;
            });

            if (uniqueKeywords.length === 0) continue; // Skip empty clusters

            // 3. Split into chunks (configurable size, default 20)
            const chunkSize = input.keywordsPerAdGroup || 20;
            const chunks = this.chunkKeywords(uniqueKeywords, chunkSize);

            chunks.forEach((chunk, index) => {
                const suffix = chunks.length > 1 ? ` - ${index + 1}` : '';
                const adGroupName = `${cluster.clusterName}${suffix}`;

                // 4. Generate funnel-stage-aware RSA assets
                const rsaAssets = rsaCopyGenerator.generateAssets(
                    input,
                    adGroupName,
                    cluster.funnelStage // Pass funnel stage for context-aware copy
                );

                // 5. Generate extensions (keep as object for flexibility)
                const extensions = extensionsGenerator.generateExtensions(input);

                // 6. Calculate metadata
                const metadata = this.calculateMetadata(chunk, cluster);

                // 7. Debug logging
                console.log(`[AdGroup] ${adGroupName} | Keywords: ${chunk.length} | Stage: ${cluster.funnelStage} | Avg Intent: ${metadata.avgIntentStrength.toFixed(1)}`);

                adGroups.push({
                    adGroupName: adGroupName,
                    funnelStage: cluster.funnelStage,
                    keywords: chunk.map(kw => kw.term), // Schema expects strings for now
                    rsaAssets: rsaAssets,
                    extensions: this.flattenExtensions(extensions), // Flatten for current schema
                    // Metadata (not in schema yet, but useful for AI layer)
                    // metadata: metadata
                });
            });
        }

        return adGroups;
    }

    /**
     * Normalize keywords from cluster to objects with match types
     */
    private normalizeKeywords(cluster: KeywordCluster): KeywordWithMatchType[] {
        return cluster.keywords.map((kw, index) => ({
            term: kw,
            matchType: (cluster.matchTypes && cluster.matchTypes[index]) || 'Phrase'
        }));
    }

    /**
     * Chunk keywords into groups of specified size
     */
    private chunkKeywords(keywords: KeywordWithMatchType[], size: number): KeywordWithMatchType[][] {
        const chunks: KeywordWithMatchType[][] = [];
        for (let i = 0; i < keywords.length; i += size) {
            chunks.push(keywords.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Calculate metadata for ad group
     */
    private calculateMetadata(keywords: KeywordWithMatchType[], cluster: KeywordCluster): AdGroupMetadata {
        const matchTypeCounts = keywords.reduce((acc, kw) => {
            acc[kw.matchType] = (acc[kw.matchType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const primaryMatchType = Object.entries(matchTypeCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Phrase';

        return {
            keywordsCount: keywords.length,
            avgIntentStrength: cluster.intentStrength || 5,
            primaryMatchType
        };
    }

    /**
     * Flatten extensions for current schema
     */
    private flattenExtensions(extensions: any): string[] {
        return [
            ...extensions.sitelinks.map((sl: any) => `Sitelink: ${sl.text}`),
            ...extensions.callouts.map((c: string) => `Callout: ${c}`),
            ...extensions.structuredSnippets.map((ss: any) => `Snippet: ${ss.header}: ${ss.values.join(', ')}`)
        ];
    }
}

export const adGroupBuilder = new AdGroupBuilder();
