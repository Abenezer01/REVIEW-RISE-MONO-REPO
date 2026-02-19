import { CampaignInput, KeywordClusterSchema } from '../schema/campaign-plan';
import { z } from 'zod';

export type KeywordCluster = z.infer<typeof KeywordClusterSchema>;

type FunnelStage = 'TOF' | 'MOF' | 'BOF';

export class KeywordClusteringEngine {

    public generateClusters(input: CampaignInput): KeywordCluster[] {
        const clusters: KeywordCluster[] = [];

        // 1️⃣ Service Clusters (MOF)
        input.services.forEach(service => {
            clusters.push(this.createServiceCluster(service, input));
        });

        // 2️⃣ Brand Cluster (BOF)
        if (input.businessName) {
            clusters.push(this.createBrandCluster(input.businessName));
        }

        // 3️⃣ Problem Clusters (TOF)
        if (input.painPoints?.length) {
            input.painPoints.forEach(pain => {
                clusters.push(this.createProblemCluster(pain));
            });
        }

        // 4️⃣ Emergency Clusters (Per Service)
        if (input.vertical === 'Local Service' || input.vertical === 'Healthcare') {
            input.services.forEach(service => {
                clusters.push(this.createEmergencyCluster(service, input.geo));
            });
        }

        return this.deduplicateClusters(clusters);
    }

    // ============================
    // SERVICE CLUSTER (MOF)
    // ============================

    private createServiceCluster(service: string, input: CampaignInput): KeywordCluster {
        const geoKeywords = this.generateGeoKeywords(service, input.geo);
        const commercialModifiers = this.getCommercialModifiers(input.vertical);

        const modifierKeywords = commercialModifiers.map(m => `${service} ${m}`);

        const baseKeywords = [
            service,
            `${service} service`,
            `${service} company`,
            `best ${service}`,
            `${service} cost`,
            `${service} price`,
        ];

        const keywords = this.unique([
            ...baseKeywords,
            ...modifierKeywords,
            ...geoKeywords
        ]);

        // Assign match types based on keyword characteristics
        const matchTypes = keywords.map(kw => {
            // Exact match for branded/specific terms
            if (kw.includes('near me') || kw.includes('emergency')) return 'Exact';
            // Phrase match for geo-targeted keywords
            if (kw.includes(input.geo || '')) return 'Phrase';
            // Broad match for generic service terms
            if (kw === service || kw === `${service} service`) return 'Broad';
            // Default to Phrase for commercial intent
            return 'Phrase';
        });

        return {
            clusterName: `${service} - Service`,
            funnelStage: 'MOF',
            intentType: 'Service',
            keywords,
            matchTypes,
            intentStrength: this.calculateIntentStrength(keywords, 'MOF')
        };
    }

    // ============================
    // BRAND CLUSTER (BOF)
    // ============================

    private createBrandCluster(name: string): KeywordCluster {
        const keywords = [
            name,
            `${name} reviews`,
            `${name} pricing`,
            `${name} login`,
            `${name} contact`
        ];

        const uniqueKeywords = this.unique(keywords);
        const matchTypes = uniqueKeywords.map(kw =>
            kw === name ? 'Exact' : 'Phrase'
        );

        return {
            clusterName: `${name} - Brand`,
            funnelStage: 'BOF',
            intentType: 'Brand',
            keywords: uniqueKeywords,
            matchTypes,
            intentStrength: 10
        };
    }

    // ============================
    // PROBLEM CLUSTER (TOF)
    // ============================

    private createProblemCluster(painPoint: string): KeywordCluster {
        const keywords = [
            `how to fix ${painPoint}`,
            `why is ${painPoint}`,
            `${painPoint} causes`,
            `${painPoint} solutions`,
            `what causes ${painPoint}`
        ];

        const uniqueKeywords = this.unique(keywords);
        const matchTypes: ('Exact' | 'Phrase' | 'Broad')[] = uniqueKeywords.map(() => 'Broad'); // TOF = Broad for reach

        return {
            clusterName: `${painPoint} - Problem`,
            funnelStage: 'TOF',
            intentType: 'Problem',
            keywords: uniqueKeywords,
            matchTypes,
            intentStrength: this.calculateIntentStrength(keywords, 'TOF')
        };
    }

    // ============================
    // EMERGENCY CLUSTER (BOF)
    // ============================

    private createEmergencyCluster(service: string, geo?: string): KeywordCluster {
        const keywords = [
            `emergency ${service}`,
            `24/7 ${service}`,
            `${service} near me`,
            `urgent ${service}`,
            `same day ${service}`
        ];

        if (geo) {
            keywords.push(`emergency ${service} ${geo}`);
            keywords.push(`${service} near ${geo}`);
        }

        const uniqueKeywords = this.unique(keywords);
        const matchTypes = uniqueKeywords.map(kw =>
            kw.includes('near me') || kw.includes('emergency') ? 'Exact' : 'Phrase'
        );

        return {
            clusterName: `${service} - Emergency`,
            funnelStage: 'BOF',
            intentType: 'Emergency',
            keywords: uniqueKeywords,
            matchTypes,
            intentStrength: this.calculateIntentStrength(keywords, 'BOF')
        };
    }

    // ============================
    // HELPERS
    // ============================

    private generateGeoKeywords(service: string, geo?: string): string[] {
        if (!geo) return [];

        return [
            `${service} in ${geo}`,
            `${service} ${geo}`,
            `${geo} ${service}`,
            `${service} near ${geo}`
        ];
    }

    private getCommercialModifiers(vertical?: string): string[] {
        const base = ['quote', 'pricing', 'affordable', 'licensed'];

        if (vertical === 'Local Service') {
            return [...base, 'near me', 'same day', 'insured'];
        }

        if (vertical === 'Healthcare') {
            return [...base, 'appointment', 'clinic', 'specialist'];
        }

        return base;
    }

    private calculateIntentStrength(keywords: string[], stage: FunnelStage): number {
        let score = 5;

        keywords.forEach(k => {
            if (k.includes('near me') || k.includes('emergency')) score += 2;
            if (k.includes('cost') || k.includes('price') || k.includes('quote')) score += 1;
        });

        if (stage === 'BOF') score += 2;
        if (stage === 'TOF') score -= 2;

        return Math.min(10, Math.max(1, score));
    }

    private deduplicateClusters(clusters: KeywordCluster[]): KeywordCluster[] {
        return clusters.map(cluster => ({
            ...cluster,
            keywords: this.unique(cluster.keywords)
        }));
    }

    private unique(arr: string[]): string[] {
        return [...new Set(arr.map(k => k.toLowerCase()))];
    }
}

export const keywordClusteringEngine = new KeywordClusteringEngine();
