import { CampaignInput } from '../schema/campaign-plan';
import { MetaCreative } from '../schema/meta-plan';
import { VERTICAL_PROFILES } from '../config/vertical-profiles';

export class MetaCopyGenerator {

    public generateCreative(input: CampaignInput, funnelStage: 'TOF' | 'MOF' | 'BOF'): MetaCreative {
        return {
            primaryText: this.generatePrimaryText(input, funnelStage),
            headlines: this.generateHeadlines(input, funnelStage),
            descriptions: this.generateDescriptions(input, funnelStage),
            callToAction: this.selectCTA(input, funnelStage)
        };
    }

    private generatePrimaryText(input: CampaignInput, stage: string): string[] {
        const texts: string[] = [];
        const painPoint = input.painPoints && input.painPoints.length > 0 ? input.painPoints[0] : 'struggling with your needs';
        const service = input.services[0];
        const offer = input.offer;

        if (stage === 'TOF') {
            // Problem Aware / Educational
            texts.push(`Are you tired of ${painPoint}? We help people just like you find the best ${service}.`);
            texts.push(`Discover a better way to handle your ${service} needs. See why ${input.geo} locals trust us.`);
            texts.push(`3 Signs you might need help with ${service}. Number 1 is usually the most ignored...`); // Curiosity
        } else if (stage === 'MOF') {
            // Solution Aware / Social Proof
            texts.push(`Why choose ${input.businessName} for ${service}? ✅ Local Experts ✅ Trusted Reviews ✅ ${offer}.`);
            texts.push(`Don't settle for less when it comes to ${service}. We've helped hundreds of customers in ${input.geo} solve ${painPoint}.`);
            texts.push(`${input.businessName} vs The Rest. See the difference quality makes for your ${service}.`);
        } else if (stage === 'BOF') {
            // Offer / Urgency
            texts.push(`Limited Time Offer: ${offer}! Claim this deal before it expires. Booking up fast in ${input.geo}.`);
            texts.push(`Ready to fix ${painPoint}? Get ${offer} when you book with ${input.businessName} today.`);
            texts.push(`Last chance to grab ${offer}. Don't miss out on the best ${service} in town.`);
        }

        return texts;
    }

    private generateHeadlines(input: CampaignInput, stage: string): string[] {
        const headlines: string[] = [];
        const offer = input.offer;
        const service = input.services[0];

        if (stage === 'TOF') {
            headlines.push(`Best ${service} in ${input.geo}?`);
            headlines.push(`Struggling with ${service}?`);
            headlines.push(`New ${service} Solution`);
        } else if (stage === 'MOF') {
            headlines.push(`${input.businessName}: Top Rated`);
            headlines.push(`See Our ${service} Results`);
            headlines.push(`Why Locals Love Us`);
        } else if (stage === 'BOF') {
            headlines.push(`${offer} (Ends Soon)`);
            headlines.push(`Get ${offer} Now`);
            headlines.push(`Book Your ${service} Today`);
        }

        return headlines;
    }

    private generateDescriptions(input: CampaignInput, stage: string): string[] {
        // Newsfeed link descriptions (often hidden, keep short)
        if (stage === 'BOF') {
            return ['⭐⭐⭐⭐⭐ 5-Star Rated Service', 'Limited availability. Book now.'];
        }
        return [`Serving ${input.geo}`, 'Learn more today.'];
    }

    private selectCTA(input: CampaignInput, stage: string): string {
        if (stage === 'TOF') return 'LEARN_MORE';
        if (stage === 'MOF') return input.vertical === 'E-commerce' ? 'SHOP_NOW' : 'LEARN_MORE';
        if (stage === 'BOF') {
            if (input.vertical === 'E-commerce') return 'SHOP_NOW';
            if (input.vertical === 'Local Service') return 'GET_OFFER'; // or BOOK_NOW if available
            return 'SIGN_UP';
        }
        return 'LEARN_MORE';
    }
}

export const metaCopyGenerator = new MetaCopyGenerator();
