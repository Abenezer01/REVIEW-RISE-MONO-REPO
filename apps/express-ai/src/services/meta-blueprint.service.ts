import {
    MetaBlueprintInput,
    MetaBlueprintOutput,
    MetaAudienceSet,
    MetaInterestCluster,
    MetaCopyVariation,
    PlacementRecommendation
} from '@platform/contracts';

export class MetaBlueprintService {
    async generate(input: MetaBlueprintInput): Promise<MetaBlueprintOutput> {
        const audiences = this.generateAudiences(input);
        const interestClusters = this.generateInterestClusters(input);
        const copyVariations = this.generateCopyVariations(input);
        const placements = this.generatePlacements(input);

        return {
            audiences,
            interestClusters,
            copyVariations,
            placements
        };
    }

    private generateAudiences(input: MetaBlueprintInput): MetaAudienceSet[] {
        const { geoTargeting } = input;

        const prospecting: MetaAudienceSet = {
            type: 'Prospecting',
            name: `${input.vertical} Prospecting - ${geoTargeting.center}`,
            demographics: {
                ageRange: '25-55',
                gender: 'All',
                homeowners: input.vertical === 'Local Service',
                languages: ['English']
            },
            geoLocations: [geoTargeting.center],
            interests: ['Home & Living', 'Busy Professionals', 'Family & Parenting'],
            estimatedReach: '150K - 200K',
        };

        const retargeting: MetaAudienceSet = {
            type: 'Retargeting',
            name: 'Warm Audiences - 30D',
            demographics: {
                ageRange: '30-55',
                gender: 'All',
                languages: ['English']
            },
            geoLocations: [geoTargeting.center],
            customAudiences: [
                'Website Visitors (30 days)',
                'Facebook/Instagram engagers (90 days)'
            ],
            lookalikeSources: [
                'Past Customers, active within 2+ years',
                'Facebook/Instagram, active within 2+ years'
            ],
            estimatedReach: '5K - 10K',
        };

        return [prospecting, retargeting];
    }

    private generateInterestClusters(input: MetaBlueprintInput): MetaInterestCluster[] {
        const clusters: MetaInterestCluster[] = [];

        if (input.vertical === 'Local Service') {
            clusters.push({
                name: 'Home & Living',
                theme: 'Home Improvement',
                type: 'Primary',
                interests: ['Home improvement', 'Interior design', 'Home organization', '+5 more'],
                exclusions: ['Budget cleaning']
            });
            clusters.push({
                name: 'Busy Professionals',
                theme: 'Real Estate / Movers',
                type: 'Secondary',
                interests: ['Work-life balance', 'Time management', 'Productivity', '+4 more'],
                exclusions: ['DIY cleaning', 'Job seeking']
            });
            clusters.push({
                name: 'Family & Parenting',
                theme: 'Competitors & Brands',
                type: 'Secondary',
                interests: ['Parenting', 'Busy activities', 'Child care', '+7 more'],
                exclusions: []
            });
        } else if (input.vertical === 'E-commerce') {
            clusters.push({
                name: 'Shopping Behavior',
                theme: 'Shopping Behavior',
                type: 'Primary',
                interests: ['Online shopping', 'Engaged shoppers', 'Luxury goods'],
                exclusions: []
            });
        } else {
            clusters.push({
                name: 'Industry Interests',
                theme: 'Industry Interests',
                type: 'Primary',
                interests: [input.offerOrService, 'Business', 'Entrepreneurship'],
                exclusions: []
            });
        }

        return clusters;
    }

    private generateCopyVariations(input: MetaBlueprintInput): MetaCopyVariation[] {
        // Safe lengths: Primary ~125, Headline ~40, Desc ~25
        const variations: MetaCopyVariation[] = [
            {
                id: '1',
                tone: 'Professional / Trust',
                primaryText: `Looking for top-rated ${input.offerOrService} in ${input.geoTargeting.center}? We provide professional, reliable service you can count on. Book today!`,
                headline: `Best ${input.offerOrService} in ${input.geoTargeting.center}`,
                description: 'Licensed & Insured.',
                ctas: ['Book Now', 'Learn More']
            },
            {
                id: '2',
                tone: 'Benefit-Focused',
                primaryText: `Don't let ${input.painPoints[0] || 'problems'} stress you out. Our expert team handles ${input.offerOrService} quickly and efficiently. Get a free quote now.`,
                headline: 'Fast & Affordable Service',
                description: 'Free Quotes Available.',
                ctas: ['Get Quote']
            },
            {
                id: '3',
                tone: 'Social Proof',
                primaryText: `Join hundreds of happy neighbors in ${input.geoTargeting.center} who trust us for their ${input.offerOrService} needs. 5-star rated and ready to help!`,
                headline: 'Rated 5 Stars Locally',
                description: 'See our reviews.',
                ctas: ['Contact Us']
            }
        ];
        return variations;
    }

    private generatePlacements(_input: MetaBlueprintInput): PlacementRecommendation[] {
        return [
            {
                platform: 'Facebook',
                format: 'Feed',
                objective: 'Awareness',
                rationale: 'Core for detailed storytelling and information.',
                recommended: true
            },
            {
                platform: 'Instagram',
                format: 'Stories',
                objective: 'Conversion',
                rationale: 'High intent, immersive full-screen experience.',
                recommended: true
            },
            {
                platform: 'Instagram',
                format: 'Reels',
                objective: 'Awareness',
                rationale: 'Excellent for reaching new audiences via algorithm.',
                recommended: true
            }
        ];
    }
}

export const metaBlueprintService = new MetaBlueprintService();
