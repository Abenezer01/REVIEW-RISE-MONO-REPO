import { CampaignInput } from '../schema/campaign-plan';
import { MetaAudience, MetaCreative } from '../schema/meta-plan';
import { metaCopyGenerator } from './meta-copy-generator';

export interface RetargetingStrategy {
    audiences: MetaAudience[];
    creatives: Record<string, MetaCreative>; // Map audience name/id to creative
}

export class MetaRetargetingEngine {

    public buildRetargetingStrategy(input: CampaignInput): RetargetingStrategy {
        const audiences: MetaAudience[] = [];
        const creatives: Record<string, MetaCreative> = {};

        // 1. High Intent: Add To Cart / Initiate Checkout (7 Days)
        if (input.vertical === 'E-commerce') {
            const atcAudience = this.createAudience(input, 'Add To Cart (7d)', 'BOF', 14, 95, 'AddToCart');
            audiences.push(atcAudience);
            creatives[atcAudience.name] = this.generateCreative(input, 'Abandoned Cart');
        }

        // 2. Medium Intent: Website Visitors (30 Days)
        const webVisitorAudience = this.createAudience(input, 'Website Visitors (30d)', 'BOF', 30, 85, 'PageView');
        audiences.push(webVisitorAudience);
        creatives[webVisitorAudience.name] = this.generateCreative(input, 'General Retargeting');

        // 3. Social Engagers (IG/FB - 90 Days) - Good for MOF/BOF
        const socialAudience: MetaAudience = {
            type: 'Retargeting',
            name: 'IG & FB Engagers (90d)',
            funnelStage: 'MOF',
            priorityScore: 70, // Lower than website visitors
            geo: {
                city: input.geo,
                radius: 25,
                unit: 'mile'
            },
            retargeting: {
                source: 'Instagram', // Simplified for schema
                windowDays: 90,
                engagementType: 'Engaged Shopper' // Using this as proxy for 'Engaged with Account'
            },
            audienceSizeEstimate: 5000 // Placeholder
        };
        audiences.push(socialAudience);
        creatives[socialAudience.name] = metaCopyGenerator.generateCreative(input, 'MOF'); // Re-use MOF copy (Social Proof)

        return {
            audiences,
            creatives
        };
    }

    private createAudience(
        input: CampaignInput,
        name: string,
        stage: 'TOF' | 'MOF' | 'BOF',
        days: number,
        score: number,
        type: 'PageView' | 'AddToCart' | 'Purchase'
    ): MetaAudience {
        return {
            type: 'Retargeting',
            name: name,
            funnelStage: stage,
            priorityScore: score,
            geo: {
                city: input.geo,
                radius: 25,
                unit: 'mile'
            },
            retargeting: {
                source: 'Website',
                windowDays: days,
                engagementType: type
            },
            audienceSizeEstimate: 1000 // Placeholder
        };
    }

    private generateCreative(input: CampaignInput, context: 'Abandoned Cart' | 'General Retargeting'): MetaCreative {
        const offer = input.offer;
        const business = input.businessName;

        if (context === 'Abandoned Cart') {
            return {
                name: 'Retargeting - Abandoned Cart',
                assetType: 'IMAGE' as const,
                primaryText: [
                    `Did you forget something? Your ${input.services[0]} is waiting! Complete your order now before it sells out.`,
                    `Come back and get ${offer}. We saved your cart for you!`,
                    `Still interested in ${input.services[0]}? Here is a little nudge to help you decide: ${offer}.`
                ],
                headlines: [
                    'Forgot Something?',
                    `Complete Your Order`,
                    `Don't Miss Out`
                ],
                callToAction: 'SHOP_NOW'
            };
        }

        // General Retargeting (Website Visitors) - Testimonials & Urgency
        return {
            name: 'Retargeting - General',
            assetType: 'IMAGE' as const,
            primaryText: [
                `Still thinking about it? See why ${input.geo} locals rate ${business} 5 stars. ⭐⭐⭐⭐⭐`,
                `Ready to move forward? Claim your ${offer} today. Spots are filling up fast!`,
                `Don't settle for less. Choose ${business} for your ${input.services[0]} needs.`
            ],
            headlines: [
                'Still Interested?',
                `${business}: 5-Star Service`,
                `Claim Your ${offer}`
            ],
            callToAction: input.vertical === 'E-commerce' ? 'SHOP_NOW' : 'BOOK_NOW'
        };
    }
}

export const metaRetargetingEngine = new MetaRetargetingEngine();
