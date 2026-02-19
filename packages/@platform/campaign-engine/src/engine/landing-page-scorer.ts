import { CampaignInput } from '../schema/campaign-plan';
import * as cheerio from 'cheerio';

export interface LandingPageAnalysis {
    messageMatchScore: number;
    ctaStrengthScore: number;
    trustSignalScore: number;
    mobileReadinessFlag: boolean;
    trustSignalsDetected: string[];
    missingElements: string[];

    // Google Ads Quality Score & Strategy
    qualityScorePrediction: number; // 1-10
    conversionReadinessScore: number; // 1-10
    frictionScore: number; // 1-10 (lower is better)
    recommendations: string[];
    landingPageType: 'lead_gen' | 'ecommerce' | 'homepage' | 'informational';
    adToLandingConsistencyScore: number; // 1-10

    recommendedTemplate?: LandingPageTemplate;
}

export interface LandingPageTemplate {
    headline: string;
    subheadline: string;
    cta: string;
    sections: string[];
}

export class LandingPageScorer {

    public async analyze(input: CampaignInput): Promise<LandingPageAnalysis> {
        if (!input.websiteUrl) {
            return this.generateTemplate(input);
        }

        try {
            // Real website crawling
            const html = await this.fetchPage(input.websiteUrl);
            const $ = cheerio.load(html);

            return this.analyzeRealPage($, input);
        } catch (error) {
            console.warn('Failed to crawl website, using heuristic fallback:', error);
            return this.analyzeHeuristic(input);
        }
    }

