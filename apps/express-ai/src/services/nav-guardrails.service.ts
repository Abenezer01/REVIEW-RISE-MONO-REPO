
import { CreativeConcept, CreativeConceptInput, BrandToneProfile } from '@platform/contracts';

export class NavGuardrailsService {

    // --- Google Ads (RSA) Constraints ---
    // Headlines: 30 chars max. Descriptions: 90 chars max.
    // Minimum Assets: 3 Headlines, 2 Descriptions (Google rec: 15/4)
    public validateGoogleAds(concept: CreativeConcept): { isValid: boolean; warnings: string[]; errors: string[] } {
        const warnings: string[] = [];
        const errors: string[] = [];

        // Check Individual Headline Length
        if (concept.headline && concept.headline.length > 30) {
             errors.push(`Headline exceeds 30 characters: "${concept.headline}" (${concept.headline.length})`);
        }

        // Check Primary Text (used as Description) Length
        if (concept.primaryText && concept.primaryText.length > 90) {
            errors.push(`Description (Primary Text) exceeds 90 characters: "${concept.primaryText}" (${concept.primaryText.length})`);
        }

        return {
            isValid: errors.length === 0,
            warnings,
            errors
        };
    }

    public validateAssetCount(headlines: string[], descriptions: string[]): { isValid: boolean; warnings: string[] } {
        const warnings: string[] = [];

        if (headlines.length < 3) {
            warnings.push(`Google recommends at least 3 headlines (Current: ${headlines.length}). Optimal: 15.`);
        }
        if (headlines.length > 15) {
            warnings.push(`Maximum 15 headlines allowed (Current: ${headlines.length}).`);
        }

        if (descriptions.length < 2) {
            warnings.push(`Google recommends at least 2 descriptions (Current: ${descriptions.length}). Optimal: 4.`);
        }
        if (descriptions.length > 4) {
            warnings.push(`Maximum 4 descriptions allowed (Current: ${descriptions.length}).`);
        }

        return { isValid: warnings.length === 0, warnings };
    }

    // --- Meta Ads Constraints ---
    // Primary Text: 125 chars recommended (can be longer but truncates).
    // Headline: 40 chars recommended.
    // Description: 30 chars recommended.
    public validateMetaAds(concept: CreativeConcept): { isValid: boolean; warnings: string[] } {
        const warnings: string[] = [];
        
        // Meta doesn't hard reject, but truncation is bad UX.
        if (concept.headline && concept.headline.length > 40) {
            warnings.push(`Headline exceeds 40 characters (may truncate): "${concept.headline}"`);
        }

        if (concept.primaryText && concept.primaryText.length > 125) {
            warnings.push(`Primary Text exceeds 125 characters (optimal for feed): "${concept.primaryText.substring(0, 20)}..."`);
        }

        return { isValid: true, warnings };
    }

    // --- Safety & Quality Checks ---
    public validateSafety(concept: CreativeConcept, profile?: BrandToneProfile): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        const textToCheck = `${concept.headline} ${concept.primaryText} ${concept.visualIdea}`.toLowerCase();

        // 1. Prohibited Categories (Basic Keywords - in production use AI moderation model)
        const prohibitedTerms = ['guarantee revenue', 'make millions', 'lose 10kg overnight', 'cbd', 'crypto', 'gambling'];
        
        prohibitedTerms.forEach(term => {
            if (textToCheck.includes(term)) {
                errors.push(`Content contains prohibited term: "${term}". Review platform policies.`);
            }
        });

        // 2. Brand Tone Compliance (Negative Constraints)
        if (profile?.bannedPhrases) {
            profile.bannedPhrases.forEach(phrase => {
                if (textToCheck.includes(phrase.toLowerCase())) {
                    errors.push(`Content contains banned brand phrase: "${phrase}"`);
                }
            });
        }

        return { isValid: errors.length === 0, errors };
    }
}

export const navGuardrailsService = new NavGuardrailsService();
