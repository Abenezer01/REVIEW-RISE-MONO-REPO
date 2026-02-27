import { NormalizedGbpProfile, AuditIssue, EvaluatorResult, KeywordGapSummary } from './types';

export interface KeywordEvaluatorResult extends EvaluatorResult {
    score: number;
    issues: AuditIssue[];
    gapSummary: KeywordGapSummary;
}

export class KeywordEvaluator {
    evaluate(profile: NormalizedGbpProfile, rawProfile: any, targetKeywords: string[]): KeywordEvaluatorResult {
        const issues: AuditIssue[] = [];
        let score = 100;

        // 1. Prepare Text Source
        const textParts = [
            profile.description || '',
            profile.category || '',
            // Add services if available in rawProfile
            ...(rawProfile.serviceItems?.map((s: any) => s.serviceTypeId || '') || []),
        ];

        const fullText = textParts.join(' ').toLowerCase();

        // 2. Extraction (1-gram and 2-gram)
        const words = fullText
            .split(/[\s,.-]+/)
            .map(w => w.trim())
            .filter(w => w.length > 2)
            .filter(w => !['this', 'that', 'with', 'from', 'your', 'have', 'best', 'and', 'the', 'for'].includes(w));

        const oneGrams = new Set(words);
        const twoGrams = new Set<string>();

        for (let i = 0; i < words.length - 1; i++) {
            twoGrams.add(`${words[i]} ${words[i + 1]}`);
        }

        const extractedKeywords = new Set([...oneGrams, ...twoGrams]);

        // 3. Gap Analysis
        const missingKeywords = targetKeywords.filter(target => {
            const t = target.toLowerCase();
            return !extractedKeywords.has(t) && !fullText.includes(t);
        });

        const missingCount = missingKeywords.length;
        const totalTargets = targetKeywords.length || 1;

        if (missingCount > 0) {
            const penaltyPerMissing = Math.min(10, 100 / totalTargets);
            score -= (missingCount * penaltyPerMissing);

            missingKeywords.forEach(keyword => {
                const placementInfo = this.getPlacementGuidance(keyword, profile, rawProfile);
                issues.push({
                    code: `kw_gap_${keyword.replace(/[^a-zA-Z0-9]/g, '_')}`,
                    severity: 'opportunity',
                    title: `Missing Keyword: "${keyword}"`,
                    whyItMatters: `Potential customers are searching for "${keyword}", but it's not found in your profile.`,
                    recommendation: placementInfo.text,
                    nextAction: placementInfo.nextAction,
                    recommendedPlacement: placementInfo.placements,
                    impactWeight: 5
                });
            });
        }

        return {
            score: Math.max(0, Math.round(score)),
            issues,
            gapSummary: {
                missingCount,
                topPriorityKeywords: missingKeywords.slice(0, 5),
                extractedKeywords: Array.from(extractedKeywords)
            }
        };
    }

    private getPlacementGuidance(keyword: string, profile: NormalizedGbpProfile, rawProfile: any): { text: string, placements: string[], nextAction: string } {
        const descLen = (profile.description || '').length;
        const hasServices = Array.isArray(rawProfile.serviceItems) && rawProfile.serviceItems.length > 0;

        // Logic based on requirements:
        // If description length < 750 chars → Suggest: Add to description
        // If service list exists → Suggest: Add to services
        // If posts available → Suggest: Add to next post (assuming posts available if not empty, but we don't have posts data yet, defaulting to suggestion)
        // If Q&A available → Suggest: Add to FAQ (same assumption)

        const placements: string[] = [];
        let primaryAction = '';

        if (descLen < 750) {
            placements.push('Description');
            primaryAction = `Edit description to include "${keyword}".`;
        }

        if (hasServices) {
            placements.push('Services');
            if (!primaryAction) primaryAction = `Add a new service called "${keyword}".`;
        }

        // Always suggest Posts/Q&A as secondary options since they are dynamic
        placements.push('Posts');
        placements.push('Q&A');

        if (!primaryAction) {
            primaryAction = `Create a post about "${keyword}".`;
        }

        return {
            text: `Add "${keyword}" to your ${placements.join(', ')}.`,
            placements,
            nextAction: primaryAction
        };
    }
}

export const keywordEvaluator = new KeywordEvaluator();