    private async fetchPage(url: string): Promise<string> {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ReviewRise-Blueprint/1.0)'
            },
            signal: AbortSignal.timeout(10000) // 10s timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.text();
    }

    private analyzeRealPage($: cheerio.CheerioAPI, input: CampaignInput): LandingPageAnalysis {
        const missing: string[] = [];
        const recommendations: string[] = [];
        let messageMatchScore = 2; // Start from low base
        let ctaStrengthScore = 3;
        let trustSignalScore = 3;
        let frictionScore = 2; // Base friction
        let conversionReadinessScore = 2;

        const pageText = $('body').text().toLowerCase();
        const html = $.html().toLowerCase();

        // 1. Mobile Optimization Check
        const viewport = $('meta[name="viewport"]').attr('content');
        const mobileReadinessFlag = !!viewport && viewport.includes('width=device-width');
        if (!mobileReadinessFlag) {
            missing.push('Mobile viewport meta tag');
            recommendations.push('Add a mobile-responsive viewport meta tag to improve mobile experience.');
            frictionScore += 2;
        }

        // 2. Message Match Intelligence (Deeper)
        const h1 = $('h1').text().toLowerCase();
        const h2s = $('h2').text().toLowerCase();
        const title = $('title').text().toLowerCase();
        const metaDesc = $('meta[name="description"]').attr('content')?.toLowerCase() || '';
        const urlSlug = input.websiteUrl?.toLowerCase() || '';

        input.services.forEach(service => {
            const s = service.toLowerCase();
            if (h1.includes(s)) messageMatchScore += 3;
            if (title.includes(s)) messageMatchScore += 2;
            if (metaDesc.includes(s)) messageMatchScore += 2;
            if (h2s.includes(s)) messageMatchScore += 1;
            if (urlSlug.includes(s)) messageMatchScore += 1;
        });

        if (messageMatchScore < 7) {
            missing.push('Service keywords in headline');
            recommendations.push(`Include your core service '${input.services[0]}' in your main H1 headline.`);
        }

        // 3. CTA & Conversion Detection
        const highIntentKws = ['get quote', 'book now', 'call now', 'schedule', 'request', 'buy now'];
        const lowIntentKws = ['learn more', 'read more', 'explore', 'contact'];

        const ctaElements = $('button, a.btn, a[class*="button"], input[type="submit"]');
        const ctaText = ctaElements.text().toLowerCase();

        const hasHighIntent = highIntentKws.some(kw => ctaText.includes(kw));
        const hasLowIntent = lowIntentKws.some(kw => ctaText.includes(kw));

        if (hasHighIntent) {
            ctaStrengthScore += 5;
            conversionReadinessScore += 4;
        } else if (hasLowIntent) {
            ctaStrengthScore += 2;
            conversionReadinessScore += 2;
            recommendations.push('Upgrade Low-intent CTAs (Learn More) to Action-oriented CTAs (Get Quote).');
        } else {
            missing.push('Clear CTA button');
            recommendations.push('Add a prominent, high-contrast Call-to-Action button above the fold.');
            ctaStrengthScore -= 2;
        }

        // Form Detection
        const forms = $('form');
        const inputs = $('form input').length;
        if (forms.length > 0) {
            conversionReadinessScore += 2;
            if (inputs > 5) {
                frictionScore += 2;
                recommendations.push('Reduce form fields (currently >5) to lower conversion friction.');
            }
        } else {
            missing.push('Lead capture form');
            recommendations.push('Embed a simple lead capture form directly on the page.');
        }

        // Phone call
        if ($('a[href^="tel:"]').length > 0) {
            conversionReadinessScore += 1;
        } else {
            missing.push('Click-to-call button');
            recommendations.push('Add a click-to-call phone link for mobile users.');
        }

        // 4. Trust Signals Detection (Structured)
        const trustSignalsDetected: string[] = [];
        if (pageText.includes('ssl') || pageText.includes('secure')) trustSignalsDetected.push('SSL/Security mention');
        if (pageText.includes('guarantee') || pageText.includes('money back')) trustSignalsDetected.push('Guarantee');
        if (pageText.includes('certified') || pageText.includes('accredited')) trustSignalsDetected.push('Certification');
        if ($('img[alt*="trust"], img[alt*="badge"], img[alt*="certified"]').length > 0) trustSignalsDetected.push('Trust badges');
        if (pageText.includes('testimonial') || pageText.includes('review')) trustSignalsDetected.push('Social proof');

        // Advanced trust
        if (pageText.match(/\b(4\.\d|5\/5|★★★★★)\b/)) trustSignalsDetected.push('Star Rating Displayed');
        if (html.includes('application/ld+json')) trustSignalsDetected.push('Structured Data (JSON-LD)');
        if (pageText.match(/since \d{4}/)) trustSignalsDetected.push('Longevity (Since 20XX)');

        // Local relevance
        if (input.geo) {
            const geoKeyword = input.geo.split(',')[0].toLowerCase();
            if (pageText.includes(geoKeyword)) {
                trustSignalsDetected.push('Local Relevance (Geo Mention)');
                messageMatchScore += 1;
            }
        }

        trustSignalScore += trustSignalsDetected.length;
        if (trustSignalsDetected.length < 3) {
            missing.push('Trust signals (badges, testimonials)');
            recommendations.push('Add social proof elements like customer testimonials or industry awards.');
        }

        // 5. Performance/Friction
        const scripts = $('script').length;
        if (scripts > 20) frictionScore += 2;

        // 6. Final Scores Calculation
        const finalMessageMatch = Math.min(messageMatchScore, 10);
        const finalCtaStrength = Math.min(ctaStrengthScore, 10);
        const finalTrustSignal = Math.min(trustSignalScore, 10);
        const finalFriction = Math.min(frictionScore, 10);
        const finalConversion = Math.min(conversionReadinessScore, 10);

        // Google Ads Quality Score Prediction
        // Formula: (Match * 0.4) + (Mobile ? 2 : 0) + (CTA * 0.2) + (Trust * 0.2)
        const qualityScorePrediction = Math.round(
            (finalMessageMatch * 0.4) +
            (mobileReadinessFlag ? 2 : 0) +
            (finalCtaStrength * 0.2) +
            (finalTrustSignal * 0.2)
        );

        // Determine Landing Page Type
        let landingPageType: 'lead_gen' | 'ecommerce' | 'homepage' | 'informational' = 'homepage';
        if (html.includes('cart') || html.includes('shop') || html.includes('product')) landingPageType = 'ecommerce';
        else if (forms.length > 0 || html.includes('quote')) landingPageType = 'lead_gen';
        else if (html.includes('blog') || html.includes('article')) landingPageType = 'informational';

        return {
            messageMatchScore: finalMessageMatch,
            ctaStrengthScore: finalCtaStrength,
            trustSignalScore: finalTrustSignal,
            mobileReadinessFlag,
            trustSignalsDetected,
            missingElements: missing,
            qualityScorePrediction: Math.min(Math.max(qualityScorePrediction, 1), 10),
            conversionReadinessScore: finalConversion,
            frictionScore: finalFriction,
            recommendations: recommendations.slice(0, 5), // Top 5
            landingPageType,
            adToLandingConsistencyScore: finalMessageMatch // For now mapped to match
        };
    }

    private analyzeHeuristic(input: CampaignInput): LandingPageAnalysis {
        return {
            messageMatchScore: 5,
            ctaStrengthScore: 5,
            trustSignalScore: 5,
            mobileReadinessFlag: true,
            trustSignalsDetected: ['Assumed SSL'],
            missingElements: ['Full Scan Failed'],
            qualityScorePrediction: 6,
            conversionReadinessScore: 5,
            frictionScore: 5,
            recommendations: ['Perform a manual check of mobile responsiveness.'],
            landingPageType: 'lead_gen',
            adToLandingConsistencyScore: 5
        };
    }

    private generateTemplate(input: CampaignInput): LandingPageAnalysis {
        return {
            messageMatchScore: 0,
            ctaStrengthScore: 0,
            trustSignalScore: 0,
            mobileReadinessFlag: false,
            trustSignalsDetected: [],
            missingElements: ['URL Not Provided'],
            qualityScorePrediction: 1,
            conversionReadinessScore: 0,
            frictionScore: 10,
            recommendations: ['Provide a landing page URL for deep analysis.'],
            landingPageType: 'homepage',
            adToLandingConsistencyScore: 0,
            recommendedTemplate: {
                headline: `Solve your ${input.painPoints?.[0] || 'problem'} with ${input.businessName}`,
                subheadline: input.offer,
                cta: 'Get Your Free Quote Now',
                sections: ['Hero', 'Benefits', 'Testimonials', 'FAQ', 'CTA']
            }
        };
    }
}

export const landingPageScorer = new LandingPageScorer();
