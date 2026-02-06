
import {
    BlueprintInput,
    BlueprintOutput,
    KeywordCluster,
    AdGroup,
    RSAAssets,
    NegativeKeywordList,
    LandingPageAnalysis
} from '@platform/contracts';

export class BlueprintService {
    async generate(input: BlueprintInput): Promise<BlueprintOutput> {
        const clusters = this.generateKeywordClusters(input);
        const negatives = this.generateNegativeKeywords(input.vertical);
        const adGroups = this.buildAdGroups(clusters, input);
        const landingPageAnalysis = input.landingPageUrl
            ? await this.analyzeLandingPage(input.landingPageUrl)
            : undefined;

        return {
            clusters,
            adGroups,
            negatives,
            landingPageAnalysis,
        };
    }

    private generateKeywordClusters(input: BlueprintInput): KeywordCluster[] {
        const clusters: KeywordCluster[] = [];
        const baseService = input.offerOrService.toLowerCase();
        const locations = input.geoTargeting.length > 0 ? input.geoTargeting : ['near me'];

        // 1. Service Intent Cluster
        const serviceKeywords = locations.flatMap(loc => [
            { term: `${baseService} ${loc}`, matchType: 'Phrase' as const },
            { term: `best ${baseService} ${loc}`, matchType: 'Phrase' as const },
            { term: `${baseService} company`, matchType: 'Phrase' as const },
        ]);

        clusters.push({
            intent: 'Service',
            theme: `${input.offerOrService} - General`,
            keywords: serviceKeywords,
        });

        // 2. Problem Intent Cluster (based on pain points)
        if (input.painPoints.length > 0) {
            const problemKeywords = input.painPoints.flatMap(pain =>
                locations.map(loc => ({ term: `fix ${pain} ${loc}`, matchType: 'Broad' as const }))
            );

            clusters.push({
                intent: 'Problem',
                theme: 'Pain Points & Solutions',
                keywords: problemKeywords,
            });
        }

        return clusters;
    }

    private generateNegativeKeywords(vertical: string): NegativeKeywordList[] {
        const commonNegatives = ['free', 'job', 'hiring', 'salary', 'internship', 'diy', 'how to', 'training', 'course'];

        const verticalSpecific: Record<string, string[]> = {
            'Local Service': ['tools', 'parts', 'supply', 'wholesale'],
            'E-commerce': ['repair', 'service', 'rent'],
            'SaaS': ['cracked', 'torrent', 'free download'],
            'Healthcare': ['school', 'degree', 'veterinary'],
        };

        return [
            {
                category: 'General Waste',
                keywords: commonNegatives,
            },
            {
                category: 'Vertical Specific',
                keywords: verticalSpecific[vertical] || [],
            },
        ];
    }

    private buildAdGroups(clusters: KeywordCluster[], input: BlueprintInput): AdGroup[] {
        return clusters.map(cluster => {
            return {
                name: `${cluster.intent} - ${cluster.theme}`,
                keywords: cluster,
                assets: this.generateRSAAssets(input, cluster),
            };
        });
    }

    private generateRSAAssets(input: BlueprintInput, cluster: KeywordCluster): RSAAssets {
        // Basic template-based generation
        const location = input.geoTargeting[0] || 'Your Area';

        return {
            headlines: [
                `${input.offerOrService} in ${location}`.substring(0, 30),
                `Top Rated ${input.offerOrService}`.substring(0, 30),
                `Need ${cluster.theme.split(' - ')[0]}?`.substring(0, 30),
                'Call for Free Estimate', // Trust/CTA
                'Licensed & Insured', // Trust
                'Same Day Service Available', // Value Prop
                '100% Satisfaction Guaranteed',
                `Expert ${input.offerOrService}`,
                'Affordable Pricing',
                'Book Online Today',
            ].filter(h => h.length <= 30),
            descriptions: [
                `Looking for ${input.offerOrService}? We provide top-rated service in ${location}. Call now!`.substring(0, 90),
                `Don't let ${input.painPoints[0] || 'issues'} ruin your day. Fast, reliable help is just a call away.`.substring(0, 90),
                'Licensed, insured, and ready to help. Get your free quote today and see the difference.',
                `Serving ${location} with professional ${input.offerOrService} services. Customer satisfaction guaranteed.`,
            ].filter(d => d.length <= 90),
        };
    }

    private async analyzeLandingPage(url: string): Promise<LandingPageAnalysis> {
        // Mock analysis
        return {
            url,
            score: 85,
            mobileOptimized: true,
            trustSignalsDetected: ['Phone Number', 'HTTPS', 'Form'],
            missingElements: ['Testimonials', 'Awards/Badges'],
        };
    }
}

export const blueprintService = new BlueprintService();
