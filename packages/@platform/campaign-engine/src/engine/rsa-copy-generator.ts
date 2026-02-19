import { CampaignInput } from '../schema/campaign-plan';

export interface RASAssets {
    headlines: string[];
    descriptions: string[];
}

export interface RSAValidationResult {
    isValid: boolean;
    warnings: string[];
    score: number;
}

export class RSACopyGenerator {

    public generateAssets(input: CampaignInput, adGroupName: string, funnelStage?: 'TOF' | 'MOF' | 'BOF'): RASAssets {
        const headlines: string[] = [];
        const descriptions: string[] = [];

        // 1. Headlines (15 max, 30 chars max)

        // Brand & Vertical
        this.addAsset(headlines, input.businessName, 30);
        this.addAsset(headlines, `${input.vertical} Experts`, 30);

        // Offer & Value
        this.addAsset(headlines, input.offer, 30);

        // Service / Ad Group specific (Derived from name or inputs)
        // Simple heuristic: If adGroupName contains a service name, use it.
        // For general generation, we use services.
        input.services.slice(0, 3).forEach(s => this.addAsset(headlines, `Best ${s}`, 30));

        // Geo
        // The Prompt requires "Geo validation warning if missing in at least one headine"
        if (input.geo) {
            this.addAsset(headlines, `Serving ${input.geo}`, 30);
            this.addAsset(headlines, `${input.geo} ${input.vertical}`, 30);
        }

        // Funnel-stage-aware headlines
        if (funnelStage === 'TOF') {
            // Educational/Problem-aware
            this.addAsset(headlines, 'Learn More', 30);
            this.addAsset(headlines, 'Expert Advice', 30);
        } else if (funnelStage === 'BOF') {
            // Commercial/CTA-focused
            this.addAsset(headlines, 'Call Now', 30);
            this.addAsset(headlines, 'Book Online', 30);
            this.addAsset(headlines, 'Get a Free Quote', 30);
        }

        // Trust
        this.addAsset(headlines, 'Trusted & Verified', 30);
        this.addAsset(headlines, '5-Star Rated', 30);
        this.addAsset(headlines, 'Satisfaction Guaranteed', 30);

        // CTA Headlines (if not BOF)
        if (funnelStage !== 'BOF') {
            this.addAsset(headlines, 'Call Now', 30);
            this.addAsset(headlines, 'Book Online', 30);
            this.addAsset(headlines, 'Get a Free Quote', 30);
        }

        // Fillers if under 15
        const fillers = ['Open 24/7', 'Fast Response', 'Local Experts', 'Affordable Rates'];
        fillers.forEach(f => {
            if (headlines.length < 15) this.addAsset(headlines, f, 30);
        });


        // 2. Descriptions (4 max, 90 chars max)

        // Description 1: Value Prop + Offer
        this.addAsset(descriptions, `Top Rated ${input.vertical} in ${input.geo || 'Your Area'}. ${input.offer}. Call Us Today!`, 90);

        // Description 2: Problem/Solution
        if (input.painPoints && input.painPoints.length > 0) {
            this.addAsset(descriptions, `Struggling with ${input.painPoints[0]}? We fix it fast. Reliable & Affordable ${input.vertical}.`, 90);
        } else {
            this.addAsset(descriptions, `Expert ${input.vertical} services you can trust. Professional team ready to help.`, 90);
        }

        // Description 3: Trust + CTA
        this.addAsset(descriptions, `Licensed & Insured. 100% Satisfaction Guarantee. Book your appointment online now.`, 90);

        // Description 4: Variety
        this.addAsset(descriptions, `Same Day Service Available. Don't wait, get the quality service you deserve.`, 90);

        return {
            headlines: headlines.slice(0, 15),
            descriptions: descriptions.slice(0, 4)
        };
    }

    public validateAssets(assets: RASAssets, input: CampaignInput): RSAValidationResult {
        const warnings: string[] = [];
        let score = 100;

        // Check Counts
        if (assets.headlines.length < 3) {
            warnings.push("Too few headlines (min 3).");
            score -= 50;
        }
        if (assets.descriptions.length < 2) {
            warnings.push("Too few descriptions (min 2).");
            score -= 50;
        }

        // Check Lengths
        const longHeadlines = assets.headlines.filter(h => h.length > 30);
        if (longHeadlines.length > 0) {
            warnings.push(`${longHeadlines.length} headlines exceed 30 chars.`);
            score -= 10 * longHeadlines.length;
        }

        const longDescriptions = assets.descriptions.filter(d => d.length > 90);
        if (longDescriptions.length > 0) {
            warnings.push(`${longDescriptions.length} descriptions exceed 90 chars.`);
            score -= 10 * longDescriptions.length;
        }

        // Check Geo Presence (Headline)
        if (input.geo) {
            const hasGeo = assets.headlines.some(h => h.toLowerCase().includes(input.geo!.toLowerCase()));
            if (!hasGeo) {
                warnings.push("No Geo signal found in headlines.");
                score -= 20;
            }
        }

        // Check CTA Presence
        const ctaKeywords = ['call', 'book', 'get', 'contact', 'buy', 'shop', 'visit'];
        const hasCta = assets.headlines.some(h => ctaKeywords.some(k => h.toLowerCase().includes(k))) ||
            assets.descriptions.some(d => ctaKeywords.some(k => d.toLowerCase().includes(k)));

        if (!hasCta) {
            warnings.push("No clear CTA found in assets.");
            score -= 10;
        }

        return {
            isValid: warnings.length === 0,
            warnings,
            score: Math.max(0, score)
        };
    }

    private addAsset(list: string[], text: string, maxLength: number) {
        if (text && text.length <= maxLength && !list.includes(text)) {
            list.push(text);
        }
    }
}

export const rsaCopyGenerator = new RSACopyGenerator();
