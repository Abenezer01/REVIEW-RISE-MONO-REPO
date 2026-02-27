import { NormalizedGbpProfile, AuditIssue, EvaluatorResult, CategoryIntelligence } from './types';

export interface CategoryEvaluatorResult extends EvaluatorResult {
    intelligence: CategoryIntelligence;
}

export class CategoryEvaluator {
    evaluate(profile: NormalizedGbpProfile, _rawProfile: any): CategoryEvaluatorResult {
        const issues: AuditIssue[] = [];
        let score = 100;

        const intelligence: CategoryIntelligence = {
            primaryCategory: profile.category || '',
            isGeneric: false,
            suggestedAlternatives: []
        };

        if (!profile.category) {
            return { score: 0, issues: [], intelligence };
        }

        const primaryCategory = profile.category;

        // A. Generic Category Warning
        const genericTerms = ["Consultant", "Business", "Services", "Company", "Agency"];
        const isGeneric = genericTerms.some(term => primaryCategory.includes(term));

        if (isGeneric) {
            score -= 30;
            const suggested = ["Marketing Consultant", "Software Company", "Design Agency"]; // Examples

            intelligence.isGeneric = true;
            intelligence.suggestedAlternatives = suggested;

            issues.push({
                code: 'cat_generic_warning',
                severity: 'warning',
                title: 'Generic Primary Category',
                whyItMatters: 'Generic categories like "Consultant" or "Agency" are highly competitive and less relevant for specific searches.',
                recommendation: `Choose a more specific primary category (e.g., "Marketing Consultant" instead of "Consultant").`,
                nextAction: 'Update your primary category to be more specific.',
                impactWeight: 7,
                suggestedCategories: suggested
            });
        }

        // B. Category Mismatch
        const description = (profile.description || '').toLowerCase();
        const categoryLower = primaryCategory.toLowerCase();

        if (description.includes('seo') && !categoryLower.includes('seo') && !categoryLower.includes('internet marketing')) {
            score -= 20;
            const suggested = ["Internet Marketing Service", "SEO Agency"];

            if (!intelligence.suggestedAlternatives.length) {
                intelligence.suggestedAlternatives = suggested;
            } else {
                intelligence.suggestedAlternatives.push(...suggested);
            }

            issues.push({
                code: 'cat_mismatch_seo',
                severity: 'opportunity',
                title: 'Category Missed Opportunity',
                whyItMatters: 'Your description highlights SEO services, but your category does not reflect this.',
                recommendation: 'Consider adding "Internet Marketing Service" or "SEO Agency" as a secondary category.',
                nextAction: 'Add relevant secondary categories.',
                impactWeight: 6,
                suggestedCategories: suggested
            });
        }

        return { score: Math.max(0, score), issues, intelligence };
    }
}

export const categoryEvaluator = new CategoryEvaluator();
