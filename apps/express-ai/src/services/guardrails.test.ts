
import { navGuardrailsService } from './nav-guardrails.service';
import { CreativeConcept } from '@platform/contracts';

// Mock dependencies if needed, but this valid logic is pure.

describe('NavGuardrailsService', () => {
    
    const mockConcept: CreativeConcept = {
        id: '1',
        headline: 'Short Headline',
        primaryText: 'This is a reasonable description.',
        visualIdea: 'A happy person',
        cta: 'Sign Up',
        formatPrompts: { feed: '', story: '', reel: '' }
    };

    describe('validateGoogleAds', () => {
        it('should pass valid RSA assets', () => {
            const result = navGuardrailsService.validateGoogleAds(mockConcept);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail headline > 30 chars', () => {
            const badConcept = { ...mockConcept, headline: 'This headline is definitely way too long for Google Ads' };
            const result = navGuardrailsService.validateGoogleAds(badConcept);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('exceeds 30 characters');
        });

        it('should fail description > 90 chars', () => {
            const badConcept = { ...mockConcept, primaryText: 'This description is essentially trying to write a novel instead of a concise ad copy which is strictly prohibited by Google Ads limits.' };
            const result = navGuardrailsService.validateGoogleAds(badConcept);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('exceeds 90 characters');
        });
    });

    describe('validateMetaAds', () => {
        it('should warn on long primary text', () => {
            const longText = 'A'.repeat(130);
            const concept = { ...mockConcept, primaryText: longText };
            const result = navGuardrailsService.validateMetaAds(concept);
            expect(result.isValid).toBe(true); // Should still be valid, just warning
            expect(result.warnings).toHaveLength(1);
        });
    });

    describe('validateSafety', () => {
        it('should detect prohibited terms', () => {
            const concept = { ...mockConcept, primaryText: 'Learn how to make millions overnight!' };
            const result = navGuardrailsService.validateSafety(concept);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('prohibited term');
        });

        it('should respect brand banned phrases', () => {
            const profile = { 
                toneType: 'Professional' as any, 
                bannedPhrases: ['cheap', 'freebie'] 
            };
            const concept = { ...mockConcept, headline: 'Get a cheap deal' };
            const result = navGuardrailsService.validateSafety(concept, profile);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('banned brand phrase');
        });
    });
});
